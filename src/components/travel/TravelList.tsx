
import { Travel } from "@/types/travel";
import { TravelCard } from "./TravelCard";
import { isAfter, isBefore, parseISO } from "date-fns";
import { MapPin } from "lucide-react";

interface TravelListProps {
  travels: Travel[];
  currentUser: any;
  onDelete: (id: string) => void;
}

export const TravelList = ({ travels, currentUser, onDelete }: TravelListProps) => {
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
        {Object.entries(travelsByLocation).map(([location, travels]) => (
          <div key={location} className="mb-6">
            <h3 className="font-medium text-lg flex items-center mb-3">
              <MapPin className="w-5 h-5 mr-1 text-social-blue" />
              {location}
              <span className="ml-2 text-sm text-social-textSecondary">
                ({travels.length} {travels.length === 1 ? "traveler" : "travelers"})
              </span>
            </h3>
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
        ))}
      </div>
    </div>
  );
};
