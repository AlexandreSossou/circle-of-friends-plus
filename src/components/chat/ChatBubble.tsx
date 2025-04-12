
import { useState, useEffect } from "react";
import { Bot, MessageCircle, X, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { Friend } from "@/types/friends";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  sender: "user" | "friend" | "system";
  content: string;
  timestamp: Date;
};

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { allFriends } = useFriends();

  // Filter only close friends (relationship type is 'friend')
  const closeFriends = allFriends.filter(friend => friend.relationshipType === 'friend');

  useEffect(() => {
    // Reset messages when a new friend is selected
    if (selectedFriend) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "system",
          content: `Chat with ${selectedFriend.name} started. Only close friends can chat!`,
          timestamp: new Date(),
        },
      ]);
      setShowFriendSelector(false);
    }
  }, [selectedFriend]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !selectedFriend) {
      setShowFriendSelector(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !selectedFriend) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate friend response
    setTimeout(() => {
      const friendMessage: Message = {
        id: `friend-${Date.now()}`,
        sender: "friend",
        content: `Hi from ${selectedFriend.name}! This is a simulated response.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, friendMessage]);
    }, 1000);
  };

  const handleSelectFriend = (friend: Friend) => {
    if (friend.relationshipType !== 'friend') {
      toast({
        title: "Chat not available",
        description: "Chat is only available with close friends.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFriend(friend);
    toast({
      title: "Chat started",
      description: `You can now chat with ${friend.name}.`,
    });
  };

  const handleCloseFriendSelector = () => {
    setShowFriendSelector(false);
    if (!selectedFriend) {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg">
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
              onClick={toggleChat}
              className="h-7 w-7 text-white hover:bg-social-darkblue rounded-full"
            >
              <X size={16} />
            </Button>
          </div>
          
          {showFriendSelector ? (
            <div className="h-80 overflow-y-auto p-3 flex flex-col gap-3 bg-white">
              <div className="p-2 text-center text-social-textSecondary">
                <p>Select a close friend to chat with</p>
              </div>
              
              {closeFriends.length > 0 ? (
                closeFriends.map((friend) => (
                  <div 
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    className="flex items-center p-2 gap-2 rounded-lg hover:bg-social-gray cursor-pointer"
                  >
                    <Avatar>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-xs text-social-textSecondary">{friend.location || "No location set"}</p>
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
                onClick={handleCloseFriendSelector}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
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
            </>
          )}
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
