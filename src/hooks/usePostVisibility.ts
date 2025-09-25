import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const usePostVisibility = (postId: string, hasImage: boolean) => {
  const { user } = useAuth();

  // Check if the post should be visible to current user
  const { data: isVisible = true } = useQuery({
    queryKey: ['post-visibility', postId, user?.id, hasImage],
    queryFn: async () => {
      if (!user || !postId) return true;
      
      console.log('Checking post visibility for:', postId, 'hasImage:', hasImage, 'user:', user.id);
      
      // If no image, post is always visible
      if (!hasImage) {
        console.log('No image, post is visible');
        return true;
      }
      
      // Check if there are any pending consent requests for this post
      const { data: consentRequests, error } = await supabase
        .from('image_consent')
        .select('consent_status, tagged_user_id, tagged_by_user_id')
        .eq('post_id', postId);

      if (error) {
        console.error('Error checking post consent:', error);
        return true; // Default to visible on error
      }

      console.log('Consent requests:', consentRequests);

      // If no consent requests exist, post is visible
      if (!consentRequests || consentRequests.length === 0) {
        console.log('No consent requests found, post is visible');
        return true;
      }

      // If current user is the author (tagged by user), they can always see their own post
      const isAuthor = consentRequests.some(request => request.tagged_by_user_id === user.id);
      if (isAuthor) {
        console.log('User is the author, post is visible');
        return true;
      }

      // If current user is tagged and has approved consent, they can see the post
      const userConsentRequest = consentRequests.find(request => request.tagged_user_id === user.id);
      if (userConsentRequest) {
        console.log('User is tagged, consent status:', userConsentRequest.consent_status);
        return userConsentRequest.consent_status === 'approved';
      }

      // For other users (not tagged), all consent requests must be approved
      const allApproved = consentRequests.every(request => request.consent_status === 'approved');
      console.log('User not tagged, all approved:', allApproved);
      return allApproved;
    },
    enabled: !!user && !!postId
  });

  return { isVisible };
};