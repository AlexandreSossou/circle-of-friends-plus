
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
  });

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order("start_date", { ascending: true });

      if (error) {
        throw error;
      }
      
      // Transform the data to match the Event type
      return (data as any[]).map(event => ({
        ...event,
        profiles: {
          id: event.profiles?.id || "",
          full_name: event.profiles?.full_name || null,
          avatar_url: event.profiles?.avatar_url || null
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
    handleSubmit,
  };
};
