import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, content, userId } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = "https://zbsxyvclylkclixwsytr.supabase.co";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      throw new Error('Missing Supabase service role key');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define abusive language patterns
    const abusivePatterns = [
      /\b(fuck|shit|damn|hell|bitch|asshole|bastard|cunt|piss|whore|slut)\b/gi,
      /\b(kill yourself|kys|die|suicide|murder|bomb|terrorist|nazi|hitler)\b/gi,
      /\b(rape|molest|abuse|torture|violence|harm|hurt|attack)\b/gi,
      /\b(stupid|idiot|moron|retard|loser|ugly|fat|worthless)\b/gi,
    ];

    // Define dangerous content patterns
    const dangerousPatterns = [
      /\b(bomb|explosive|weapon|gun|knife|poison|drug|suicide)\b/gi,
      /\b(hate|racism|discrimination|prejudice|bigot|extremist)\b/gi,
      /\b(threat|violence|harm|kill|murder|death|torture)\b/gi,
      /\b(illegal|crime|criminal|fraud|scam|hack|blackmail)\b/gi,
    ];

    let violations: { type: string; severity: string; confidence: number }[] = [];

    // Check for abusive language
    for (const pattern of abusivePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        const severity = matches.length > 2 ? 'high' : matches.length > 1 ? 'medium' : 'low';
        violations.push({
          type: 'abusive_language',
          severity,
          confidence: 0.85
        });
        break;
      }
    }

    // Check for dangerous content
    for (const pattern of dangerousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        const severity = matches.length > 1 ? 'critical' : 'high';
        violations.push({
          type: 'dangerous_content',
          severity,
          confidence: 0.90
        });
        break;
      }
    }

    // If violations found, log them and notify
    if (violations.length > 0) {
      const mostSevereViolation = violations.reduce((prev, current) => {
        const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
        return (severityOrder[current.severity] || 0) > (severityOrder[prev.severity] || 0) ? current : prev;
      });

      // Insert moderation record
      const { data: moderationRecord, error: moderationError } = await supabase
        .from('chat_moderation')
        .insert({
          message_id: messageId,
          user_id: userId,
          flagged_content: content,
          violation_type: mostSevereViolation.type,
          severity_level: mostSevereViolation.severity,
          ai_confidence: mostSevereViolation.confidence
        })
        .select()
        .single();

      if (moderationError) {
        console.error('Error inserting moderation record:', moderationError);
        throw moderationError;
      }

      // Get all admins and moderators
      const { data: moderators, error: moderatorsError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'moderator']);

      if (moderatorsError) {
        console.error('Error fetching moderators:', moderatorsError);
      } else {
        // Send notifications to moderators and admins
        const notifications = moderators.map(mod => ({
          moderation_id: moderationRecord.id,
          recipient_id: mod.user_id,
          message: `Flagged message detected: ${mostSevereViolation.type} (${mostSevereViolation.severity} severity). Content: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`
        }));

        const { error: notificationError } = await supabase
          .from('moderation_notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('Error sending notifications:', notificationError);
        }
      }

      // Send warning to user
      const warningMessages: Record<string, string> = {
        abusive_language: "Your message contained inappropriate language and has been flagged.",
        dangerous_content: "Your message contained potentially dangerous content and has been flagged."
      };

      const { error: warningError } = await supabase
        .from('user_warnings')
        .insert({
          user_id: userId,
          moderation_id: moderationRecord.id,
          warning_message: warningMessages[mostSevereViolation.type] || "Your message has been flagged for review.",
          warning_type: mostSevereViolation.type
        });

      if (warningError) {
        console.error('Error sending user warning:', warningError);
      }

      return new Response(JSON.stringify({ 
        flagged: true, 
        violations,
        severity: mostSevereViolation.severity,
        moderationId: moderationRecord.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ flagged: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-message function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});