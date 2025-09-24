import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const usePostImageConsent = (postId: string) => {
  const { user } = useAuth();

  // Check if current user has any pending consent for this post's image
  const { data: hasConsent = true } = useQuery({
    queryKey: ['post-image-consent', postId, user?.id],
    queryFn: async () => {
      if (!user) return true;
      
      const { data, error } = await supabase
        .from('image_consent')
        .select('consent_status')
        .eq('post_id', postId)
        .eq('tagged_user_id', user.id);

      if (error) throw error;

      // If no consent record exists, image is visible
      if (!data || data.length === 0) return true;

      // Check if all consent requests are approved
      return data.every(consent => consent.consent_status === 'approved');
    },
    enabled: !!user && !!postId
  });

  return { hasConsent };
};