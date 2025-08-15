
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Friend } from "@/types/friends";

interface FriendSuggestionProps {
  suggestion: Friend;
  onAddFriend: (id: string, name: string) => void;
}

const FriendSuggestion = ({ suggestion, onAddFriend }: FriendSuggestionProps) => {
  return (
    <div className="social-card p-4">
      <div className="flex items-center">
        <div className="flex items-center flex-1">
          <Avatar className="mr-3">
            <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
            <AvatarFallback>{suggestion.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{suggestion.name}</h3>
            <p className="text-xs text-social-textSecondary">{suggestion.mutualFriends} mutual Lovarinos</p>
          </div>
        </div>
        <Button 
          onClick={() => onAddFriend(suggestion.id, suggestion.name)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default FriendSuggestion;
