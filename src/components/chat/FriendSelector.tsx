
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/friends";
import { Search, Shield, Users } from "lucide-react";

interface FriendSelectorProps {
  closeFriends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  onClose: () => void;
  onModeratorChat: () => void;
  onCreateGroupChat: () => void;
}

const FriendSelector = ({ 
  closeFriends, 
  onSelectFriend, 
  onClose, 
  onModeratorChat,
  onCreateGroupChat
}: FriendSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredFriends = closeFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-96">
      <div className="p-4 border-b border-gray-200">
        <p className="text-center text-sm mb-2">
          Select a Lovarino to chat with
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary h-4 w-4" />
          <Input
            type="text"
            placeholder="Search Lovarinos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex gap-2 p-2 border-b border-gray-200">
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-1" 
          onClick={onCreateGroupChat}
        >
          <Users className="h-4 w-4" />
          <span>New Group</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-1" 
          onClick={onModeratorChat}
        >
          <Shield className="h-4 w-4" />
          <span>Moderator</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredFriends.length > 0 ? (
          <div>
            {filteredFriends.map((friend) => (
              <div 
                key={friend.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectFriend(friend)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>{friend.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-xs text-social-textSecondary">
                    {friend.location || "No location set"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-social-textSecondary">
            {searchTerm 
              ? "No Lovarinos found matching your search" 
              : closeFriends.length === 0 
                ? "You don't have any Lovarinos to chat with yet. Add some Lovarinos first!" 
                : "No Lovarinos available for chat"
            }
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default FriendSelector;
