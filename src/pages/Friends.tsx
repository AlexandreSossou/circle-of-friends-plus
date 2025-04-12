
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequests from "@/components/friends/FriendRequests";
import FriendSuggestions from "@/components/friends/FriendSuggestions";
import { useFriends } from "@/hooks/useFriends";

const Friends = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { allFriends, friendRequests, suggestions, updateRelationshipType } = useFriends();
  
  const handleViewProfile = (id: string) => {
    // Navigate to the friend's profile page using proper UUID
    navigate(`/profile/${id}`);
  };
  
  const handleAcceptRequest = (id: string, name: string) => {
    toast({
      title: "Friend request accepted",
      description: `You are now friends with ${name}`,
    });
  };
  
  const handleDeclineRequest = (id: string) => {
    toast({
      title: "Friend request declined",
    });
  };
  
  const handleAddFriend = (id: string, name: string) => {
    toast({
      title: "Friend request sent",
      description: `Friend request sent to ${name}`,
    });
  };

  const handleUpdateRelationshipType = (friendId: string, relationshipType: 'friend' | 'acquaintance') => {
    updateRelationshipType(friendId, relationshipType);
  };
  
  return (
    <MainLayout>
      <div className="social-card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        
        <Tabs defaultValue="all-friends">
          <TabsList className="mb-6">
            <TabsTrigger value="all-friends">All Friends</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {friendRequests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-friends">
            <FriendsList 
              friends={allFriends} 
              onViewProfile={handleViewProfile}
              onUpdateRelationshipType={handleUpdateRelationshipType}
            />
          </TabsContent>
          
          <TabsContent value="requests">
            <FriendRequests 
              requests={friendRequests}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
            />
          </TabsContent>
          
          <TabsContent value="suggestions">
            <FriendSuggestions 
              suggestions={suggestions}
              onAddFriend={handleAddFriend}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Friends;
