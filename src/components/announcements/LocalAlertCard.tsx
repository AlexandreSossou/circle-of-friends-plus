import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Trash2, Eye, Users, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LocalAlert } from "@/types/localAlert";
import { useAuth } from "@/context/AuthContext";

interface LocalAlertCardProps {
  localAlert: LocalAlert;
  onDelete: (id: string) => void;
}

export const LocalAlertCard = ({ localAlert, onDelete }: LocalAlertCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === localAlert.user_id;

  const getVisibilityIcon = () => {
    switch (localAlert.visibility) {
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
    const name = localAlert.profiles.full_name || "";
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
                src={localAlert.profiles.avatar_url || "/placeholder.svg"} 
                alt={localAlert.profiles.full_name || "User"} 
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{localAlert.title}</h3>
              <div className="flex items-center gap-2 text-sm text-social-textSecondary">
                <span>{localAlert.profiles.full_name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(localAlert.created_at), { addSuffix: true })}</span>
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
                onClick={() => onDelete(localAlert.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {localAlert.description && (
          <p className="text-social-textPrimary mb-3">{localAlert.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-social-textSecondary">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{localAlert.location}</span>
          </div>
          <div className="px-2 py-1 bg-social-lightblue text-social-blue rounded-full text-xs font-medium">
            {localAlert.category}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};