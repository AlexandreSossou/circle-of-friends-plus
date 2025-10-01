import { supabase } from "@/integrations/supabase/client";
import { Friend } from "@/types/profile";

export const fetchProfileFriends = async (profileId: string | undefined): Promise<Friend[]> => {
  if (!profileId) return [];

  try {
    const { data, error } = await supabase
      .from("friends")
      .select(`
        id,
        friend_id,
        user_id,
        relationship_type,
        friend_profile:profiles!friend_id(id, full_name, avatar_url, location),
        user_profile:profiles!user_id(id, full_name, avatar_url, location)
      `)
      .eq("status", "accepted")
      .or(`user_id.eq.${profileId},friend_id.eq.${profileId}`);

    if (error) {
      console.error("Error fetching profile friends:", error);
      return [];
    }

    return data?.map(friendship => {
      // Determine which profile is the friend (not the profile being viewed)
      const friendProfile = friendship.friend_id === profileId 
        ? friendship.user_profile 
        : friendship.friend_profile;
      
      const friendId = friendship.friend_id === profileId 
        ? friendship.user_id 
        : friendship.friend_id;

      return {
        id: friendId,
        name: friendProfile?.full_name || "Unknown User",
        avatar: friendProfile?.avatar_url || "/placeholder.svg",
        initials: friendProfile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?",
        mutualFriends: 0, // TODO: Calculate mutual friends
        relationshipType: friendship.relationship_type as 'friend' | 'acquaintance'
      } as Friend;
    }) || [];
  } catch (error) {
    console.error("Error fetching profile friends:", error);
    return [];
  }
};
