
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventList } from "@/components/events/EventList";
import { EventForm } from "@/components/events/EventForm";
import { EmptyEventState } from "@/components/events/EmptyEventState";
import { useEvents } from "@/hooks/useEvents";

const Events = () => {
  const {
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
  } = useEvents();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CalendarPlus className="w-4 h-4 mr-1" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm
                eventData={eventData}
                isPending={addEventMutation.isPending}
                onInputChange={handleInputChange}
                onVisibilityChange={(value) => setEventData((prev) => ({ ...prev, visibility: value as "public" | "friends" | "private" }))}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <EventList 
            events={events} 
            onDelete={(id) => deleteEventMutation.mutate(id)} 
          />
        ) : (
          <EmptyEventState onAddClick={() => setIsAddDialogOpen(true)} />
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
