
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRelationshipStatus } from "@/hooks/useRelationshipStatus";

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

export const useMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | PartnerGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Handle URL parameters for couple messaging
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coupleId = urlParams.get('couple');
    const recipientId = urlParams.get('recipient');
    
    if (coupleId && user) {
      // Fetch couple profile and partners for group messaging
      const fetchCoupleInfo = async () => {
        const { data: coupleProfile, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, partners, private_partners, partner_id, private_partner_id')
          .eq('id', coupleId)
          .single();
          
        if (error || !coupleProfile) return;
        
        // Get all partner IDs
        let partnerIds: string[] = [];
        if (coupleProfile.partners?.length) {
          partnerIds.push(...coupleProfile.partners);
        }
        if (coupleProfile.private_partners?.length) {
          partnerIds.push(...coupleProfile.private_partners);
        }
        if (coupleProfile.partner_id) {
          partnerIds.push(coupleProfile.partner_id);
        }
        if (coupleProfile.private_partner_id) {
          partnerIds.push(coupleProfile.private_partner_id);
        }
        
        // Add the couple's own ID to the list
        partnerIds.push(coupleId);
        
        // Remove duplicates and current user
        partnerIds = [...new Set(partnerIds)].filter(id => id !== user.id);
        
        if (partnerIds.length > 0) {
          // Fetch partner details
          const { data: partners, error: partnersError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', partnerIds);
            
          if (!partnersError && partners) {
            const coupleGroup: PartnerGroup = {
              id: `couple-${coupleId}`,
              full_name: `Message Couple`,
              avatar_url: null,
              isPartnerGroup: true,
              partners: partners.map(p => ({
                id: p.id,
                full_name: p.full_name,
                avatar_url: p.avatar_url
              }))
            };
            setSelectedContact(coupleGroup);
          }
        }
      };
      
      fetchCoupleInfo();
    } else if (recipientId) {
      // Handle single recipient messaging
      const fetchRecipient = async () => {
        const { data: recipient, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', recipientId)
          .single();
          
        if (!error && recipient) {
          setSelectedContact({
            id: recipient.id,
            full_name: recipient.full_name,
            avatar_url: recipient.avatar_url
          });
        }
      };
      
      fetchRecipient();
    }
  }, [user]);
  const { partners, potentialPartners } = useRelationshipStatus();

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
        const messageIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", messageIds);
        
        // Force invalidate and refetch unread messages query with user ID to update navbar notifications
        await queryClient.invalidateQueries({ queryKey: ["unreadMessages", user.id] });
        queryClient.refetchQueries({ queryKey: ["unreadMessages", user.id] });
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

  // Create partner group if user has partners
  const partnerGroup: PartnerGroup | undefined = (() => {
    if (!partners || partners.length === 0) return undefined;
    
    const partnerContacts = partners
      .map(partnerId => potentialPartners.find(p => p.id === partnerId))
      .filter((partner): partner is Contact => !!partner)
      .map(partner => ({
        id: partner.id,
        full_name: partner.full_name,
        avatar_url: null
      }));
    
    if (partnerContacts.length === 0) return undefined;
    
    return {
      id: 'partners-group',
      full_name: 'Message Both Partners',
      avatar_url: null,
      isPartnerGroup: true as const,
      partners: partnerContacts
    };
  })();

  // Send a message with enhanced security validation
  const sendMessage = async (content: string) => {
    if (!user || !selectedContact) return;

    try {
      // Validate content before sending using secure validation
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('secure-content-validation', {
        body: {
          content: content.trim(),
          userId: user.id,
          contentType: 'message'
        }
      });

      if (validationError) {
        console.error('Content validation failed:', validationError);
        toast({
          title: "Validation Error",
          description: "Unable to validate message content. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Block message if flagged with high severity
      if (validationResult?.flagged && validationResult.severityLevel === 'high') {
        toast({
          title: "Message Blocked",
          description: "Your message violates our community guidelines and cannot be sent.",
          variant: "destructive"
        });
        return;
      }

      // Show warning for medium severity but allow sending
      if (validationResult?.flagged && validationResult.severityLevel === 'medium') {
        toast({
          title: "Content Warning",
          description: "Your message has been flagged for review but will be sent.",
          variant: "default"
        });
      }

      // Handle partner group messaging
      if ('isPartnerGroup' in selectedContact && selectedContact.isPartnerGroup) {
        const recipients = selectedContact.partners;
        
        for (const recipient of recipients) {
          await sendSingleMessage(content, recipient.id);
        }
        
        toast({
          title: "Messages sent",
          description: `Your message has been sent to ${recipients.length} partners.`
        });
        return;
      }

      // Handle single contact messaging
      await sendSingleMessage(content, selectedContact.id);
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered."
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to send message to a single recipient
  const sendSingleMessage = async (content: string, recipientId: string) => {
    if (!user) return;

    try {
      // Validate content before sending using secure validation
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('secure-content-validation', {
        body: {
          content: content.trim(),
          userId: user.id,
          contentType: 'message'
        }
      });

      if (validationError) {
        console.error('Content validation failed:', validationError);
        toast({
          title: "Validation Error",
          description: "Unable to validate message content. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Block message if flagged with high severity
      if (validationResult?.flagged && validationResult.severityLevel === 'high') {
        toast({
          title: "Message Blocked",
          description: "Your message violates our community guidelines and cannot be sent.",
          variant: "destructive"
        });
        return;
      }

      // Show warning for medium severity but allow sending
      if (validationResult?.flagged && validationResult.severityLevel === 'medium') {
        toast({
          title: "Content Warning",
          description: "Your message has been flagged for review but will be sent.",
          variant: "default"
        });
      }

      // Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
        })
        .select()
        .single();

      if (messageError) throw messageError;

      refetchMessages();
      refetchContacts();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
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
    partnerGroup,
  };
};
