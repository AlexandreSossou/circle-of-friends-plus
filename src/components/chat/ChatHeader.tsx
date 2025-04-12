
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, X } from "lucide-react";
import { Friend } from "@/types/friends";

interface ChatHeaderProps {
  selectedFriend: Friend | null;
  onClose: () => void;
}

const ChatHeader = ({ selectedFriend, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-social-blue text-white rounded-t-lg">
      <div className="flex items-center gap-2">
        {selectedFriend ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarImage src={selectedFriend.avatar} />
              <AvatarFallback>{selectedFriend.initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedFriend.name}</span>
          </>
        ) : (
          <>
            <MessageCircle size={18} />
            <span className="font-medium">Chat with Close Friends</span>
          </>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="h-7 w-7 text-white hover:bg-social-darkblue rounded-full"
      >
        <X size={16} />
      </Button>
    </div>
  );
};

export default ChatHeader;
