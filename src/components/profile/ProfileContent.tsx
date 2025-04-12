
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileFriends from "./ProfileFriends";
import PhotoAlbum from "./PhotoAlbum";
import { Album, Friend, Post } from "@/types/profile";

type ProfileContentProps = {
  posts: Post[];
  friendsList: Friend[];
  albums: Album[];
  isOwnProfile: boolean;
  currentUserId?: string;
  onAlbumChange: (albums: Album[]) => void;
};

const ProfileContent = ({
  posts,
  friendsList,
  albums,
  isOwnProfile,
  currentUserId,
  onAlbumChange
}: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} />
        </TabsContent>
        
        <TabsContent value="friends">
          <ProfileFriends friends={friendsList} />
        </TabsContent>
        
        <TabsContent value="photos">
          <PhotoAlbum 
            albums={albums}
            friends={friendsList}
            isOwnProfile={isOwnProfile}
            currentUserId={currentUserId}
            onAlbumChange={onAlbumChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileContent;
