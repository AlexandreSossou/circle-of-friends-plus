
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { Friend } from "@/types/friends";

interface FriendCardProps {
  friend: Friend;
  onViewProfile: (id: string) => void;
}

const FriendCard = ({ friend, onViewProfile }: FriendCardProps) => {
  return (
    <div className="social-card p-4 flex items-center">
      <div className="flex items-center flex-1">
        <Avatar className="mr-3">
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback>{friend.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{friend.name}</h3>
          <p className="text-xs text-social-textSecondary">{friend.mutualFriends} mutual friends</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onViewProfile(friend.id)}
      >
        <UserCheck className="w-4 h-4 mr-2" />
        <span>Profile</span>
      </Button>
    </div>
  );
};

export default FriendCard;
