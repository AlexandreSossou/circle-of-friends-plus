
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

type GroupChat = {
  id: string;
  name: string;
  members: Friend[];
  isGroup: true;
};

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<GroupChat | null>(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showModeratorSelector, setShowModeratorSelector] = useState(false);
  const [isChatWithModerator, setIsChatWithModerator] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Friend[]>([]);
  const [groupName, setGroupName] = useState("");
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
      setSelectedGroupChat(null);
    }
  }, [selectedFriend]);

  useEffect(() => {
    // Initialize group chat with a welcome message
    if (selectedGroupChat) {
      const memberNames = selectedGroupChat.members.map(m => m.name).join(", ");
      setMessages([
        {
          id: `welcome-group-${Date.now()}`,
          sender: "system",
          content: `Group chat "${selectedGroupChat.name}" started with members: ${memberNames}`,
          timestamp: new Date(),
        },
      ]);
      setShowFriendSelector(false);
      setShowGroupCreator(false);
      setIsChatWithModerator(false);
      setSelectedFriend(null);
    }
  }, [selectedGroupChat]);

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
    if (!isOpen && !selectedFriend && !isChatWithModerator && !selectedGroupChat) {
      setShowFriendSelector(true);
      setShowModeratorSelector(false);
      setShowGroupCreator(false);
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    // We already ensure only close friends are displayed in the selector
    // But as an extra safety check, we confirm here too
    if (friend.relationshipType !== 'friend') {
      return;
    }

    setSelectedFriend(friend);
    setSelectedGroupChat(null);
    setIsChatWithModerator(false);
    toast({
      title: "Chat started",
      description: `You can now chat with ${friend.name}.`,
    });
  };

  const handleCloseFriendSelector = () => {
    setShowFriendSelector(!showFriendSelector);
    setShowModeratorSelector(false);
    setShowGroupCreator(false);
    if (!selectedFriend && !isChatWithModerator && !selectedGroupChat && !showFriendSelector) {
      setIsOpen(false);
    }
  };

  const handleToggleModeratorSelector = () => {
    if (showModeratorSelector) {
      // Start a chat with a moderator
      setIsChatWithModerator(true);
      setSelectedFriend(null);
      setSelectedGroupChat(null);
      toast({
        title: "Moderator chat started",
        description: "You are now chatting with a staff moderator.",
      });
    } else {
      // Show the moderator selector
      setShowModeratorSelector(true);
      setShowFriendSelector(false);
      setShowGroupCreator(false);
    }
  };

  const handleToggleGroupCreator = () => {
    setShowGroupCreator(!showGroupCreator);
    setShowFriendSelector(false);
    setShowModeratorSelector(false);
  };

  const handleAddGroupMember = (friend: Friend) => {
    if (groupMembers.length >= 5) { // Max 6 people including current user
      toast({
        title: "Group limit reached",
        description: "A group chat can have a maximum of 6 members including you.",
        variant: "destructive"
      });
      return;
    }

    if (groupMembers.some(m => m.id === friend.id)) {
      toast({
        title: "Already added",
        description: `${friend.name} is already in this group.`,
        variant: "destructive"
      });
      return;
    }

    setGroupMembers([...groupMembers, friend]);
  };

  const handleRemoveGroupMember = (friendId: string) => {
    setGroupMembers(groupMembers.filter(m => m.id !== friendId));
  };

  const handleCreateGroupChat = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please provide a name for this group chat.",
        variant: "destructive"
      });
      return;
    }

    if (groupMembers.length === 0) {
      toast({
        title: "Add members",
        description: "Please add at least one friend to the group.",
        variant: "destructive"
      });
      return;
    }

    const newGroupChat: GroupChat = {
      id: `group-${Date.now()}`,
      name: groupName.trim(),
      members: [...groupMembers],
      isGroup: true
    };

    setSelectedGroupChat(newGroupChat);
    setGroupMembers([]);
    setGroupName("");
    toast({
      title: "Group chat created",
      description: `You've created the group "${newGroupChat.name}" with ${newGroupChat.members.length} member(s).`,
    });
  };

  const sendMessage = (content: string) => {
    if (!selectedFriend && !isChatWithModerator && !selectedGroupChat) return;
    
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
        setMessages((prev) => [...prev, responseMessage]);
      } else if (selectedGroupChat) {
        // Simulate multiple responses in a group chat
        const respondingMembers = selectedGroupChat.members.slice(0, 2); // Only a couple respond for simplicity
        
        respondingMembers.forEach((member, index) => {
          setTimeout(() => {
            const groupResponse: Message = {
              id: `friend-${member.id}-${Date.now()}`,
              sender: "friend",
              content: `Hi from ${member.name}! This is a simulated group response.`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, groupResponse]);
          }, 1000 * (index + 1)); // Stagger responses
        });
      } else if (selectedFriend) {
        responseMessage = {
          id: `friend-${Date.now()}`,
          sender: "friend",
          content: `Hi from ${selectedFriend?.name}! This is a simulated response.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, responseMessage]);
      }
    }, 1000);
  };

  const resetChat = () => {
    setSelectedFriend(null);
    setSelectedGroupChat(null);
    setIsChatWithModerator(false);
    setShowFriendSelector(true);
    setShowGroupCreator(false);
    setShowModeratorSelector(false);
    setGroupMembers([]);
    setGroupName("");
    setMessages([]);
  };

  return {
    isOpen,
    toggleChat,
    messages,
    selectedFriend,
    selectedGroupChat,
    showFriendSelector,
    showGroupCreator,
    showModeratorSelector,
    isChatWithModerator,
    groupMembers,
    groupName,
    setGroupName,
    handleSelectFriend,
    handleCloseFriendSelector,
    handleToggleModeratorSelector,
    handleToggleGroupCreator,
    handleAddGroupMember,
    handleRemoveGroupMember,
    handleCreateGroupChat,
    sendMessage,
    setIsOpen,
    setSelectedFriend,
    setShowFriendSelector,
    resetChat,
  };
};
