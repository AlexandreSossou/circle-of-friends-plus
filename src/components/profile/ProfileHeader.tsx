
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProfileData } from "@/types/profile";
import ProfileCover from "./header/ProfileCover";
import ProfileAvatar from "./header/ProfileAvatar";
import ProfileInfo from "./header/ProfileInfo";
import ProfileActions from "./header/ProfileActions";
import ProfileBio from "./header/ProfileBio";
import RelationshipStatusUpdater from "./RelationshipStatusUpdater";

type ProfileHeaderProps = {
  profileData: ProfileData;
  isOwnProfile: boolean;
  handleAddFriend: () => void;
}

const ProfileHeader = ({ profileData, isOwnProfile, handleAddFriend }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profileData?.bio || "");
  const [editedLocation, setEditedLocation] = useState(profileData?.location || "");
  const { toast } = useToast();

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedBio(profileData?.bio || "");
    setEditedLocation(profileData?.location || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="relative">
      <ProfileCover isOwnProfile={isOwnProfile} />
      <ProfileAvatar 
        avatarUrl={profileData?.avatar_url} 
        isOwnProfile={isOwnProfile} 
      />

      <div className="p-4 md:p-6 pt-16 md:pt-20">
        <div className="flex flex-col md:flex-row md:items-end mb-4 md:mb-6 gap-4 md:gap-6">
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 ml-32 md:ml-40">
            <ProfileInfo 
              fullName={profileData?.full_name}
              location={profileData?.location}
              age={profileData?.age}
              gender={profileData?.gender}
              maritalStatus={profileData?.marital_status}
              partnerId={profileData?.partner_id}
              partnerName={profileData?.partner?.full_name || undefined}
              isEditing={isEditing}
              editedLocation={editedLocation}
              onLocationChange={setEditedLocation}
            />
            
            <div className="flex gap-2">
              <ProfileActions 
                profileId={profileData.id}
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
          <RelationshipStatusUpdater />
        )}

        <ProfileBio 
          bio={profileData?.bio}
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
