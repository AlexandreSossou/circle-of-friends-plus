import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { EventFormData } from "@/types/event";
import { useToast } from "@/hooks/use-toast";

interface EditEventDialogProps {
  eventId: string;
  initialData: EventFormData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditEventDialog = ({ 
  eventId, 
  initialData, 
  open, 
  onOpenChange 
}: EditEventDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [eventData, setEventData] = useState<EventFormData>(initialData);

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const { error } = await supabase
        .from("events")
        .update({
          title: data.title,
          description: data.description || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
          time: data.time || null,
          location: data.location || null,
          visibility: data.visibility,
          access_type: data.access_type,
        })
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onOpenChange(false);
      toast({
        title: "Success!",
        description: "Event updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
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
    updateEventMutation.mutate(eventData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <EventForm
          eventData={eventData}
          isPending={updateEventMutation.isPending}
          onInputChange={handleInputChange}
          onVisibilityChange={handleVisibilityChange}
          onAccessTypeChange={handleAccessTypeChange}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
