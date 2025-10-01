
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, MoreVertical, Trash, Edit, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onAttend: (eventId: string, accessType: "open" | "request") => void;
  onLeave: (eventId: string) => void;
}

export const EventCard = ({ event, onDelete, onAttend, onLeave }: EventCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const getVisibilityLabel = () => {
    switch (event.visibility) {
      case "public": return "Public";
      case "friends": return "Lovarinos Only";
      case "private": return "Private";
      default: return "Public";
    }
  };

  const getVisibilityColor = () => {
    switch (event.visibility) {
      case "public": return "bg-green-500";
      case "friends": return "bg-blue-500";
      case "private": return "bg-purple-500";
      default: return "bg-green-500";
    }
  };

  const isCreator = user?.id === event.user_id;

  const handleShare = () => {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Event link copied to clipboard",
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or dropdown
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    navigate(`/events/${event.id}`);
  };

  return (
    <div 
      className="social-card p-4 overflow-hidden cursor-pointer hover:bg-social-gray/50 transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={event.profiles?.avatar_url || "/placeholder.svg"} alt={event.title} />
            <AvatarFallback>{event.title.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold">{event.title}</h3>
            <div className="flex items-center text-sm text-social-textSecondary mt-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>
                {format(new Date(event.start_date), "MMM d, yyyy")}
                {event.end_date && ` - ${format(new Date(event.end_date), "MMM d, yyyy")}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={getVisibilityColor()}>
            {getVisibilityLabel()}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCreator && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(event.id);
                    }} 
                    className="text-red-500"
                  >
                    <Trash className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className={`mt-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
        <p className="text-sm">{event.description}</p>
      </div>
      
      {event.description && event.description.length > 150 && (
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 p-0 h-auto"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </Button>
      )}
      
      <div className="mt-4 space-y-2 text-sm">
        {event.location && (
          <div className="flex items-center text-social-textSecondary">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>
        )}
        
        {event.time && (
          <div className="flex items-center text-social-textSecondary">
            <Clock className="w-4 h-4 mr-2" />
            <span>{event.time}</span>
          </div>
        )}
        
        <div className="flex items-center text-social-textSecondary">
          <Users className="w-4 h-4 mr-2" />
          <span>Organized by {event.profiles?.full_name || "Unknown"}</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-social-textSecondary">
          {event.attendeeCount > 0 && (
            <span>{event.attendeeCount} attending</span>
          )}
        </div>
        <div className="flex gap-2">
          {event.isAttending ? (
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onLeave(event.id);
              }}
            >
              Leave Event
            </Button>
          ) : event.isPending ? (
            <Button variant="outline" disabled>
              Request Pending
            </Button>
          ) : (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onAttend(event.id, event.access_type);
              }}
            >
              {event.access_type === "request" ? "Ask to Attend" : "Attend"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
