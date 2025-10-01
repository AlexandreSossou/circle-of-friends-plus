import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { EventJoinRequests } from "@/components/events/EventJoinRequests";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventFormData } from "@/types/event";

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("No event ID provided");
      
      // First get the event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) throw new Error("Event not found");
      
      // Get the organizer profile
      const { data: organizer } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", eventData.user_id)
        .single();

      // Get event attendees with their profiles
      const { data: attendeesData } = await supabase
        .from("event_attendees")
        .select(`
          id,
          status,
          user_id
        `)
        .eq("event_id", id);

      let attendeeProfiles = [];
      if (attendeesData && attendeesData.length > 0) {
        const userIds = attendeesData.map(a => a.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        
        attendeeProfiles = attendeesData.map(attendee => ({
          ...attendee,
          profiles: profilesData?.find(p => p.id === attendee.user_id)
        }));
      }
      
      return {
        ...eventData,
        profiles: organizer,
        event_attendees: attendeeProfiles
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center p-8">
          <p>Loading event...</p>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-social-textSecondary mb-4">The event you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/events">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const attendees = event.event_attendees?.filter(a => a.status === 'attending') || [];
  const pendingRequests = event.event_attendees?.filter(a => a.status === 'pending') || [];
  const isCreator = user?.id === event.user_id;

  const eventFormData: EventFormData = {
    title: event.title,
    description: event.description || "",
    start_date: event.start_date,
    end_date: event.end_date || "",
    time: event.time || "",
    location: event.location || "",
    visibility: event.visibility as "public" | "friends" | "private",
    access_type: event.access_type as "open" | "request",
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          {isCreator && (
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Button>
          )}
        </div>

        {isCreator && pendingRequests.length > 0 && (
          <EventJoinRequests eventId={id!} requests={pendingRequests} />
        )}

        <div className="social-card p-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar>
              <AvatarImage src={event.profiles?.avatar_url} />
              <AvatarFallback>
                {event.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <p className="text-social-textSecondary">
                Organized by {event.profiles?.full_name}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-social-blue" />
                <div>
                  <p className="font-medium">
                    {format(parseISO(event.start_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {event.end_date && event.end_date !== event.start_date && (
                    <p className="text-sm text-social-textSecondary">
                      to {format(parseISO(event.end_date), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>

              {event.time && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-social-blue" />
                  <p>{event.time}</p>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-social-blue" />
                  <p>{event.location}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-social-blue" />
                <p>{attendees.length} attending</p>
              </div>
            </div>

            {event.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-social-textSecondary whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>

          {attendees.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Attendees ({attendees.length})</h3>
              <div className="flex flex-wrap gap-2">
                {attendees.slice(0, 10).map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-2 bg-social-gray p-2 rounded-lg">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={attendee.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {attendee.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{attendee.profiles?.full_name}</span>
                  </div>
                ))}
                {attendees.length > 10 && (
                  <div className="flex items-center justify-center bg-social-gray p-2 rounded-lg text-sm text-social-textSecondary">
                    +{attendees.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isCreator && (
          <EditEventDialog
            eventId={id!}
            initialData={eventFormData}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default EventDetail;