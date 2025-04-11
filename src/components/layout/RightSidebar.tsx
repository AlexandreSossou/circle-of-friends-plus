
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const RightSidebar = () => {
  const friendSuggestions = [
    { id: 1, name: "Emma Watson", mutualFriends: 5, avatar: "/placeholder.svg", initials: "EW" },
    { id: 2, name: "James Smith", mutualFriends: 3, avatar: "/placeholder.svg", initials: "JS" },
    { id: 3, name: "Sarah Johnson", mutualFriends: 7, avatar: "/placeholder.svg", initials: "SJ" },
    { id: 4, name: "Michael Brown", mutualFriends: 2, avatar: "/placeholder.svg", initials: "MB" }
  ];

  const ongoingEvents = [
    { id: 1, name: "Tech Conference 2025", time: "Tomorrow, 10:00 AM" },
    { id: 2, name: "Book Club Meeting", time: "Today, 7:00 PM" }
  ];

  return (
    <div className="space-y-6">
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">Friend Suggestions</h3>
        <div className="space-y-4">
          {friendSuggestions.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback>{friend.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-xs text-social-textSecondary">{friend.mutualFriends} mutual friends</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-social-blue">
                <UserPlus className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
        <Link to="/friends/suggestions" className="block mt-3 text-social-blue text-sm font-medium">
          See all suggestions
        </Link>
      </div>
      
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
        <h3 className="font-semibold mb-3">Contacts</h3>
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
