
import { useState } from "react";
import { Bot, MessageCircle, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  sender: "user" | "bot" | "moderator";
  content: string;
  timestamp: Date;
};

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      sender: "bot",
      content: "Hi there! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: "Thanks for your message! A moderator will get back to you soon.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg">
          <div className="flex items-center justify-between p-3 bg-social-blue text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <span className="font-medium">Chat Support</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleChat}
              className="h-7 w-7 text-white hover:bg-social-darkblue rounded-full"
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="h-80 overflow-y-auto p-3 flex flex-col gap-3 bg-white">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-2 ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8">
                  {message.sender === "user" ? (
                    <AvatarFallback>U</AvatarFallback>
                  ) : message.sender === "bot" ? (
                    <AvatarFallback className="bg-social-blue text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-green-500 text-white">M</AvatarFallback>
                  )}
                  <AvatarImage src={message.sender === "user" ? "/placeholder.svg" : ""} />
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
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button type="submit" className="bg-social-blue hover:bg-social-darkblue">
              Send
            </Button>
          </form>
        </Card>
      ) : (
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-social-blue hover:bg-social-darkblue shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default ChatBubble;
