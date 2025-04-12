
import { useState } from "react";
import { Friend } from "@/types/friends";
import { supabase } from "@/integrations/supabase/client";

export const useFriends = () => {
  // All friends with valid UUIDs and relationship types
  const allFriends: Friend[] = [
    { id: "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8", name: "Emma Watson", avatar: "/placeholder.svg", initials: "EW", mutualFriends: 5, relationshipType: "friend" },
    { id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", name: "James Smith", avatar: "/placeholder.svg", initials: "JS", mutualFriends: 3, relationshipType: "friend" },
    { id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", name: "Sarah Johnson", avatar: "/placeholder.svg", initials: "SJ", mutualFriends: 7, relationshipType: "friend" },
    { id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", name: "Michael Brown", avatar: "/placeholder.svg", initials: "MB", mutualFriends: 2, relationshipType: "acquaintance" },
    { id: "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4", name: "Jessica Taylor", avatar: "/placeholder.svg", initials: "JT", mutualFriends: 1, relationshipType: "acquaintance" },
    { id: "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5", name: "David Lee", avatar: "/placeholder.svg", initials: "DL", mutualFriends: 4, relationshipType: "acquaintance" }
  ];
  
  const friendRequests: Friend[] = [
    { id: "aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", name: "Olivia Martinez", avatar: "/placeholder.svg", initials: "OM", mutualFriends: 2 },
    { id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e", name: "Ryan Cooper", avatar: "/placeholder.svg", initials: "RC", mutualFriends: 8 }
  ];
  
  const suggestions: Friend[] = [
    { id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f", name: "Sophia Anderson", avatar: "/placeholder.svg", initials: "SA", mutualFriends: 4 },
    { id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a", name: "Christopher Wilson", avatar: "/placeholder.svg", initials: "CW", mutualFriends: 6 },
    { id: "f8f8f8f8-a1a1-b2b2-c3c3-d4d4e5e5f6f6", name: "Matthew Thomas", avatar: "/placeholder.svg", initials: "MT", mutualFriends: 3 },
    { id: "a9b8c7d6-e5f4-a3b2-c1d0-e9f8a7b6c5d4", name: "Emily Garcia", avatar: "/placeholder.svg", initials: "EG", mutualFriends: 5 }
  ];

  // Add function to update relationship type
  const updateRelationshipType = async (friendId: string, relationshipType: 'friend' | 'acquaintance') => {
    // In a real app, we would update the database here
    console.log(`Updating ${friendId} to ${relationshipType}`);
    
    // For now, we'll just update our local state
    // In a real app with Supabase, you'd do something like:
    // await supabase
    //   .from('friends')
    //   .update({ relationship_type: relationshipType })
    //   .eq('friend_id', friendId)
    //   .eq('user_id', user.id);
  };
  
  return {
    allFriends,
    friendRequests,
    suggestions,
    updateRelationshipType
  };
};
