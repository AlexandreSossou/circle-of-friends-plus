
import { EventCard } from "./EventCard";
import { Event } from "@/types/event";

interface EventListProps {
  events: Event[];
  onDelete: (id: string) => void;
  onAttend: (eventId: string, accessType: "open" | "request") => void;
  onLeave: (eventId: string) => void;
}

export const EventList = ({ events, onDelete, onAttend, onLeave }: EventListProps) => {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          onDelete={onDelete}
          onAttend={onAttend}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
};
