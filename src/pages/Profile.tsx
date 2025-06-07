
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileVerification from "@/components/profile/ProfileVerification";
import { useProfileData } from "@/hooks/useProfileData";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  const handleAddFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent",
    });
  };

  const handleProfileVisibilityChange = (settings: { publicEnabled: boolean; privateEnabled: boolean }) => {
    // In a real app, this would update the profile in the database
    console.log("Profile visibility settings updated:", settings);
    toast({
      title: "Profile visibility updated",
      description: "Your profile visibility settings have been saved.",
    });
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
        {profileData && (
          <>
            <ProfileHeader 
              profileData={profileData} 
              isOwnProfile={isOwnProfile} 
              handleAddFriend={handleAddFriend} 
              profileId={profileId || ""}
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
                profileData={profileData}
                onAlbumChange={setAlbums}
                onProfileVisibilityChange={handleProfileVisibilityChange}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
