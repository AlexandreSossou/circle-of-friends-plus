
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Friend } from "@/types/friends";
import { Shield, Users } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "friend" | "system" | "moderator";
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  selectedFriend: Friend | null;
  selectedGroupChat: {
    id: string;
    name: string;
    members: Friend[];
    isGroup: true;
  } | null;
  isChatWithModerator?: boolean;
}

const ChatMessages = ({ messages, selectedFriend, selectedGroupChat, isChatWithModerator }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Find the correct friend to display for a message in a group chat
  const findMessageSender = (message: Message) => {
    if (!selectedGroupChat || message.sender !== "friend") return null;
    
    // For demo purposes, randomly select a member as the message sender
    const randomIndex = message.id.charCodeAt(message.id.length - 1) % selectedGroupChat.members.length;
    return selectedGroupChat.members[randomIndex];
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 p-4 text-center text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 h-64 overflow-y-auto bg-gray-50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.sender === "system" ? (
            <div className="bg-gray-100 text-gray-600 text-sm rounded-lg px-3 py-2 w-full text-center mx-6">
              {message.content}
            </div>
          ) : message.sender === "user" ? (
            <div className="bg-social-blue text-white rounded-lg px-3 py-2 max-w-[75%]">
              {message.content}
            </div>
          ) : message.sender === "moderator" ? (
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-full bg-social-blue flex-shrink-0 flex items-center justify-center mt-1">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-[75%]">
                {message.content}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              {selectedGroupChat ? (
                // Display the message sender for group chats
                <>
                  {findMessageSender(message) ? (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarImage src={findMessageSender(message)?.avatar} />
                      <AvatarFallback>{findMessageSender(message)?.initials}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-social-gray flex-shrink-0 flex items-center justify-center mt-1">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-social-textSecondary mb-1">
                      {findMessageSender(message)?.name || "Group Member"}
                    </div>
                    <div className="bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-[75%]">
                      {message.content}
                    </div>
                  </div>
                </>
              ) : selectedFriend && (
                <>
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarImage src={selectedFriend.avatar} />
                    <AvatarFallback>{selectedFriend.initials}</AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-[75%]">
                    {message.content}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
