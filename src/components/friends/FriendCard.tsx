
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, Star, Settings2 } from "lucide-react";
import { Friend } from "@/types/friends";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface FriendCardProps {
  friend: Friend;
  onViewProfile: (id: string) => void;
  onUpdateRelationshipType?: (id: string, type: 'friend' | 'acquaintance') => void;
}

const FriendCard = ({ friend, onViewProfile, onUpdateRelationshipType }: FriendCardProps) => {
  const { toast } = useToast();

  const handleRelationshipChange = (type: 'friend' | 'acquaintance') => {
    if (onUpdateRelationshipType) {
      onUpdateRelationshipType(friend.id, type);
      
      toast({
        title: `Friend status updated`,
        description: `${friend.name} is now your ${type}`,
      });
    }
  };

  return (
    <div className="social-card p-4 flex items-center">
      <div className="flex items-center flex-1">
        <Avatar className="mr-3">
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback>{friend.initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center">
            <h3 className="font-medium">{friend.name}</h3>
            {friend.relationshipType === "friend" && (
              <Star className="w-3 h-3 text-yellow-500 ml-1" fill="currentColor" />
            )}
          </div>
          <p className="text-xs text-social-textSecondary">{friend.mutualFriends} mutual friends</p>
        </div>
      </div>
      <div className="flex items-center">
        {onUpdateRelationshipType && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Settings2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRelationshipChange('friend')}>
                <Star className="w-4 h-4 mr-2 text-yellow-500" fill={friend.relationshipType === 'friend' ? 'currentColor' : 'none'} />
                <span>Close Friend</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRelationshipChange('acquaintance')}>
                <UserCheck className="w-4 h-4 mr-2" />
                <span>Acquaintance</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewProfile(friend.id)}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          <span>Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default FriendCard;
