import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced patterns for abusive content detection with character substitution handling
const ABUSIVE_PATTERNS = [
  // Harassment and bullying (with character substitutions)
  /\b(k[i!1l]ll?\s*y[o0u]*r?s?[e3]lf|ky[s5]|g[o0]\s*d[i!1][e3]|n[e3]ck\s*y[o0u]*r?s?[e3]lf)\b/gi,
  /\b(w[o0]rthl[e3][s5][s5]|p[a@]th[e3]t[i!1]c|l[o0][s5][e3]r|fr[e3][a@]k)\b.*\b(y[o0u]|[a@]r[e3]|r)\b/gi,
  /\b([s5]hut\s*up|[s5]tfu)\b.*\b(b[i!1]tch|wh[o0]r[e3]|[s5]lut)\b/gi,
  
  // Sexual harassment (with obfuscation)
  /\b([s5][e3]nd\s*nud[e3][s5]?|[s5]h[o0]w\s*m[e3]\s*y[o0]ur|w[a@]nt\s*t[o0]\s*[s5][e3][e3]\s*y[o0]ur)\b/gi,
  /\b(d[i!1]ck\s*p[i!1]c|nud[e3]\s*p[i!1]c|[s5][e3]x\s*ch[a@]t|h[o0]rny)\b/gi,
  /\b(d[a@]ddy|m[a@][s5]t[e3]r)\b.*\b(g[o0][o0]d\s*g[i!1]rl|b[a@]d\s*g[i!1]rl)\b/gi,
  
  // Hate speech with leetspeak and substitutions
  /\b(f[a@4][g9]+[o0]t|n[i!1][g9]+[e3]r|r[e3]t[a@]rd|tr[a@]nny)\b/gi,
  /\b([s5][a@]nd\s*n[i!1][g9]+[e3]r|t[o0]w[e3]l\s*h[e3][a@]d|t[e3]rr[o0]r[i!1][s5]t)\b/gi,
  /\b(j[e3]w[s5]?\s*c[o0]ntr[o0]l|wh[i!1]t[e3]\s*p[o0]w[e3]r|14\s*88)\b/gi,
  
  // Threats and violence with substitutions
  /\b([i!1]\s*w[i!1]ll\s*k[i!1]ll|g[o0]nn[a@]\s*k[i!1]ll|g[o0][i!1]ng\s*t[o0]\s*hurt)\b/gi,
  /\b(f[i!1]nd\s*y[o0u]|hunt\s*y[o0u]\s*d[o0]wn|c[o0]m[i!1]ng\s*f[o0]r\s*y[o0u])\b/gi,
  /\b(r[a@]p[e3]\s*y[o0u]|b[e3][a@]t\s*y[o0u]\s*up|fuck\s*y[o0u]\s*up)\b/gi,
  
  // Personal information requests (doxxing attempts)
  /\b(r[e3][a@]l\s*n[a@]m[e3]|h[o0]m[e3]\s*[a@]ddr[e3][s5][s5]|ph[o0]n[e3]\s*numb[e3]r|wh[e3]r[e3]\s*d[o0]\s*y[o0u]\s*l[i!1]v[e3])\b/gi,
  /\b([s5][o0]c[i!1][a@]l\s*[s5][e3]cur[i!1]ty|cr[e3]d[i!1]t\s*c[a@]rd|b[a@]nk\s*[a@]cc[o0]unt)\b/gi,
  
  // Drug-related content with obfuscation
  /\b(buy\s*drug[s5]|[s5][e3]ll\s*drug[s5]|c[o0]c[a@][i!1]n[e3]|h[e3]r[o0][i!1]n|m[e3]th|mdm[a@])\b/gi,
  /\b(drug\s*d[e3][a@]l[e3]r|w[e3][e3]d\s*f[o0]r\s*[s5][a@]l[e3]|p[i!1]ll[s5]\s*f[o0]r\s*[s5][a@]l[e3])\b/gi,
  
  // Spam indicators with character variations
  /\b(cl[i!1]ck\s*h[e3]r[e3]|v[i!1][s5][i!1]t\s*my\s*[s5][i!1]t[e3]|m[a@]k[e3]\s*m[o0]n[e3]y\s*f[a@][s5]t)\b/gi,
  /\b(www\.|https?|\.c[o0]m|\.n[e3]t|\.org)\b.*\b(fr[e3][e3]|w[i!1]n|pr[i!1]z[e3])\b/gi,
  
  // Additional obfuscation patterns
  /(.)\1{4,}/gi, // Repeated characters (aaaaahhhhh)
  /[^\w\s]{3,}/gi, // Multiple special characters together (!!!, @@@)
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

// Enhanced content structure validation with spam detection
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
  
  // Enhanced spam detection with character substitution awareness
  const normalizedContent = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/[0-9]/g, (char) => { // Normalize numbers to letters
      const numToLetter: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g' };
      return numToLetter[char] || char;
    });
    
  const words = normalizedContent.split(/\s+/).filter(word => word.length > 2);
  const wordCounts = new Map<string, number>();
  
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  // Check if any word appears more than 25% of the time (more strict)
  const totalWords = words.length;
  for (const [word, count] of wordCounts) {
    if (count / totalWords > 0.25 && totalWords > 8) {
      errors.push('Excessive repetition detected');
      break;
    }
  }
  
  // Enhanced pattern detection for character repetition
  if (content.match(/(.)\1{4,}/g)) {
    errors.push('Excessive character repetition');
  }
  
  // Check for excessive capitalization (stricter threshold)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 15) {
    errors.push('Excessive capitalization');
  }
  
  // Check for excessive special characters or numbers (obfuscation attempt)
  const specialCharRatio = (content.match(/[^a-zA-Z\s]/g) || []).length / content.length;
  if (specialCharRatio > 0.4 && content.length > 10) {
    errors.push('Suspicious character patterns detected');
  }
  
  // Check for URL/link patterns in suspicious contexts
  if (content.match(/(www\.|https?:\/\/|[a-z]+\.(com|net|org|io|me))/gi)) {
    errors.push('External links not allowed');
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