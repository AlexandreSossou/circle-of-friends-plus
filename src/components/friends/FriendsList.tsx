
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import FriendCard from "./FriendCard";
import { Friend } from "@/types/friends";

interface FriendsListProps {
  friends: Friend[];
  onViewProfile: (id: string) => void;
  onUpdateRelationshipType?: (id: string, type: 'friend' | 'acquaintance') => void;
  onTemporaryUpgrade?: (id: string, durationMinutes: number) => void;
}

const FriendsList = ({ 
  friends, 
  onViewProfile, 
  onUpdateRelationshipType,
  onTemporaryUpgrade 
}: FriendsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort friends so "friend" relationship type comes first
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    // Sort by relationship type (friend first)
    if (a.relationshipType === 'friend' && b.relationshipType !== 'friend') return -1;
    if (a.relationshipType !== 'friend' && b.relationshipType === 'friend') return 1;
    
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
  
  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search friends..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {sortedFriends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFriends.map((friend) => (
            <FriendCard 
              key={friend.id} 
              friend={friend} 
              onViewProfile={onViewProfile}
              onUpdateRelationshipType={onUpdateRelationshipType}
              onTemporaryUpgrade={onTemporaryUpgrade}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-social-textSecondary">
          <p>No friends match your search.</p>
        </div>
      )}
    </>
  );
};

export default FriendsList;
