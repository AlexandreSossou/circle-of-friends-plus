import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const usePostVisibility = (postId: string, hasImage: boolean) => {
  const { user } = useAuth();

  // Check if the post should be visible to current user
  const { data: isVisible = true } = useQuery({
    queryKey: ['post-visibility', postId, user?.id, hasImage],
    queryFn: async () => {
      if (!user || !postId || !hasImage) return true;
      
      // Check if there are any pending consent requests for this post
      const { data: consentRequests, error } = await supabase
        .from('image_consent')
        .select('consent_status, tagged_user_id')
        .eq('post_id', postId);

      if (error) {
        console.error('Error checking post consent:', error);
        return true; // Default to visible on error
      }

      // If no consent requests exist, post is visible
      if (!consentRequests || consentRequests.length === 0) return true;

      // If current user is tagged, they can see the post regardless of consent status
      const isUserTagged = consentRequests.some(request => request.tagged_user_id === user.id);
      if (isUserTagged) return true;

      // For other users, all consent requests must be approved
      return consentRequests.every(request => request.consent_status === 'approved');
    },
    enabled: !!user && !!postId
  });

  return { isVisible };
};