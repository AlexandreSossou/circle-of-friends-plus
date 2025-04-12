
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Friend } from "@/types/friends";

type Message = {
  id: string;
  sender: "user" | "friend" | "system";
  content: string;
  timestamp: Date;
};

interface ChatMessagesProps {
  messages: Message[];
  selectedFriend: Friend | null;
}

const ChatMessages = ({ messages, selectedFriend }: ChatMessagesProps) => {
  return (
    <div className="h-80 overflow-y-auto p-3 flex flex-col gap-3 bg-white">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex gap-2 ${
            message.sender === "user" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {message.sender === "system" ? (
            <div className="w-full text-center">
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-xs text-social-textSecondary">
                {message.content}
              </div>
            </div>
          ) : (
            <>
              <Avatar className="h-8 w-8">
                {message.sender === "user" ? (
                  <AvatarFallback>U</AvatarFallback>
                ) : (
                  <AvatarFallback>
                    {selectedFriend?.initials || "F"}
                  </AvatarFallback>
                )}
                <AvatarImage 
                  src={message.sender === "user" ? 
                    "/placeholder.svg" : 
                    selectedFriend?.avatar || ""}
                />
              </Avatar>
              <div 
                className={`max-w-[80%] rounded-lg p-2 ${
                  message.sender === "user" 
                    ? "bg-social-blue text-white" 
                    : "bg-social-gray text-social-text"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
