import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced content validation with multiple security layers
const ABUSIVE_PATTERNS = [
  // Harassment and threats
  /\b(kill\s+you|murder\s+you|death\s+threat|i'll\s+kill|gonna\s+kill)\b/gi,
  /\b(harassment|harass|stalking|stalk|abuse|abusive)\b/gi,
  
  // Sexual content
  /\b(explicit\s+content|sexual\s+content|inappropriate\s+content)\b/gi,
  /\b(nude|naked|sex|sexual|porn|pornography)\b/gi,
  
  // Hate speech
  /\b(racist|racism|homophobic|transphobic|hate\s+speech)\b/gi,
  /\b(nazi|fascist|supremacist)\b/gi,
  
  // Personal information (basic patterns)
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
  /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Credit card pattern
  
  // Spam and scam indicators
  /\b(free\s+money|get\s+rich|click\s+here|limited\s+offer)\b/gi,
  /\b(phishing|scam|fraud|bitcoin\s+generator)\b/gi
];

const DANGEROUS_PATTERNS = [
  // Self-harm and suicide
  /\b(suicide|kill\s+myself|end\s+my\s+life|self\s+harm|cutting)\b/gi,
  /\b(depression|anxiety|mental\s+health)\b/gi,
  
  // Violence and weapons
  /\b(bomb|explosive|weapon|gun|knife|violence)\b/gi,
  /\b(terrorist|terrorism|attack|shooting)\b/gi,
  
  // Illegal activities
  /\b(drug\s+dealing|illegal\s+drugs|trafficking|smuggling)\b/gi,
  /\b(hacking|identity\s+theft|credit\s+card\s+fraud)\b/gi
];

// Content length and format validation
function validateContentStructure(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content || typeof content !== 'string') {
    errors.push('Content must be a non-empty string');
  }
  
  if (content.length === 0) {
    errors.push('Content cannot be empty');
  }
  
  if (content.length > 10000) {
    errors.push('Content exceeds maximum length (10,000 characters)');
  }
  
  // Check for excessive repetition (spam indicator)
  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
    errors.push('Content appears to be spam (excessive repetition)');
  }
  
  // Check for excessive capitalization
  const capitalRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capitalRatio > 0.6 && content.length > 20) {
    errors.push('Content contains excessive capitalization');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// AI-enhanced content analysis
function analyzeContent(content: string) {
  const violations: string[] = [];
  let severityLevel = 'low';
  
  // Check for abusive content
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(content)) {
      violations.push('abusive_language');
      severityLevel = 'medium';
      break;
    }
  }
  
  // Check for dangerous content
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      violations.push('dangerous_content');
      severityLevel = 'high';
      break;
    }
  }
  
  // Calculate confidence score based on multiple factors
  let confidence = 0.7; // Base confidence
  
  if (violations.length > 1) confidence += 0.2;
  if (content.length < 50) confidence -= 0.1; // Short messages harder to analyze
  if (severityLevel === 'high') confidence += 0.15;
  
  confidence = Math.min(0.95, Math.max(0.5, confidence));
  
  return {
    violations,
    severityLevel,
    confidence,
    requiresReview: severityLevel === 'high' || violations.length > 1
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, userId, contentType = 'message' } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate content structure
    const structureValidation = validateContentStructure(content);
    if (!structureValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          flagged: true,
          violations: ['invalid_structure'],
          errors: structureValidation.errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze content for violations
    const analysis = analyzeContent(content);

    // If violations found, log and take action
    if (analysis.violations.length > 0) {
      console.log(`Content violation detected for user ${userId}:`, {
        violations: analysis.violations,
        severity: analysis.severityLevel,
        confidence: analysis.confidence
      });

      // Log moderation record
      const { error: moderationError } = await supabase
        .from('chat_moderation')
        .insert({
          user_id: userId,
          violation_type: analysis.violations[0],
          severity_level: analysis.severityLevel,
          flagged_content: content.substring(0, 500), // Store truncated version
          ai_confidence: analysis.confidence,
          moderator_reviewed: false
        });

      if (moderationError) {
        console.error('Error logging moderation record:', moderationError);
      }

      // Fetch admins and moderators for notification
      const { data: moderators } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'moderator']);

      // Send notifications to moderators if high severity
      if (analysis.severityLevel === 'high' && moderators) {
        const notifications = moderators.map(moderator => ({
          recipient_id: moderator.user_id,
          message: `High severity content violation detected. User ID: ${userId}. Violation: ${analysis.violations.join(', ')}`
        }));

        const { error: notificationError } = await supabase
          .from('moderation_notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('Error sending moderation notifications:', notificationError);
        }
      }

      // Issue warning to user
      const { error: warningError } = await supabase
        .from('user_warnings')
        .insert({
          user_id: userId,
          warning_type: analysis.violations[0],
          warning_message: `Your ${contentType} was flagged for: ${analysis.violations.join(', ')}. Please review our community guidelines.`
        });

      if (warningError) {
        console.error('Error issuing user warning:', warningError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          flagged: true,
          violations: analysis.violations,
          severityLevel: analysis.severityLevel,
          requiresReview: analysis.requiresReview,
          message: 'Content flagged for moderation review'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Content is clean
    return new Response(
      JSON.stringify({
        success: true,
        flagged: false,
        violations: [],
        message: 'Content approved'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in content validation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error during content validation'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});