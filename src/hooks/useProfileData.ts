
import { useQuery } from "@tanstack/react-query";
import { fetchProfileData, fetchProfilePosts } from "@/services/profile";
import { fetchProfileFriends } from "@/services/profile/fetchFriendsService";
import { Post } from "@/types/profile";

export interface VerificationInfo {
  lastConnection?: string;
  photoVerification?: string;
  moderatorVerification?: string;
  consentVerification?: string;
}

export const useProfileData = (profileId: string | undefined, isOwnProfile: boolean) => {
  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => fetchProfileData(profileId),
    enabled: !!profileId,
  });

  // Fetch posts
  const { data: posts } = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: () => fetchProfilePosts(profileId),
    enabled: !!profileId,
  });

  // Fetch friends
  const { data: friendsList = [] } = useQuery({
    queryKey: ["profile-friends", profileId],
    queryFn: () => fetchProfileFriends(profileId),
    enabled: !!profileId,
  });

  // Mock verification info - in real app this would come from your database
  const verificationInfo: VerificationInfo = {
    lastConnection: profileId ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 3 days ago
    photoVerification: profileId ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 30 days ago
    moderatorVerification: profileId ? new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 15 days ago
    consentVerification: profileId ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 7 days ago
  };

  // Format posts for display
  const formattedPosts: Post[] = (posts || []).map(post => ({
    id: post.id,
    author: {
      id: profileId || "",
      name: profileData?.full_name || "Unknown",
      avatar: profileData?.avatar_url || "/placeholder.svg",
      initials: profileData?.full_name?.split(" ").map((n: string) => n[0]).join("") || "??"
    },
    content: post.content,
    image: post.image_url || undefined,
    timestamp: new Date(post.created_at).toLocaleDateString(),
    likes: 0,
    comments: [],
    liked: false
  }));

  return {
    profileData,
    profileLoading,
    formattedPosts,
    friendsList,
    verificationInfo
  };
};
