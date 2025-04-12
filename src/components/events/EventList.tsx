
import { EventCard } from "./EventCard";
import { Event } from "@/types/event";

interface EventListProps {
  events: Event[];
  onDelete: (id: string) => void;
}

export const EventList = ({ events, onDelete }: EventListProps) => {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
