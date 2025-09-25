import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaggedUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  consent_status: 'pending' | 'approved' | 'denied';
}

export const usePostTaggedUsers = (postId: string) => {
  const { data: taggedUsers = [], isLoading } = useQuery({
    queryKey: ['post-tagged-users', postId],
    queryFn: async () => {
      if (!postId) return [];

      console.log('Fetching tagged users for post:', postId);

      // First get tagged user IDs
      const { data: tagData, error: tagError } = await supabase
        .from('post_tags')
        .select('tagged_user_id')
        .eq('post_id', postId);

      if (tagError) {
        console.error('Error fetching tagged users:', tagError);
        return [];
      }

      console.log('Tagged user data:', tagData);

      if (!tagData || tagData.length === 0) return [];

      // Get profiles for tagged users
      const taggedUserIds = tagData.map(tag => tag.tagged_user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', taggedUserIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return [];
      }

      console.log('Profile data:', profileData);

      // Get consent status for each tagged user
      const taggedUsersWithConsent = await Promise.all(
        (profileData || []).map(async (profile) => {
          const { data: consentData } = await supabase
            .from('image_consent')
            .select('consent_status')
            .eq('post_id', postId)
            .eq('tagged_user_id', profile.id)
            .single();

          console.log(`Consent data for user ${profile.full_name}:`, consentData);

          return {
            id: profile.id,
            full_name: profile.full_name || 'Unknown User',
            avatar_url: profile.avatar_url,
            consent_status: consentData?.consent_status || 'approved' // If no consent record, assume approved
          } as TaggedUser;
        })
      );

      console.log('Final tagged users with consent:', taggedUsersWithConsent);
      return taggedUsersWithConsent;
    },
    enabled: !!postId
  });

  return { taggedUsers, isLoading };
};