
import { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PhotoAlbum from "@/components/profile/PhotoAlbum";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import ProfileFriends from "@/components/profile/ProfileFriends";
import ProfileLoading from "@/components/profile/ProfileLoading";

type ProfileData = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  gender: string | null;
  age: number | null;
  marital_status: string | null;
  partner_id: string | null;
  partner?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const { toast } = useToast();
  
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (data.partner_id) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.partner_id)
          .single();

        if (!partnerError) {
          return {
            ...data,
            partner: partnerData
          } as ProfileData;
        }
      }

      return data as ProfileData;
    },
    enabled: !!profileId,
  });

  const handleAddFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent",
    });
  };

  const { data: posts } = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!profileId,
  });

  const mockPosts = posts?.map(post => ({
    id: post.id,
    author: {
      id: profileId || "",
      name: profileData?.full_name || "Unknown",
      avatar: profileData?.avatar_url || "/placeholder.svg",
      initials: profileData?.full_name?.split(" ").map(n => n[0]).join("") || "??"
    },
    content: post.content,
    image: post.image_url || undefined,
    timestamp: new Date(post.created_at).toLocaleDateString(),
    likes: 0,
    comments: [],
    liked: false
  })) || [];

  const friendsList = [
    { id: "friend-1", name: "Emma Watson", avatar: "/placeholder.svg", initials: "EW", mutualFriends: 5 },
    { id: "friend-2", name: "James Smith", avatar: "/placeholder.svg", initials: "JS", mutualFriends: 3 },
    { id: "friend-3", name: "Sarah Johnson", avatar: "/placeholder.svg", initials: "SJ", mutualFriends: 7 },
    { id: "friend-4", name: "Michael Brown", avatar: "/placeholder.svg", initials: "MB", mutualFriends: 2 },
    { id: "friend-5", name: "Jessica Taylor", avatar: "/placeholder.svg", initials: "JT", mutualFriends: 1 },
    { id: "friend-6", name: "David Lee", avatar: "/placeholder.svg", initials: "DL", mutualFriends: 4 }
  ];

  const photos = [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=500",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=500",
    "https://images.unsplash.com/photo-1675624452350-ac5db8edf97b?q=80&w=500",
    "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=500",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500",
    "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=500"
  ];

  const [albums, setAlbums] = useState([
    { id: 1, name: "Default Album", photos: photos.slice(0, 3), isPrivate: false, allowedUsers: [] },
    { id: 2, name: "Vacation", photos: photos.slice(3, 6), isPrivate: true, allowedUsers: ["friend-1", "friend-2"] },
  ]);

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
            />
            
            <div className="p-4 md:p-6 pt-0">
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="posts">
                    <ProfilePosts posts={mockPosts} isOwnProfile={isOwnProfile} />
                  </TabsContent>
                  
                  <TabsContent value="friends">
                    <ProfileFriends friends={friendsList} />
                  </TabsContent>
                  
                  <TabsContent value="photos">
                    <PhotoAlbum 
                      albums={albums}
                      friends={friendsList}
                      isOwnProfile={isOwnProfile}
                      currentUserId={user?.id}
                      onAlbumChange={setAlbums}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
