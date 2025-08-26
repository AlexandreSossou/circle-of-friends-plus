import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type FriendshipStatus = 'not_friends' | 'pending_sent' | 'pending_received' | 'friends';

export const useFriendshipStatus = (targetUserId: string | undefined) => {
  const { user } = useAuth();

  const { data: friendshipStatus, isLoading } = useQuery({
    queryKey: ["friendshipStatus", user?.id, targetUserId],
    queryFn: async (): Promise<FriendshipStatus> => {
      if (!user || !targetUserId || user.id === targetUserId) {
        return 'not_friends';
      }

      const { data, error } = await supabase
        .from("friends")
        .select("status, user_id, friend_id")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No relationship found
          return 'not_friends';
        }
        console.error("Error checking friendship status:", error);
        return 'not_friends';
      }

      if (data.status === 'accepted') {
        return 'friends';
      }

      if (data.status === 'pending') {
        // Check who sent the request
        if (data.user_id === user.id) {
          return 'pending_sent';
        } else {
          return 'pending_received';
        }
      }

      return 'not_friends';
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    friendshipStatus: friendshipStatus || 'not_friends',
    isLoading
  };
};