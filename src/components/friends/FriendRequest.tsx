
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/friends";

interface FriendRequestProps {
  request: Friend;
  onAccept: (id: string, name: string) => void;
  onDecline: (id: string) => void;
}

const FriendRequest = ({ request, onAccept, onDecline }: FriendRequestProps) => {
  return (
    <div className="social-card p-4">
      <div className="flex items-center">
        <div className="flex items-center flex-1">
          <Avatar className="mr-3">
            <AvatarImage src={request.avatar} alt={request.name} />
            <AvatarFallback>{request.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{request.name}</h3>
            <p className="text-xs text-social-textSecondary">{request.mutualFriends} mutual friends</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => onAccept(request.id, request.name)}
            className="bg-social-blue hover:bg-social-darkblue"
          >
            Accept
          </Button>
          <Button 
            variant="outline"
            onClick={() => onDecline(request.id)}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequest;
