
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Friend } from "@/types/friends";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  sender: "user" | "friend" | "system";
  content: string;
  timestamp: Date;
};

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const sendMessage = (content: string) => {
    if (!selectedFriend) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
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

  return {
    isOpen,
    toggleChat,
    messages,
    selectedFriend,
    showFriendSelector,
    handleSelectFriend,
    handleCloseFriendSelector,
    sendMessage,
    setIsOpen,
    setSelectedFriend,
    setShowFriendSelector,
  };
};
