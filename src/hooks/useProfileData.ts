
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileData, fetchProfilePosts, mockProfiles } from "@/services/ProfileService";
import { Album, Friend, Post, ProfileData } from "@/types/profile";

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

  // Sample photos
  const photos = [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=500",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=500",
    "https://images.unsplash.com/photo-1675624452350-ac5db8edf97b?q=80&w=500",
    "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=500",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500",
    "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=500"
  ];

  // Album state
  const [albums, setAlbums] = useState<Album[]>([
    { id: 1, name: "Default Album", photos: photos.slice(0, 3), isPrivate: false, allowedUsers: [] },
    { id: 2, name: "Vacation", photos: photos.slice(3, 6), isPrivate: true, allowedUsers: ["friend-1", "friend-2"] },
  ]);

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
    albums,
    setAlbums
  };
};
