
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
      // Fetch events first
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      if (!eventsData || eventsData.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(eventsData.map(event => event.user_id))];
      
      // Fetch profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      // Create a map for quick profile lookup
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Combine events with profile data
      return eventsData.map(event => ({
        ...event,
        profiles: profilesMap.get(event.user_id) || {
          id: event.user_id,
          full_name: null,
          avatar_url: null
        }
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

  // Delete event mutation
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
    setEventData,
    setIsAddDialogOpen,
    handleInputChange,
    handleVisibilityChange,
    handleAccessTypeChange,
    handleSubmit,
  };
};
