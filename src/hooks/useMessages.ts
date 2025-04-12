
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Contact = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read: boolean;
};

export const useMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch contacts (people who have messaged with the current user)
  const { 
    data: contacts, 
    refetch: refetchContacts 
  } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get unique contacts from both sent and received messages
      const { data: messages, error } = await supabase
        .from("messages")
        .select("sender_id, recipient_id")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      // Extract unique user IDs that aren't the current user
      const contactIds = new Set<string>();
      messages?.forEach(msg => {
        if (msg.sender_id !== user.id) contactIds.add(msg.sender_id);
        if (msg.recipient_id !== user.id) contactIds.add(msg.recipient_id);
      });

      // Remove current user from contacts if it exists
      contactIds.delete(user.id);

      // Fetch user details for all contacts
      if (contactIds.size === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(contactIds));

      if (profilesError) {
        console.error("Error fetching contacts:", profilesError);
        return [];
      }

      return profiles || [];
    },
    enabled: !!user,
  });

  // Fetch messages with selected contact
  const { 
    data: messages, 
    refetch: refetchMessages 
  } = useQuery({
    queryKey: ["messages", user?.id, selectedContact?.id],
    queryFn: async () => {
      if (!user || !selectedContact) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      // Mark messages as read
      const unreadMessages = data.filter(msg => 
        msg.recipient_id === user.id && !msg.read
      );
      
      if (unreadMessages.length > 0) {
        unreadMessages.forEach(async (msg) => {
          await supabase
            .from("messages")
            .update({ read: true })
            .eq("id", msg.id);
        });
      }

      return data || [];
    },
    enabled: !!user && !!selectedContact,
  });

  // Search for users
  const { data: searchResults } = useQuery({
    queryKey: ["messageSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm || !user || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .neq("id", user.id)
        .ilike("full_name", `%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error("Error searching users:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!searchTerm && searchTerm.length >= 2 && !!user,
  });

  // Send a message
  const sendMessage = async (content: string) => {
    if (!user || !selectedContact) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: selectedContact.id,
          content,
        });

      if (error) throw error;

      refetchMessages();
      refetchContacts();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user.id}` 
      }, () => {
        refetchMessages();
        refetchContacts();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchMessages, refetchContacts]);

  return {
    contacts,
    messages,
    searchResults,
    selectedContact,
    setSelectedContact,
    searchTerm,
    setSearchTerm,
    sendMessage,
  };
};
