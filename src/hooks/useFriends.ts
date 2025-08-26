import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Friend } from "@/types/friends";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch friends from database
  const { data: allFriends = [], isLoading } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      if (!user) return [];

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
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching friends:", error);
        return [];
      }

      return data?.map(friendship => {
        // Determine which profile is the friend (not the current user)
        const friendProfile = friendship.friend_id === user.id 
          ? friendship.user_profile 
          : friendship.friend_profile;
        
        const friendId = friendship.friend_id === user.id 
          ? friendship.user_id 
          : friendship.friend_id;

        return {
          id: friendId,
          name: friendProfile?.full_name || "Unknown User",
          avatar: friendProfile?.avatar_url || "/placeholder.svg",
          initials: friendProfile?.full_name?.split(" ").map(n => n[0]).join("") || "?",
          mutualFriends: 0, // TODO: Calculate mutual friends
          relationshipType: friendship.relationship_type as 'friend' | 'acquaintance',
          location: friendProfile?.location || undefined
        } as Friend;
      }) || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Update relationship type mutation
  const updateRelationshipMutation = useMutation({
    mutationFn: async ({ friendId, relationshipType }: { friendId: string, relationshipType: 'friend' | 'acquaintance' }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("friends")
        .update({ relationship_type: relationshipType })
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({
        title: "Relationship updated",
        description: "Friend status has been updated",
      });
    },
    onError: (error) => {
      console.error("Error updating relationship:", error);
      toast({
        title: "Error",
        description: "Failed to update friend status",
        variant: "destructive",
      });
    },
  });

  const updateRelationshipType = (friendId: string, relationshipType: 'friend' | 'acquaintance') => {
    updateRelationshipMutation.mutate({ friendId, relationshipType });
  };

  // Temporary relationship upgrade (local state only for now)
  const [localUpgrades, setLocalUpgrades] = useState<{[friendId: string]: Date}>({});

  const temporarilyUpgradeRelationship = (friendId: string, durationMinutes: number) => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
    
    setLocalUpgrades(prev => ({
      ...prev,
      [friendId]: expiresAt
    }));
    
    toast({
      title: "Temporary close friend added",
      description: `Contact will revert to acquaintance in ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}.`,
    });
  };

  // Check for expired temporary relationships
  useEffect(() => {
    const checkExpiredRelationships = () => {
      const now = new Date();
      setLocalUpgrades(prev => {
        const updated = { ...prev };
        let hasExpired = false;
        
        Object.keys(updated).forEach(friendId => {
          if (updated[friendId] < now) {
            delete updated[friendId];
            hasExpired = true;
            const friend = allFriends.find(f => f.id === friendId);
            if (friend) {
              toast({
                title: "Temporary status expired",
                description: `${friend.name} has been moved back to acquaintance.`,
              });
            }
          }
        });
        
        return hasExpired ? updated : prev;
      });
    };
    
    const interval = setInterval(checkExpiredRelationships, 60000);
    return () => clearInterval(interval);
  }, [toast, allFriends]);

  // Apply temporary upgrades to friends list
  const friendsWithUpgrades = allFriends.map(friend => ({
    ...friend,
    relationshipType: localUpgrades[friend.id] ? 'friend' as const : friend.relationshipType,
    temporaryUpgradeUntil: localUpgrades[friend.id] || null
  }));

  return {
    allFriends: friendsWithUpgrades,
    isLoading,
    updateRelationshipType,
    temporarilyUpgradeRelationship,
    isUpdating: updateRelationshipMutation.isPending
  };
};