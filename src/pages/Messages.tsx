
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

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

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch contacts (people who have messaged with the current user)
  const { data: contacts, refetch: refetchContacts } = useQuery({
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
  const { data: messages, refetch: refetchMessages } = useQuery({
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

  // Search for friends/users to message
  const { data: searchResults } = useQuery({
    queryKey: ["messageSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm || !user) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .neq("id", user.id)
        .ilike("full_name", `%${searchTerm}%`)
        .limit(5);

      if (error) {
        console.error("Error searching users:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!searchTerm && !!user,
  });

  // Subscribe to real-time messages
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

  const sendMessage = async () => {
    if (!user || !selectedContact || !messageInput.trim()) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: selectedContact.id,
          content: messageInput.trim(),
        });

      if (error) throw error;

      setMessageInput("");
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

  const filteredContacts = contacts?.filter(contact => 
    contact.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="social-card p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)]">
          {/* Contacts sidebar */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {searchTerm && searchResults && searchResults.length > 0 ? (
                <div className="p-2 bg-gray-100">
                  <h3 className="text-xs font-medium text-social-textSecondary px-2 py-1">SEARCH RESULTS</h3>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-2 hover:bg-social-gray rounded-lg cursor-pointer"
                      onClick={() => setSelectedContact(result)}
                    >
                      <Avatar>
                        <AvatarImage src={result.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {result.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{result.full_name}</p>
                        <p className="text-xs text-social-textSecondary">Start a new conversation</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filteredContacts && filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer ${
                      selectedContact?.id === contact.id ? "bg-social-lightblue" : "hover:bg-social-gray"
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <Avatar>
                      <AvatarImage src={contact.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {contact.full_name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contact.full_name}</p>
                    </div>
                  </div>
                ))
              )}

              {!searchTerm && (!contacts || contacts.length === 0) && (
                <div className="p-6 text-center text-social-textSecondary">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Search for friends to start messaging</p>
                </div>
              )}

              {searchTerm && (!searchResults || searchResults.length === 0) && (
                <div className="p-6 text-center text-social-textSecondary">
                  <p>No users found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedContact ? (
              <>
                {/* Contact header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedContact.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedContact.full_name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">{selectedContact.full_name}</h2>
                  </div>
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
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="bg-social-blue hover:bg-social-darkblue" 
                      onClick={sendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-social-textSecondary">
                <div className="text-center">
                  <h3 className="font-medium text-lg mb-2">Select a conversation</h3>
                  <p>Choose a contact from the left or search for someone to message</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
