
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Event, EventFormData } from "@/types/event";
import { useAuth } from "@/context/AuthContext";

export const useEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [eventData, setEventData] = useState<EventFormData>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    time: "",
    location: "",
    visibility: "public",
    access_type: "open",
  });

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      // Get user's location first for proximity sorting
      let userLocation = null;
      if (user) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("location")
          .eq("id", user.id)
          .single();
        userLocation = userProfile?.location;
      }

      // Fetch events with attendance data
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *, 
          profiles!user_id(id, full_name, avatar_url),
          event_attendees(user_id, status)
        `)
        .order("start_date", { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      if (!eventsData || eventsData.length === 0) {
        return [];
      }

      // Sort events by location proximity if user has location
      let sortedEvents = eventsData;
      if (userLocation) {
        sortedEvents = eventsData.sort((a, b) => {
          // Events in user's location come first
          const aIsLocal = a.location?.toLowerCase().includes(userLocation.toLowerCase());
          const bIsLocal = b.location?.toLowerCase().includes(userLocation.toLowerCase());
          
          if (aIsLocal && !bIsLocal) return -1;
          if (!aIsLocal && bIsLocal) return 1;
          
          // Then sort by date
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });
      }

      return sortedEvents.map(event => ({
        ...event,
        profiles: event.profiles || {
          id: event.user_id,
          full_name: null,
          avatar_url: null
        },
        isAttending: event.event_attendees?.some(
          (attendee: any) => attendee.user_id === user?.id && attendee.status === 'attending'
        ),
        isPending: event.event_attendees?.some(
          (attendee: any) => attendee.user_id === user?.id && attendee.status === 'pending'
        ),
        attendeeCount: event.event_attendees?.filter((a: any) => a.status === 'attending').length || 0
      })) as Event[];
    },
    enabled: !!user,
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (!user) throw new Error("You must be logged in to create events");
      
      const { data: eventData, error } = await supabase.from("events").insert({
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        time: data.time || null,
        location: data.location || null,
        visibility: data.visibility,
        access_type: data.access_type,
      }).select().single();

      if (error) throw error;
      return eventData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEventData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        time: "",
        location: "",
        visibility: "public",
        access_type: "open",
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Success!",
        description: "Your event has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Attend event mutation
  const attendEventMutation = useMutation({
    mutationFn: async ({ eventId, accessType }: { eventId: string; accessType: "open" | "request" }) => {
      if (!user) throw new Error("You must be logged in to attend events");
      
      const status = accessType === "open" ? "attending" : "pending";
      
      const { data, error } = await supabase
        .from("event_attendees")
        .insert({
          event_id: eventId,
          user_id: user.id,
          status
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success!",
        description: variables.accessType === "open" 
          ? "You're now attending this event!" 
          : "Your attendance request has been sent!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join event",
        variant: "destructive",
      });
    },
  });

  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error("You must be logged in");
      
      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success!",
        description: "You've left the event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to leave event",
        variant: "destructive",
      });
    },
  });
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success!",
        description: "Event deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisibilityChange = (value: string) => {
    setEventData((prev) => ({ ...prev, visibility: value as "public" | "friends" | "private" }));
  };

  const handleAccessTypeChange = (value: string) => {
    setEventData((prev) => ({ ...prev, access_type: value as "open" | "request" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEventMutation.mutate(eventData);
  };

  return {
    events,
    isLoading,
    eventData,
    isAddDialogOpen,
    addEventMutation,
    deleteEventMutation,
    attendEventMutation,
    leaveEventMutation,
    setEventData,
    setIsAddDialogOpen,
    handleInputChange,
    handleVisibilityChange,
    handleAccessTypeChange,
    handleSubmit,
  };
};
