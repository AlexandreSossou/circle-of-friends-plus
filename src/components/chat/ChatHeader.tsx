
import { ArrowLeft, Shield, X, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Friend } from "@/types/friends";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  selectedFriend: Friend | null;
  selectedGroupChat: {
    id: string;
    name: string;
    members: Friend[];
    isGroup: true;
  } | null;
  isChatWithModerator?: boolean;
  onClose: () => void;
  onBack?: () => void;
}

const ChatHeader = ({ selectedFriend, selectedGroupChat, isChatWithModerator, onClose, onBack }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white rounded-t-md">
      <div className="flex items-center gap-2">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        {isChatWithModerator ? (
          <>
            <div className="h-8 w-8 rounded-full bg-social-blue flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium">Staff Moderator</h3>
              <p className="text-xs text-social-textSecondary">Online</p>
            </div>
          </>
        ) : selectedGroupChat ? (
          <>
            <div className="h-8 w-8 rounded-full bg-social-blue flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="max-w-[180px]">
              <h3 className="font-medium truncate">{selectedGroupChat.name}</h3>
              <p className="text-xs text-social-textSecondary">
                {selectedGroupChat.members.length + 1} members
              </p>
            </div>
          </>
        ) : selectedFriend ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedFriend.avatar} />
              <AvatarFallback>{selectedFriend.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedFriend.name}</h3>
              <p className="text-xs text-social-textSecondary">
                {selectedFriend.location || "No location set"}
              </p>
            </div>
          </>
        ) : (
          <h3 className="font-medium">Chat</h3>
        )}
      </div>
      
      <button 
        onClick={onClose}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <X className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default ChatHeader;
