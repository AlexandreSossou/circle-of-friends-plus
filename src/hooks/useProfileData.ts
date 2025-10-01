
import { useQuery } from "@tanstack/react-query";
import { fetchProfileData, fetchProfilePosts } from "@/services/profile";
import { Friend, Post } from "@/types/profile";

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

  // Use real UUIDs that match our database profiles, with relationship types
  const friendsList: Friend[] = [
    { id: "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8", name: "Emma Watson", avatar: "/placeholder.svg", initials: "EW", mutualFriends: 5, relationshipType: "friend" },
    { id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", name: "James Smith", avatar: "/placeholder.svg", initials: "JS", mutualFriends: 3, relationshipType: "friend" },
    { id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", name: "Sarah Johnson", avatar: "/placeholder.svg", initials: "SJ", mutualFriends: 7, relationshipType: "friend" },
    { id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", name: "Michael Brown", avatar: "/placeholder.svg", initials: "MB", mutualFriends: 2, relationshipType: "acquaintance" },
    { id: "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4", name: "Jessica Taylor", avatar: "/placeholder.svg", initials: "JT", mutualFriends: 1, relationshipType: "acquaintance" },
    { id: "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5", name: "David Lee", avatar: "/placeholder.svg", initials: "DL", mutualFriends: 4, relationshipType: "acquaintance" }
  ];

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
