
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileFriends from "./ProfileFriends";
import PhotoAlbum from "./PhotoAlbum";
import SafetyReview from "./SafetyReview";
import ProfileTypeSelector from "./ProfileTypeSelector";
import ProfileVisibilitySettings from "./ProfileVisibilitySettings";
import ProfileIdentityManager from "./ProfileIdentityManager";
import { Album, Friend, Post, ProfileData, ProfileType } from "@/types/profile";

type ProfileContentProps = {
  posts: Post[];
  friendsList: Friend[];
  albums: Album[];
  isOwnProfile: boolean;
  currentUserId?: string;
  profileData: ProfileData;
  onAlbumChange: (albums: Album[]) => void;
  onProfileVisibilityChange: (settings: { publicEnabled: boolean; privateEnabled: boolean }) => void;
  onProfileUpdate?: (updates: Partial<ProfileData>) => void;
};

const ProfileContent = ({
  posts,
  friendsList,
  albums,
  isOwnProfile,
  currentUserId,
  profileData,
  onAlbumChange,
  onProfileVisibilityChange,
  onProfileUpdate
}: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [profileType, setProfileType] = useState<ProfileType>("public");

  const publicEnabled = profileData.public_profile_enabled ?? true;
  const privateEnabled = profileData.private_profile_enabled ?? true;

  // If user is viewing someone else's profile and that profile type is disabled, show message
  if (!isOwnProfile) {
    if (profileType === "public" && !publicEnabled) {
      return (
        <div className="text-center py-8">
          <p className="text-social-textSecondary">This user has disabled their public profile.</p>
        </div>
      );
    }
    if (profileType === "private" && !privateEnabled) {
      return (
        <div className="text-center py-8">
          <p className="text-social-textSecondary">This user has disabled their private profile.</p>
        </div>
      );
    }
  }

  const handleProfileUpdate = (updates: Partial<ProfileData>) => {
    if (onProfileUpdate) {
      onProfileUpdate(updates);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {!isOwnProfile && (
        <ProfileTypeSelector
          currentType={profileType}
          onTypeChange={setProfileType}
          publicEnabled={publicEnabled}
          privateEnabled={privateEnabled}
        />
      )}

      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {isOwnProfile && (
            <>
              <ProfileTypeSelector
                currentType={profileType}
                onTypeChange={setProfileType}
                publicEnabled={publicEnabled}
                privateEnabled={privateEnabled}
              />
              <ProfileIdentityManager
                profileData={profileData}
                profileType={profileType}
                onSave={handleProfileUpdate}
              />
            </>
          )}
          <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} />
        </TabsContent>
        
        <TabsContent value="photos">
          {isOwnProfile && (
            <>
              <ProfileTypeSelector
                currentType={profileType}
                onTypeChange={setProfileType}
                publicEnabled={publicEnabled}
                privateEnabled={privateEnabled}
              />
              <ProfileIdentityManager
                profileData={profileData}
                profileType={profileType}
                onSave={handleProfileUpdate}
              />
              <div className="mb-6">
                <ProfileVisibilitySettings
                  profileData={profileData}
                  onSave={onProfileVisibilityChange}
                />
              </div>
            </>
          )}
          <PhotoAlbum 
            albums={albums}
            friends={friendsList}
            isOwnProfile={isOwnProfile}
            currentUserId={currentUserId}
            profileType={profileType}
            onAlbumChange={onAlbumChange}
          />
        </TabsContent>
        
        <TabsContent value="friends">
          <ProfileFriends friends={friendsList} />
        </TabsContent>

        <TabsContent value="safety">
          <SafetyReview 
            profileId={isOwnProfile && currentUserId ? currentUserId : ""}
            isOwnProfile={isOwnProfile}
            currentUserId={currentUserId}
            friends={friendsList}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileContent;
