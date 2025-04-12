
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import FriendCard from "./FriendCard";
import { Friend } from "@/types/friends";

interface FriendsListProps {
  friends: Friend[];
  onViewProfile: (id: string) => void;
}

const FriendsList = ({ friends, onViewProfile }: FriendsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
      
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => (
            <FriendCard 
              key={friend.id} 
              friend={friend} 
              onViewProfile={onViewProfile} 
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
