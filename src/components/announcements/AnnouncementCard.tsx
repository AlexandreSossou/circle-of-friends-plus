import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Trash2, Eye, Users, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Announcement } from "@/types/announcement";
import { useAuth } from "@/context/AuthContext";

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete: (id: string) => void;
}

export const AnnouncementCard = ({ announcement, onDelete }: AnnouncementCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === announcement.user_id;

  const getVisibilityIcon = () => {
    switch (announcement.visibility) {
      case "public":
        return <Eye className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getUserInitials = () => {
    const name = announcement.profiles.full_name || "";
    if (!name) return "?";
    
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="social-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage 
                src={announcement.profiles.avatar_url || "/placeholder.svg"} 
                alt={announcement.profiles.full_name || "User"} 
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{announcement.title}</h3>
              <div className="flex items-center gap-2 text-sm text-social-textSecondary">
                <span>{announcement.profiles.full_name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-social-textSecondary">
              {getVisibilityIcon()}
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(announcement.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {announcement.description && (
          <p className="text-social-textPrimary mb-3">{announcement.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-social-textSecondary">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{announcement.location}</span>
          </div>
          <div className="px-2 py-1 bg-social-lightblue text-social-blue rounded-full text-xs font-medium">
            {announcement.category}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};