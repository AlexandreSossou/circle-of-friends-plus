
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileVerification from "@/components/profile/ProfileVerification";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileData, ProfileType } from "@/types/profile";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentProfileType, setCurrentProfileType] = useState<ProfileType>("public");
  
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  // Use our custom hook to get profile data
  const {
    profileData,
    profileLoading,
    formattedPosts,
    friendsList,
    albums,
    setAlbums,
    verificationInfo
  } = useProfileData(profileId, isOwnProfile);

  // Local state for profile data to handle updates
  const [localProfileData, setLocalProfileData] = useState<ProfileData | null>(profileData);

  // Update local state when profile data changes
  React.useEffect(() => {
    if (profileData) {
      setLocalProfileData(profileData);
    }
  }, [profileData]);

  const handleAddFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent",
    });
  };

  const handleProfileVisibilityChange = (settings: { publicEnabled: boolean; privateEnabled: boolean }) => {
    if (localProfileData) {
      const updatedProfile = {
        ...localProfileData,
        public_profile_enabled: settings.publicEnabled,
        private_profile_enabled: settings.privateEnabled
      };
      setLocalProfileData(updatedProfile);
    }
    
    console.log("Profile visibility settings updated:", settings);
    toast({
      title: "Profile visibility updated",
      description: "Your profile visibility settings have been saved.",
    });
  };

  const handleProfileUpdate = async (updates: Partial<ProfileData>) => {
    if (!profileId) return;
    
    try {
      // Update the database
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) {
        throw error;
      }

      // Update local state
      if (localProfileData) {
        const updatedProfile = { ...localProfileData, ...updates };
        setLocalProfileData(updatedProfile);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <MainLayout>
        <ProfileLoading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="social-card relative mb-6">
        {localProfileData && (
          <>
            <ProfileHeader 
              profileData={localProfileData} 
              isOwnProfile={isOwnProfile} 
              handleAddFriend={handleAddFriend} 
              profileId={profileId || ""}
              profileType={currentProfileType}
              onProfileUpdate={handleProfileUpdate}
            />
            
            <div className="p-4 md:p-6 pt-0">
              <ProfileVerification
                profileId={profileId || ""}
                isOwnProfile={isOwnProfile}
                lastConnection={verificationInfo?.lastConnection}
                photoVerificationDate={verificationInfo?.photoVerification}
                moderatorVerificationDate={verificationInfo?.moderatorVerification}
              />
              
              <ProfileContent
                posts={formattedPosts}
                friendsList={friendsList}
                albums={albums}
                isOwnProfile={isOwnProfile}
                currentUserId={user?.id}
                profileData={localProfileData}
                onAlbumChange={setAlbums}
                onProfileVisibilityChange={handleProfileVisibilityChange}
                onProfileUpdate={handleProfileUpdate}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
