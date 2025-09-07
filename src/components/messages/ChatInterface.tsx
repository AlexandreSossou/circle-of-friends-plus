
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

type Contact = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

type PartnerGroup = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  isPartnerGroup: true;
  partners: Contact[];
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read: boolean;
};

interface ChatInterfaceProps {
  selectedContact: Contact | PartnerGroup | null;
  messages: Message[] | undefined;
  onSendMessage: (content: string) => void;
}

const ChatInterface = ({
  selectedContact,
  messages,
  onSendMessage,
}: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    onSendMessage(messageInput.trim());
    setMessageInput("");
  };

  if (!selectedContact) {
    return (
      <div className="flex h-full items-center justify-center text-social-textSecondary">
        <div className="text-center">
          <h3 className="font-medium text-lg mb-2">Select a conversation</h3>
          <p>Choose a contact from the left or search for someone to message</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Contact header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        {'isPartnerGroup' in selectedContact && selectedContact.isPartnerGroup ? (
          <>
            <div className="relative">
              <Users className="h-8 w-8 p-1 bg-primary text-primary-foreground rounded-full" />
            </div>
            <div>
              <h2 className="font-medium">{selectedContact.full_name}</h2>
              <p className="text-sm text-social-textSecondary">
                {selectedContact.partners.map(p => p.full_name).join(", ")}
              </p>
            </div>
          </>
        ) : (
          <>
            <Avatar>
              <AvatarImage src={selectedContact.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                {selectedContact.full_name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{selectedContact.full_name}</h2>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? "bg-social-blue text-white"
                    : "bg-social-gray text-social-text"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {format(new Date(message.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-social-textSecondary">
              No messages yet. Send a message to start the conversation.
            </p>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            className="bg-social-blue hover:bg-social-darkblue"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
