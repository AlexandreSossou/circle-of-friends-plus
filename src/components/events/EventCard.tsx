
import { useState } from "react";
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

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

export const EventCard = ({ event, onDelete }: EventCardProps) => {
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

  return (
    <div className="social-card p-4 overflow-hidden">
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-red-500">
                <Trash className="w-4 h-4 mr-2" /> Delete
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
      
      <div className="mt-4 flex justify-end">
        <Button>Attend</Button>
      </div>
    </div>
  );
};
