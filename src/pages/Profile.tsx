
import { useState, useEffect } from "react";
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

// Mock profile data to use when database profile is not available
const mockProfiles: Record<string, ProfileData> = {
  "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8": {
    id: "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8",
    full_name: "Emma Watson",
    username: "emmawatson",
    avatar_url: "/placeholder.svg",
    location: "London, UK",
    bio: "Actress and activist",
    gender: "Female",
    age: 33,
    marital_status: "Single",
    partner_id: null
  },
  "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1": {
    id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    full_name: "James Smith",
    username: "jamessmith",
    avatar_url: "/placeholder.svg",
    location: "New York, USA",
    bio: "Software Engineer",
    gender: "Male",
    age: 28,
    marital_status: "Single",
    partner_id: null
  },
  "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2": {
    id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    full_name: "Sarah Johnson",
    username: "sarahjohnson",
    avatar_url: "/placeholder.svg",
    location: "Toronto, Canada",
    bio: "Graphic Designer",
    gender: "Female",
    age: 31,
    marital_status: "Married",
    partner_id: null
  },
  "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3": {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    full_name: "Michael Brown",
    username: "michaelbrown",
    avatar_url: "/placeholder.svg",
    location: "Sydney, Australia",
    bio: "Marketing Specialist",
    gender: "Male",
    age: 35,
    marital_status: "Single",
    partner_id: null
  },
  "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4": {
    id: "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4",
    full_name: "Jessica Taylor",
    username: "jessicataylor",
    avatar_url: "/placeholder.svg",
    location: "Paris, France",
    bio: "Photographer",
    gender: "Female",
    age: 29,
    marital_status: "In a relationship",
    partner_id: null
  },
  "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5": {
    id: "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5",
    full_name: "David Lee",
    username: "davidlee",
    avatar_url: "/placeholder.svg",
    location: "Berlin, Germany",
    bio: "Chef",
    gender: "Male",
    age: 34,
    marital_status: "Married",
    partner_id: null
  },
  "aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d": {
    id: "aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    full_name: "Olivia Martinez",
    username: "oliviamartinez",
    avatar_url: "/placeholder.svg",
    location: "Madrid, Spain",
    bio: "Teacher",
    gender: "Female",
    age: 27,
    marital_status: "Single",
    partner_id: null
  },
  "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e": {
    id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    full_name: "Ryan Cooper",
    username: "ryancooper",
    avatar_url: "/placeholder.svg",
    location: "Dublin, Ireland",
    bio: "Architect",
    gender: "Male",
    age: 32,
    marital_status: "Married",
    partner_id: null
  },
  "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f": {
    id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    full_name: "Sophia Anderson",
    username: "sophiaanderson",
    avatar_url: "/placeholder.svg",
    location: "Amsterdam, Netherlands",
    bio: "Doctor",
    gender: "Female",
    age: 36,
    marital_status: "Single",
    partner_id: null
  },
  "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a": {
    id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    full_name: "Christopher Wilson",
    username: "christopherwilson",
    avatar_url: "/placeholder.svg",
    location: "Stockholm, Sweden",
    bio: "Musician",
    gender: "Male",
    age: 30,
    marital_status: "In a relationship",
    partner_id: null
  }
};

// Mock posts for when database posts aren't available
const mockPostsByUser: Record<string, any[]> = {
  "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8": [
    { id: "post-1", content: "Just finished filming a new project!", created_at: new Date().toISOString() }
  ],
  "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1": [
    { id: "post-2", content: "Learning a new programming language today", created_at: new Date().toISOString() }
  ],
  "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2": [
    { id: "post-3", content: "Created a new logo for a client", created_at: new Date().toISOString() }
  ],
  "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3": [
    { id: "post-4", content: "Just launched a successful marketing campaign", created_at: new Date().toISOString() }
  ],
  "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4": [
    { id: "post-5", content: "Check out my new photography portfolio", created_at: new Date().toISOString() }
  ]
};

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const { toast } = useToast();
  
  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  // Get profile from database if possible, otherwise use mock data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      // First try to get the profile from the database
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (error) {
          console.log("Error fetching profile from database:", error.message);
          console.log("Falling back to mock profile data");
          
          // If we have mock data for this profile ID, use it
          if (mockProfiles[profileId]) {
            return mockProfiles[profileId];
          }
          return null;
        }

        if (data.partner_id) {
          try {
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
          } catch (e) {
            console.error("Error fetching partner data:", e);
          }
        }

        return data as ProfileData;
      } catch (e) {
        console.error("Unexpected error fetching profile:", e);
        
        // Fallback to mock data
        if (mockProfiles[profileId]) {
          return mockProfiles[profileId];
        }
        return null;
      }
    },
    enabled: !!profileId,
  });

  const handleAddFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent",
    });
  };

  // Get posts from database if possible, otherwise use mock data
  const { data: posts } = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false });

        if (error) {
          console.log("Error fetching posts from database:", error.message);
          console.log("Falling back to mock post data");
          
          // If we have mock data for this profile ID, use it
          if (mockPostsByUser[profileId]) {
            return mockPostsByUser[profileId];
          }
          return [];
        }

        return data || [];
      } catch (e) {
        console.error("Unexpected error fetching posts:", e);
        
        // Fallback to mock data
        if (mockPostsByUser[profileId]) {
          return mockPostsByUser[profileId];
        }
        return [];
      }
    },
    enabled: !!profileId,
  });

  const mockPosts = (posts || []).map(post => ({
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
  }));

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
