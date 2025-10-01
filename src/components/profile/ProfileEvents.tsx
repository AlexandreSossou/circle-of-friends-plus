import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileEventsProps {
  userId: string;
}

export const ProfileEvents = ({ userId }: ProfileEventsProps) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["user-events", userId],
    queryFn: async () => {
      // Get all event attendees records for this user
      const { data: attendeeData, error: attendeeError } = await supabase
        .from("event_attendees")
        .select("event_id, status")
        .eq("user_id", userId)
        .in("status", ["attending", "pending"]);

      if (attendeeError) throw attendeeError;
      if (!attendeeData || attendeeData.length === 0) return [];

      const eventIds = attendeeData.map(a => a.event_id);

      // Get event details
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          profiles!user_id(id, full_name, avatar_url)
        `)
        .in("id", eventIds)
        .order("start_date", { ascending: true });

      if (eventsError) throw eventsError;

      // Merge attendee status with event data
      return eventsData?.map(event => ({
        ...event,
        attendeeStatus: attendeeData.find(a => a.event_id === event.id)?.status || "attending"
      })) || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-social-textSecondary">Loading events...</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-social-textSecondary" />
        <p className="text-social-textSecondary">No events to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link key={event.id} to={`/events/${event.id}`}>
          <Card className="hover:bg-social-gray/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-social-textSecondary">
                    Organized by {event.profiles?.full_name || "Unknown"}
                  </p>
                </div>
                {event.attendeeStatus === "pending" && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
                    Pending
                  </Badge>
                )}
              </div>

              {event.description && (
                <p className="text-sm text-social-textSecondary mb-3 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-social-textSecondary">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {format(parseISO(event.start_date), "MMM d, yyyy")}
                    {event.end_date && event.end_date !== event.start_date && 
                      ` - ${format(parseISO(event.end_date), "MMM d, yyyy")}`}
                  </span>
                </div>

                {event.time && (
                  <div className="flex items-center text-social-textSecondary">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center text-social-textSecondary">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                )}

                <div className="flex items-center text-social-textSecondary">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {event.visibility === "public" ? "Public" : 
                     event.visibility === "friends" ? "Lovarinos Only" : "Private"} • 
                    {event.access_type === "open" ? " Open" : " Request to Join"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
