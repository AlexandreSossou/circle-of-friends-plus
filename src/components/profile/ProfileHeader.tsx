
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProfileData, ProfileType } from "@/types/profile";
import ProfileCover from "./header/ProfileCover";
import ProfileAvatar from "./header/ProfileAvatar";
import ProfileInfo from "./header/ProfileInfo";
import ProfileActions from "./header/ProfileActions";
import ProfileBio from "./header/ProfileBio";
import RelationshipStatusUpdater from "./RelationshipStatusUpdater";
import { CalmModeToggle } from "@/components/ui/calm-mode-toggle";

type ProfileHeaderProps = {
  profileData: ProfileData;
  isOwnProfile: boolean;
  handleAddFriend: () => void;
  profileId: string;
  profileType?: ProfileType;
  onProfileUpdate?: (updates: Partial<ProfileData>) => Promise<void>;
}

const ProfileHeader = ({ 
  profileData, 
  isOwnProfile, 
  handleAddFriend, 
  profileId, 
  profileType = "public",
  onProfileUpdate
}: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(
    profileType === "public" ? profileData?.bio || "" : profileData?.private_bio || ""
  );
  const [editedLocation, setEditedLocation] = useState(profileData?.location || "");
  const { toast } = useToast();

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedBio(
      profileType === "public" ? profileData?.bio || "" : profileData?.private_bio || ""
    );
    setEditedLocation(profileData?.location || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (onProfileUpdate) {
      const updates: Partial<ProfileData> = {
        location: editedLocation,
      };
      
      // Save bio to appropriate field based on profile type
      if (profileType === "public") {
        updates.bio = editedBio;
      } else {
        updates.private_bio = editedBio;
      }
      
      await onProfileUpdate(updates);
    }
    setIsEditing(false);
  };

  // Get the appropriate avatar based on profile type
  const currentAvatar = profileType === "private" && profileData?.private_avatar_url
    ? profileData.private_avatar_url
    : profileData?.avatar_url;

  // Get the appropriate bio based on profile type
  const currentBio = profileType === "public" ? profileData?.bio : profileData?.private_bio;

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <CalmModeToggle />
      </div>
      
      <ProfileCover isOwnProfile={isOwnProfile} />
      <ProfileAvatar 
        avatarUrl={currentAvatar} 
        isOwnProfile={isOwnProfile} 
      />

      <div className="p-4 md:p-6 pt-16 md:pt-20">
        <div className="flex flex-col md:flex-row md:items-end mb-4 md:mb-6 gap-4 md:gap-6">
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 ml-32 md:ml-40">
            <ProfileInfo 
              fullName={profileData?.full_name}
              username={profileData?.username}
              privateUsername={profileData?.private_username}
              location={profileData?.location}
              age={profileData?.age}
              gender={profileData?.gender}
              sexualOrientation={profileData?.sexual_orientation}
              libido={profileData?.libido}
              maritalStatus={profileData?.marital_status}
              privateMaritalStatus={profileData?.private_marital_status}
              partnerId={profileData?.partner_id}
              privatePartnerId={profileData?.private_partner_id}
              partners={profileData?.partners}
              privatePartners={profileData?.private_partners}
              partnerName={profileData?.partner?.full_name || undefined}
              lookingFor={profileData?.looking_for}
              isEditing={isEditing}
              editedLocation={editedLocation}
              onLocationChange={setEditedLocation}
              profileType={profileType}
              isOwnProfile={isOwnProfile}
            />
            
            <div className="flex gap-2">
              <ProfileActions 
                profileId={profileId}
                isOwnProfile={isOwnProfile}
                isEditing={isEditing}
                onEditClick={handleEditClick}
                onCancelEdit={handleCancelEdit}
                onSaveProfile={handleSaveProfile}
                handleAddFriend={handleAddFriend}
              />
            </div>
          </div>
        </div>

        {isOwnProfile && isEditing && (
          <RelationshipStatusUpdater profileType={profileType} />
        )}

        <ProfileBio 
          bio={currentBio}
          lookingFor={profileData?.looking_for}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          editedBio={editedBio}
          onEditClick={handleEditClick}
          onBioChange={setEditedBio}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
