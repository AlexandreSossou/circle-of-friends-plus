import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentValidationResult {
  success: boolean;
  flagged: boolean;
  violations: string[];
  severityLevel?: string;
  requiresReview?: boolean;
  message?: string;
  errors?: string[];
}

interface UseSecureContentOptions {
  maxLength?: number;
  enableClientSideValidation?: boolean;
  contentType?: 'message' | 'post' | 'comment' | 'profile';
}

export function useSecureContent(options: UseSecureContentOptions = {}) {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  
  const {
    maxLength = 10000,
    enableClientSideValidation = true,
    contentType = 'message'
  } = options;

  // Client-side validation for immediate feedback
  const validateClientSide = (content: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!content || content.trim().length === 0) {
      errors.push('Content cannot be empty');
    }
    
    if (content.length > maxLength) {
      errors.push(`Content exceeds maximum length (${maxLength} characters)`);
    }
    
    // Basic profanity check (client-side only for immediate feedback)
    const basicProfanityPattern = /\b(spam|scam|hack|fraud)\b/gi;
    if (basicProfanityPattern.test(content)) {
      errors.push('Content contains potentially inappropriate language');
    }
    
    // Check for excessive repetition
    const words = content.split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      errors.push('Content appears to be spam (excessive repetition)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Server-side validation using edge function
  const validateContent = async (content: string, userId?: string): Promise<ContentValidationResult> => {
    setIsValidating(true);
    
    try {
      // Client-side validation first if enabled
      if (enableClientSideValidation) {
        const clientValidation = validateClientSide(content);
        if (!clientValidation.isValid) {
          return {
            success: false,
            flagged: true,
            violations: ['client_validation_failed'],
            errors: clientValidation.errors
          };
        }
      }

      // Get current user if not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      }

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Call secure content validation edge function
      const { data, error } = await supabase.functions.invoke('secure-content-validation', {
        body: {
          content,
          userId: currentUserId,
          contentType
        }
      });

      if (error) {
        console.error('Content validation error:', error);
        throw error;
      }

      // Handle flagged content
      if (data.flagged) {
        let toastMessage = 'Your content was flagged for review.';
        
        if (data.severityLevel === 'high') {
          toastMessage = 'Your content violates our community guidelines and has been blocked.';
        } else if (data.severityLevel === 'medium') {
          toastMessage = 'Your content may not meet our community standards. Please review before posting.';
        }

        toast({
          title: "Content Flagged",
          description: toastMessage,
          variant: data.severityLevel === 'high' ? 'destructive' : 'default'
        });
      }

      return data;
      
    } catch (error) {
      console.error('Error validating content:', error);
      
      // Fail securely - if validation fails, consider content as potentially problematic
      toast({
        title: "Validation Error",
        description: "Unable to validate content. Please try again.",
        variant: "destructive"
      });
      
      return {
        success: false,
        flagged: true,
        violations: ['validation_error'],
        message: error.message || 'Content validation failed'
      };
    } finally {
      setIsValidating(false);
    }
  };

  // Sanitize content (basic HTML escaping and cleanup)
  const sanitizeContent = (content: string): string => {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  };

  return {
    validateContent,
    sanitizeContent,
    isValidating,
    validateClientSide: enableClientSideValidation ? validateClientSide : undefined
  };
}