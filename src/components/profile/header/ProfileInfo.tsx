
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileType } from "@/types/profile";
import RelationshipStatusDisplay from "../relationship/RelationshipStatusDisplay";

interface ProfileInfoProps {
  fullName: string;
  username?: string;
  privateUsername?: string;
  location?: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  partnerId?: string;
  partnerName?: string;
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
  maritalStatus,
  partnerId,
  partnerName,
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
            
            {maritalStatus && (
              <RelationshipStatusDisplay 
                status={maritalStatus}
                partnerId={partnerId}
                partnerName={partnerName}
                showIcon={true}
                showLink={true}
              />
            )}
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
