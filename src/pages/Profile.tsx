import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PostCard from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CameraIcon, Edit, MapPin, MessageCircle, User, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PhotoAlbum from "@/components/profile/PhotoAlbum";
import WinkButton from "@/components/profile/WinkButton";

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

  const handleSendWink = async () => {
    if (!user || !profileId || isOwnProfile) return;
    
    try {
      await supabase.from('posts').insert({
        user_id: profileId,
        content: `${user.email} sent you a wink! 😉`,
      });
      
      setWinkSent(true);
      toast({
        title: "Wink sent!",
        description: "Your wink has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending wink:", error);
      toast({
        title: "Error",
        description: "Failed to send wink. Please try again.",
        variant: "destructive",
      });
    }
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
        <div className="social-card p-6 animate-pulse">
          <div className="h-48 md:h-64 bg-gray-200 rounded-t-lg"></div>
          <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 mb-4 md:mb-6 gap-4 md:gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 border-4 border-white"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="social-card relative mb-6">
        <div className="h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1000"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isOwnProfile && (
            <div className="absolute bottom-4 right-4">
              <Button variant="secondary" size="sm" className="flex items-center gap-1">
                <CameraIcon className="w-4 h-4" />
                <span>Edit Cover</span>
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 mb-4 md:mb-6 gap-4 md:gap-6">
            <div className="relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden">
                <img
                  src={profileData?.avatar_url || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isOwnProfile && (
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white"
                >
                  <CameraIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{profileData?.full_name}</h1>
                
                <div className="flex flex-col space-y-1 mt-1">
                  {profileData?.location && (
                    <p className="text-social-textSecondary flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileData.location}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-x-4 text-social-textSecondary text-sm">
                    {profileData?.age && (
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Age:</span> {profileData.age}
                      </span>
                    )}
                    
                    {profileData?.gender && (
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Gender:</span> {profileData.gender}
                      </span>
                    )}
                    
                    {profileData?.marital_status && (
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Status:</span> {profileData.marital_status}
                      </span>
                    )}
                  </div>
                  
                  {profileData?.partner && (
                    <div className="flex items-center mt-1">
                      <span className="font-medium mr-2">Partner:</span>
                      <Link to={`/profile/${profileData.partner_id}`} className="flex items-center hover:underline">
                        <img 
                          src={profileData.partner.avatar_url || "/placeholder.svg"} 
                          alt={profileData.partner.full_name || "Partner"} 
                          className="w-5 h-5 rounded-full mr-1" 
                        />
                        {profileData.partner.full_name}
                      </Link>
                    </div>
                  )}
                  
                  <p className="text-social-textSecondary">568 friends</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <>
                    <Button className="bg-social-blue hover:bg-social-darkblue" onClick={handleAddFriend}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                    <Link to={`/messages?recipient=${profileId}`}>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                    <WinkButton recipientId={profileId} />
                  </>
                )}
                
                {isOwnProfile && (
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts">
                <div className="space-y-4">
                  {mockPosts.length > 0 ? (
                    mockPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-social-textSecondary">
                      <p>No posts to display.</p>
                      {isOwnProfile && (
                        <p className="mt-2">
                          <Link to="/" className="text-social-blue hover:underline">
                            Create your first post
                          </Link>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="friends">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {friendsList.map((friend) => (
                    <div key={friend.id} className="social-card p-4 flex flex-col items-center text-center">
                      <Link to={`/profile/${friend.id}`}>
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                          <img 
                            src={friend.avatar} 
                            alt={friend.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-medium">{friend.name}</h3>
                      </Link>
                      <p className="text-sm text-social-textSecondary mt-1">
                        {friend.mutualFriends} mutual friends
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
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
      </div>
    </MainLayout>
  );
};

export default Profile;
