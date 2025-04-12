
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Friend } from "@/types/friends";
import { Shield } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "friend" | "system" | "moderator";
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  selectedFriend: Friend | null;
  isChatWithModerator?: boolean;
}

const ChatMessages = ({ messages, selectedFriend, isChatWithModerator }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              {selectedFriend && (
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarImage src={selectedFriend.avatar} />
                  <AvatarFallback>{selectedFriend.initials}</AvatarFallback>
                </Avatar>
              )}
              <div className="bg-white border border-gray-200 text-gray-800 rounded-lg px-3 py-2 max-w-[75%]">
                {message.content}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
