
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RegionalAlertCarousel } from "@/components/announcements/RegionalAlertCarousel";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import NewsPreview from "@/components/news/NewsPreview";

const RightSidebar = () => {
  const { user } = useAuth();
  const { onlineUsers } = useOnlineUsers();
  
  // Fetch user profile to get location
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Use profile location or fallback to New York
  const userLocation = userProfile?.location || "New York";
  
  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: async () => {
      // Get events starting from today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, start_date, time")
        .gte("start_date", today)
        .order("start_date", { ascending: true })
        .limit(3);

      if (eventsError) {
        throw eventsError;
      }

      return eventsData || [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <RegionalAlertCarousel userLocation={userLocation} />
      <NewsPreview />
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="block p-2 hover:bg-social-gray rounded-lg">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-social-textSecondary">
                  {format(parseISO(event.start_date), 'MMM d, yyyy')}
                  {event.time && ` • ${event.time}`}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-social-textSecondary">No upcoming events</p>
          )}
        </div>
        <Link to="/events" className="block mt-3 text-social-blue text-sm font-medium">
          See all events
        </Link>
      </div>
      
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">Online ({onlineUsers.length})</h3>
        <div className="space-y-2">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="mr-3">
                      <AvatarImage src={onlineUser.avatar_url} alt={onlineUser.full_name} />
                      <AvatarFallback>
                        {onlineUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <span className="text-sm">{onlineUser.full_name}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-social-textSecondary">No users online</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
