
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Friend } from "@/types/friends";
import { Search, UserPlus, X, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupChatCreatorProps {
  closeFriends: Friend[];
  selectedMembers: Friend[];
  groupName: string;
  setGroupName: (name: string) => void;
  onAddMember: (friend: Friend) => void;
  onRemoveMember: (friendId: string) => void;
  onCreateGroup: () => void;
  onCancel: () => void;
}

const GroupChatCreator = ({
  closeFriends,
  selectedMembers,
  groupName,
  setGroupName,
  onAddMember,
  onRemoveMember,
  onCreateGroup,
  onCancel
}: GroupChatCreatorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredFriends = closeFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedMembers.some(member => member.id === friend.id)
  );

  return (
    <div className="flex flex-col h-96">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium mb-2 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Create Group Chat
        </h3>
        <Input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mb-2"
        />
        <p className="text-xs text-social-textSecondary mb-2">
          Add up to 5 friends to create a group chat (6 people total including you)
        </p>
        
        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 my-2">
            {selectedMembers.map(member => (
              <Badge 
                key={member.id} 
                variant="secondary"
                className="flex items-center gap-1 pl-2"
              >
                {member.name}
                <button 
                  onClick={() => onRemoveMember(member.id)}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary h-4 w-4" />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        {filteredFriends.length > 0 ? (
          <div className="space-y-2">
            {filteredFriends.map((friend) => (
              <div 
                key={friend.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.initials}</AvatarFallback>
                  </Avatar>
                  <span>{friend.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onAddMember(friend)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-social-textSecondary">
            {searchTerm ? "No friends found matching your search" : "No more friends available to add"}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-200 flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onCreateGroup}
          disabled={!groupName.trim() || selectedMembers.length === 0}
          className="bg-social-blue hover:bg-social-darkblue"
        >
          Create Group
        </Button>
      </div>
    </div>
  );
};

export default GroupChatCreator;
