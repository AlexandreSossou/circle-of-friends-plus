
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PostCard from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CameraIcon, Edit, MapPin, User, UserPlus } from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { toast } = useToast();
  
  const handleAddFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent",
    });
  };

  const mockPosts = [
    {
      id: "profile-post-1",
      author: {
        id: "user-profile",
        name: "John Doe",
        avatar: "/placeholder.svg",
        initials: "JD"
      },
      content: "Just finished working on a new project. Super excited to share the results soon!",
      timestamp: "2 days ago",
      likes: 15,
      comments: [],
      liked: false
    },
    {
      id: "profile-post-2",
      author: {
        id: "user-profile",
        name: "John Doe",
        avatar: "/placeholder.svg",
        initials: "JD"
      },
      content: "Attended an amazing tech conference this weekend. Met so many interesting people and learned a lot!",
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000",
      timestamp: "1 week ago",
      likes: 32,
      comments: [],
      liked: true
    }
  ];

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

  return (
    <MainLayout>
      <div className="social-card relative mb-6">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1000"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4">
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <CameraIcon className="w-4 h-4" />
              <span>Edit Cover</span>
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 mb-4 md:mb-6 gap-4 md:gap-6">
            <div className="relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button 
                variant="secondary" 
                size="icon"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white"
              >
                <CameraIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">John Doe</h1>
                <p className="text-social-textSecondary flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  San Francisco, CA
                </p>
                <p className="text-social-textSecondary mt-1">568 friends</p>
              </div>
              
              <div className="flex gap-2">
                <Button className="bg-social-blue hover:bg-social-darkblue" onClick={handleAddFriend}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
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
                  {mockPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
