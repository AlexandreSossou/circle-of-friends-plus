
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnnouncementCarousel } from "@/components/announcements/AnnouncementCarousel";
import { useAuth } from "@/context/AuthContext";

const RightSidebar = () => {
  const { user } = useAuth();
  
  // Get user location from profile metadata or default to a general area
  const userLocation = user?.user_metadata?.location || "New York";
  
  const ongoingEvents = [
    { id: 1, name: "Tech Conference 2025", time: "Tomorrow, 10:00 AM" },
    { id: 2, name: "Book Club Meeting", time: "Today, 7:00 PM" }
  ];

  return (
    <div className="space-y-6">
      <AnnouncementCarousel userLocation={userLocation} />
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          {ongoingEvents.map((event) => (
            <Link to={`/events/${event.id}`} key={event.id} className="block p-2 hover:bg-social-gray rounded-lg">
              <p className="font-medium">{event.name}</p>
              <p className="text-xs text-social-textSecondary">{event.time}</p>
            </Link>
          ))}
        </div>
        <Link to="/events" className="block mt-3 text-social-blue text-sm font-medium">
          See all events
        </Link>
      </div>
      
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">Online</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <Avatar className="mr-3">
                  <AvatarImage src="/placeholder.svg" alt="David Lee" />
                  <AvatarFallback>DL</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <span>David Lee</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <Avatar className="mr-3">
                  <AvatarImage src="/placeholder.svg" alt="Jessica Taylor" />
                  <AvatarFallback>JT</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <span>Jessica Taylor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
