
import { useState, useEffect } from "react";
import { Friend } from "@/types/friends";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFriends = () => {
  const [allFriends, setAllFriends] = useState<Friend[]>([
    { id: "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8", name: "Emma Watson", avatar: "/placeholder.svg", initials: "EW", mutualFriends: 5, relationshipType: "friend", location: "London, United Kingdom" },
    { id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", name: "James Smith", avatar: "/placeholder.svg", initials: "JS", mutualFriends: 3, relationshipType: "friend", location: "Paris, France" },
    { id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", name: "Sarah Johnson", avatar: "/placeholder.svg", initials: "SJ", mutualFriends: 7, relationshipType: "friend", location: "Barcelona, Spain" },
    { id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", name: "Michael Brown", avatar: "/placeholder.svg", initials: "MB", mutualFriends: 2, relationshipType: "acquaintance", location: "Rome, Italy" },
    { id: "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4", name: "Jessica Taylor", avatar: "/placeholder.svg", initials: "JT", mutualFriends: 1, relationshipType: "acquaintance", location: "Berlin, Germany" },
    { id: "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5", name: "David Lee", avatar: "/placeholder.svg", initials: "DL", mutualFriends: 4, relationshipType: "acquaintance", location: "Amsterdam, Netherlands" }
  ]);
  
  const friendRequests: Friend[] = [
    { id: "aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", name: "Olivia Martinez", avatar: "/placeholder.svg", initials: "OM", mutualFriends: 2 },
    { id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e", name: "Ryan Cooper", avatar: "/placeholder.svg", initials: "RC", mutualFriends: 8 }
  ];
  
  const { toast } = useToast();
  
  // Check for expired temporary relationships
  useEffect(() => {
    const checkExpiredRelationships = () => {
      const now = new Date();
      setAllFriends(currentFriends => {
        const updatedFriends = currentFriends.map(friend => {
          if (friend.temporaryUpgradeUntil && new Date(friend.temporaryUpgradeUntil) < now) {
            // Revert the relationship type
            toast({
              title: "Temporary status expired",
              description: `${friend.name} has been moved back to acquaintance.`,
            });
            return { 
              ...friend, 
              relationshipType: 'acquaintance' as const, 
              temporaryUpgradeUntil: null 
            };
          }
          return friend;
        });
        return updatedFriends;
      });
    };
    
    // Check on component mount and every minute
    const interval = setInterval(checkExpiredRelationships, 60000);
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // Add function to update relationship type
  const updateRelationshipType = async (friendId: string, relationshipType: 'friend' | 'acquaintance') => {
    // In a real app, we would update the database here
    console.log(`Updating ${friendId} to ${relationshipType}`);
    
    // For now, we'll just update our local state
    setAllFriends(prevFriends => 
      prevFriends.map(friend => 
        friend.id === friendId 
          ? { ...friend, relationshipType, temporaryUpgradeUntil: null } 
          : friend
      )
    );
    
    // In a real app with Supabase, you'd do something like:
    // await supabase
    //   .from('friends')
    //   .update({ relationship_type: relationshipType })
    //   .eq('friend_id', friendId)
    //   .eq('user_id', user.id);
  };
  
  // Add function to temporarily upgrade a relationship
  const temporarilyUpgradeRelationship = async (friendId: string, durationMinutes: number) => {
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);
    
    // Update local state
    setAllFriends(prevFriends => 
      prevFriends.map(friend => 
        friend.id === friendId 
          ? { 
              ...friend, 
              relationshipType: 'friend' as const, 
              temporaryUpgradeUntil: expiresAt 
            } 
          : friend
      )
    );
    
    // In a real app with Supabase, you'd store the temporary status
    // along with the expiration timestamp
    
    toast({
      title: "Temporary close friend added",
      description: `Contact will revert to acquaintance in ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}.`,
    });
  };
  
  return {
    allFriends,
    friendRequests,
    updateRelationshipType,
    temporarilyUpgradeRelationship
  };
};
