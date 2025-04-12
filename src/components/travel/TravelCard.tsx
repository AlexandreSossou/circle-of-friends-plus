
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { Calendar, MapPin, Plane, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Travel } from "@/types/travel";

interface TravelCardProps {
  travel: Travel;
  currentUser: any;
  onDelete: () => void;
}

export const TravelCard = ({ travel, currentUser, onDelete }: TravelCardProps) => {
  const isCurrentUserTravel = currentUser && travel.user_id === currentUser.id;
  const isCurrentlyTraveling = () => {
    const now = new Date();
    const arrival = parseISO(travel.arrival_date);
    const departure = parseISO(travel.departure_date);
    return isAfter(now, arrival) && isBefore(now, departure);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
        <div className="flex items-center">
          <Avatar className="mr-3">
            <AvatarImage src={travel.profiles.avatar_url || "/placeholder.svg"} alt={travel.profiles.full_name || "User"} />
            <AvatarFallback>
              {travel.profiles.full_name?.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{travel.profiles.full_name || "User"}</CardTitle>
            <div className="flex items-center text-sm text-social-textSecondary">
              <MapPin className="w-3 h-3 mr-1" />
              {travel.city}, {travel.country}
            </div>
          </div>
        </div>
        {isCurrentlyTraveling() && (
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Currently there</div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center text-social-textSecondary">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {format(parseISO(travel.arrival_date), "MMM d, yyyy")} - {format(parseISO(travel.departure_date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center text-social-textSecondary">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{renderLookingForText(travel.looking_for)}</span>
          </div>
          {travel.description && (
            <p className="text-sm mt-2">{travel.description}</p>
          )}
        </div>
      </CardContent>
      {isCurrentUserTravel && (
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

function renderLookingForText(lookingFor: "locals" | "tourists" | "both") {
  switch (lookingFor) {
    case "locals":
      return "Looking to meet locals";
    case "tourists":
      return "Looking to meet other travelers";
    case "both":
      return "Looking to meet locals and travelers";
  }
}
