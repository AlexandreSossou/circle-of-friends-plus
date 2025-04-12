
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Friend } from "@/types/friends";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  sender: "user" | "friend" | "system" | "moderator";
  content: string;
  timestamp: Date;
};

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [showModeratorSelector, setShowModeratorSelector] = useState(false);
  const [isChatWithModerator, setIsChatWithModerator] = useState(false);
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
      setIsChatWithModerator(false);
    }
  }, [selectedFriend]);

  useEffect(() => {
    // Initialize moderator chat with a welcome message
    if (isChatWithModerator) {
      setMessages([
        {
          id: `welcome-moderator-${Date.now()}`,
          sender: "system",
          content: "You are now connected with a moderator. How can we help you today?",
          timestamp: new Date(),
        },
      ]);
      setShowModeratorSelector(false);
    }
  }, [isChatWithModerator]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !selectedFriend && !isChatWithModerator) {
      setShowFriendSelector(true);
      setShowModeratorSelector(false);
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    // We already ensure only close friends are displayed in the selector
    // But as an extra safety check, we confirm here too
    if (friend.relationshipType !== 'friend') {
      return;
    }

    setSelectedFriend(friend);
    setIsChatWithModerator(false);
    toast({
      title: "Chat started",
      description: `You can now chat with ${friend.name}.`,
    });
  };

  const handleCloseFriendSelector = () => {
    setShowFriendSelector(!showFriendSelector);
    setShowModeratorSelector(false);
    if (!selectedFriend && !isChatWithModerator && !showFriendSelector) {
      setIsOpen(false);
    }
  };

  const handleToggleModeratorSelector = () => {
    if (showModeratorSelector) {
      // Start a chat with a moderator
      setIsChatWithModerator(true);
      setSelectedFriend(null);
      toast({
        title: "Moderator chat started",
        description: "You are now chatting with a staff moderator.",
      });
    } else {
      // Show the moderator selector
      setShowModeratorSelector(true);
      setShowFriendSelector(false);
    }
  };

  const sendMessage = (content: string) => {
    if (!selectedFriend && !isChatWithModerator) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate response based on conversation type
    setTimeout(() => {
      let responseMessage: Message;
      
      if (isChatWithModerator) {
        responseMessage = {
          id: `moderator-${Date.now()}`,
          sender: "moderator",
          content: "Thank you for contacting our moderation team. How can we assist you today?",
          timestamp: new Date(),
        };
      } else {
        responseMessage = {
          id: `friend-${Date.now()}`,
          sender: "friend",
          content: `Hi from ${selectedFriend?.name}! This is a simulated response.`,
          timestamp: new Date(),
        };
      }
      
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  return {
    isOpen,
    toggleChat,
    messages,
    selectedFriend,
    showFriendSelector,
    showModeratorSelector,
    isChatWithModerator,
    handleSelectFriend,
    handleCloseFriendSelector,
    handleToggleModeratorSelector,
    sendMessage,
    setIsOpen,
    setSelectedFriend,
    setShowFriendSelector,
  };
};
