
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileType } from "@/types/profile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RelationshipStatusDisplay from "../relationship/RelationshipStatusDisplay";

interface ProfileInfoProps {
  fullName: string;
  username?: string;
  privateUsername?: string;
  location?: string;
  age?: number;
  gender?: string;
  sexualOrientation?: string;
  libido?: string;
  maritalStatus?: string;
  privateMaritalStatus?: string;
  partnerId?: string;
  privatePartnerId?: string;
  partners?: string[];
  privatePartners?: string[];
  partnerName?: string;
  lookingFor?: string[];
  isEditing: boolean;
  editedLocation: string;
  onLocationChange: (value: string) => void;
  profileType?: ProfileType;
  isOwnProfile?: boolean;
}

const ProfileInfo = ({
  fullName,
  username,
  privateUsername,
  location,
  age,
  gender,
  sexualOrientation,
  libido,
  maritalStatus,
  privateMaritalStatus,
  partnerId,
  privatePartnerId,
  partners,
  privatePartners,
  partnerName,
  lookingFor,
  isEditing,
  editedLocation,
  onLocationChange,
  profileType = "public",
  isOwnProfile = false
}: ProfileInfoProps) => {
  // Determine what name/username to display based on profile type
  const displayName = (() => {
    if (profileType === "private" && privateUsername) {
      return privateUsername;
    }
    if (profileType === "public" && username) {
      return username;
    }
    // For own profile, always show full name
    if (isOwnProfile) {
      return fullName;
    }
    // For visitors viewing public profile, show username or full name
    return username || fullName;
  })();

  // Get the appropriate relationship status based on profile type
  const currentMaritalStatus = profileType === "private" ? privateMaritalStatus : maritalStatus;
  const currentPartnerId = profileType === "private" ? privatePartnerId : partnerId;
  const currentPartners = profileType === "private" ? privatePartners : partners;

  // Libido descriptions mapping
  const getLibidoDescription = (libidoEmoji: string) => {
    const libidoMap: Record<string, string> = {
      "🚫": "Asexual – Not my thing.",
      "🐼": "Very Low Libido – Once in a blue moon.",
      "🦥": "Low Libido – Slowly and infrequently, even during breeding season.",
      "🦉": "Mild Libido – Monogamous and seasonal.",
      "🐐": "Moderate Libido – Seasonal breeders, but noticeably active when in heat.",
      "🦌": "High Libido – All in during the season.",
      "🐬": "Very High Libido – ALL THE TIME",
      "🦘": "Death-Drive Libido – Go out with a bang — literally."
    };
    return libidoMap[libidoEmoji] || libidoEmoji;
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
      
      <div className="flex flex-col space-y-1 mt-1">
        {!isEditing && location && (
          <p className="text-social-textSecondary flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {location}
          </p>
        )}
        
        {isEditing && (
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <Input 
              value={editedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Your location"
              className="w-full max-w-xs h-8"
            />
          </div>
        )}
        
        {/* Only show personal details on public profile or if it's own profile */}
        {(profileType === "public" || isOwnProfile) && (
          <div className="flex flex-wrap gap-x-4 text-social-textSecondary text-sm">
            {age && (
              <span className="flex items-center">
                <span className="font-medium mr-1">Age:</span> {age}
              </span>
            )}
            
            {gender && (
              <span className="flex items-center">
                <span className="font-medium mr-1">Gender:</span> {gender}
              </span>
            )}
            
            {sexualOrientation && (
              <span className="flex items-center">
                <span className="font-medium mr-1">Orientation:</span> {sexualOrientation}
              </span>
            )}
            
            {libido && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center cursor-help">
                      <span className="font-medium mr-1">Libido:</span> {libido}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getLibidoDescription(libido)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {currentMaritalStatus && (
              <RelationshipStatusDisplay 
                status={currentMaritalStatus}
                partnerId={currentPartnerId}
                partnerIds={currentPartners}
                partnerName={partnerName}
                showIcon={true}
                showLink={true}
              />
            )}
          </div>
        )}
        
        {/* Show what user is looking for */}
        {lookingFor && lookingFor.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs font-medium text-social-textSecondary">Looking for:</span>
            {lookingFor.map((item, index) => (
              <span key={item} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {item}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-social-textSecondary">
          {profileType === "private" ? "Private connections" : "568 friends"}
        </p>
      </div>
    </div>
  );
};

export default ProfileInfo;
