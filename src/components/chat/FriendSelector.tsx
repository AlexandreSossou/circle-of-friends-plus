
import { useState } from "react";
import { AlertCircle, Clock, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/friends";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";

interface FriendSelectorProps {
  closeFriends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  onClose: () => void;
  onModeratorChat: () => void;
}

const FriendSelector = ({ closeFriends, onSelectFriend, onClose, onModeratorChat }: FriendSelectorProps) => {
  // Format the expiration time in a human-readable way
  const formatExpirationTime = (date: Date) => {
    if (isToday(date)) {
      return `Temp until ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Temp until tomorrow, ${format(date, 'h:mm a')}`;
    } else {
      return `Temp for ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
  };

  return (
    <div className="h-80 overflow-y-auto p-3 flex flex-col gap-3 bg-white">
      <div className="p-2 text-center text-social-textSecondary">
        <p>Select a close friend to chat with</p>
      </div>
      
      {/* Moderator option */}
      <div 
        onClick={onModeratorChat}
        className="flex items-center p-2 gap-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200"
      >
        <div className="h-10 w-10 rounded-full bg-social-blue flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium">Chat with a Moderator</p>
          <p className="text-xs text-social-textSecondary">Get help from our staff</p>
        </div>
      </div>
      
      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-xs text-gray-500">
            YOUR CLOSE FRIENDS
          </span>
        </div>
      </div>
      
      {closeFriends.length > 0 ? (
        closeFriends.map((friend) => (
          <div 
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className="flex items-center p-2 gap-2 rounded-lg hover:bg-social-gray cursor-pointer"
          >
            <Avatar>
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>{friend.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{friend.name}</p>
              <div className="flex items-center">
                <p className="text-xs text-social-textSecondary">{friend.location || "No location set"}</p>
                
                {friend.temporaryUpgradeUntil && (
                  <div className="flex items-center ml-2 text-xs text-amber-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>
                      {formatExpirationTime(new Date(friend.temporaryUpgradeUntil))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
          <p className="font-medium">No close friends found</p>
          <p className="text-sm text-social-textSecondary mt-1">
            You need to mark friends as "close friends" to chat with them
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => window.location.href = "/friends"}
          >
            Go to Friends Page
          </Button>
        </div>
      )}
      
      <Button 
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="mt-2"
      >
        Cancel
      </Button>
    </div>
  );
};

export default FriendSelector;
