
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCheck, Star, Settings2, Clock } from "lucide-react";
import { Friend } from "@/types/friends";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FriendCardProps {
  friend: Friend;
  onViewProfile: (id: string) => void;
  onUpdateRelationshipType?: (id: string, type: 'friend' | 'acquaintance') => void;
  onTemporaryUpgrade?: (id: string, durationMinutes: number) => void;
}

const FriendCard = ({ 
  friend, 
  onViewProfile, 
  onUpdateRelationshipType,
  onTemporaryUpgrade 
}: FriendCardProps) => {
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

  const handleTemporaryUpgrade = (durationMinutes: number) => {
    if (onTemporaryUpgrade) {
      onTemporaryUpgrade(friend.id, durationMinutes);
    }
  };

  // Format the expiration time if it exists
  const expirationText = friend.temporaryUpgradeUntil 
    ? `Temporary until ${format(new Date(friend.temporaryUpgradeUntil), 'h:mm a')}`
    : null;

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
            {friend.temporaryUpgradeUntil && (
              <div className="flex items-center ml-2 text-xs text-amber-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>{expirationText}</span>
              </div>
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
              
              {friend.relationshipType === 'acquaintance' && onTemporaryUpgrade && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Clock className="w-4 h-4 mr-2 text-amber-600" />
                    <span>Temporary Close Friend</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleTemporaryUpgrade(5)}>
                      For 5 minutes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTemporaryUpgrade(15)}>
                      For 15 minutes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTemporaryUpgrade(30)}>
                      For 30 minutes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTemporaryUpgrade(60)}>
                      For 1 hour
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTemporaryUpgrade(10080)}>
                      For 1 week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTemporaryUpgrade(20160)}>
                      For 2 weeks
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
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
