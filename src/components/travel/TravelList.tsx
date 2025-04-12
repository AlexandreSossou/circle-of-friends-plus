
import { Travel } from "@/types/travel";
import { TravelCard } from "./TravelCard";
import { isAfter, isBefore, parseISO } from "date-fns";
import { MapPin, UserIcon } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface TravelListProps {
  travels: Travel[];
  currentUser: any;
  onDelete: (id: string) => void;
}

export const TravelList = ({ travels, currentUser, onDelete }: TravelListProps) => {
  const { allFriends } = useFriends();
  
  const isCurrentlyTraveling = (travel: Travel) => {
    const now = new Date();
    const arrival = parseISO(travel.arrival_date);
    const departure = parseISO(travel.departure_date);
    return isAfter(now, arrival) && isBefore(now, departure);
  };

  const isFutureTraveling = (travel: Travel) => {
    const now = new Date();
    const arrival = parseISO(travel.arrival_date);
    return isAfter(arrival, now);
  };

  const groupTravelsByLocation = (travels: Travel[]) => {
    return travels.reduce((acc, travel) => {
      const key = `${travel.city}, ${travel.country}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(travel);
      return acc;
    }, {} as Record<string, Travel[]>);
  };

  // Find friends near a location
  const findFriendsNearLocation = (city: string, country: string) => {
    // This is a simple implementation that just checks for exact matches
    // In a real app, you might use a location API to check for nearby cities
    return allFriends.filter(friend => {
      // Check if friend has location information
      if (!friend.location) return false;
      
      // Split location into city and country (assuming format "City, Country")
      const locationParts = friend.location.split(", ");
      if (locationParts.length !== 2) return false;
      
      const [friendCity, friendCountry] = locationParts;
      
      // Check for exact match or nearby (for demo, we'll just check if country matches)
      return (
        (friendCity.toLowerCase() === city.toLowerCase() && 
         friendCountry.toLowerCase() === country.toLowerCase()) ||
        friendCountry.toLowerCase() === country.toLowerCase()
      );
    });
  };

  // Get currently traveling users
  const currentlyTraveling = travels.filter(isCurrentlyTraveling);
  
  // Get future travel plans
  const futureTravels = travels.filter(isFutureTraveling);
  
  // Group travels by location
  const travelsByLocation = groupTravelsByLocation(travels);

  return (
    <div className="space-y-8">
      {/* Currently Traveling Section */}
      {currentlyTraveling.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Currently Traveling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentlyTraveling.map((travel) => (
              <TravelCard 
                key={travel.id} 
                travel={travel} 
                currentUser={currentUser}
                onDelete={() => onDelete(travel.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Travels Section */}
      {futureTravels.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Travels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futureTravels.map((travel) => (
              <TravelCard 
                key={travel.id} 
                travel={travel} 
                currentUser={currentUser}
                onDelete={() => onDelete(travel.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Travel by Location Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Travel Destinations</h2>
        {Object.entries(travelsByLocation).map(([location, travels]) => {
          const [city, country] = location.split(", ");
          const friendsAtLocation = findFriendsNearLocation(city, country);
          
          return (
            <div key={location} className="mb-8">
              <h3 className="font-medium text-lg flex items-center mb-3">
                <MapPin className="w-5 h-5 mr-1 text-social-blue" />
                {location}
                <span className="ml-2 text-sm text-social-textSecondary">
                  ({travels.length} {travels.length === 1 ? "traveler" : "travelers"})
                </span>
              </h3>
              
              {/* Friends at this location */}
              {friendsAtLocation.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <UserIcon className="w-4 h-4 mr-1 text-social-blue" />
                    {friendsAtLocation.length === 1 
                      ? "1 friend lives here" 
                      : `${friendsAtLocation.length} friends live here or nearby`}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {friendsAtLocation.map(friend => (
                      <Link 
                        key={friend.id} 
                        to={`/profile/${friend.id}`}
                        className="flex items-center p-1 px-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>{friend.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{friend.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travels.map((travel) => (
                  <TravelCard 
                    key={travel.id} 
                    travel={travel} 
                    currentUser={currentUser}
                    onDelete={() => onDelete(travel.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
