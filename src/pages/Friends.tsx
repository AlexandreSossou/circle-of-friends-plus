
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequests from "@/components/friends/FriendRequests";
import { useFriends } from "@/hooks/useFriends";

const Friends = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { allFriends, friendRequests, updateRelationshipType, temporarilyUpgradeRelationship } = useFriends();
  
  // Filter friends based on relationship type, including temporary close friends
  const closeFriends = allFriends.filter(friend => friend.relationshipType === 'friend');
  const acquaintances = allFriends.filter(friend => friend.relationshipType === 'acquaintance');
  
  const handleViewProfile = (id: string) => {
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
  
  const handleUpdateRelationshipType = (friendId: string, relationshipType: 'friend' | 'acquaintance') => {
    updateRelationshipType(friendId, relationshipType);
  };
  
  const handleTemporaryUpgrade = (friendId: string, durationMinutes: number) => {
    temporarilyUpgradeRelationship(friendId, durationMinutes);
  };
  
  return (
    <MainLayout>
      <div className="social-card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        
        <Tabs defaultValue="all-friends">
          <TabsList className="mb-6">
            <TabsTrigger value="all-friends">All Friends</TabsTrigger>
            <TabsTrigger value="close-friends">Close Friends</TabsTrigger>
            <TabsTrigger value="acquaintances">Acquaintances</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {friendRequests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-friends">
            <FriendsList 
              friends={allFriends} 
              onViewProfile={handleViewProfile}
              onUpdateRelationshipType={handleUpdateRelationshipType}
              onTemporaryUpgrade={handleTemporaryUpgrade}
            />
          </TabsContent>
          
          <TabsContent value="close-friends">
            <FriendsList 
              friends={closeFriends} 
              onViewProfile={handleViewProfile}
              onUpdateRelationshipType={handleUpdateRelationshipType}
              onTemporaryUpgrade={handleTemporaryUpgrade}
            />
          </TabsContent>
          
          <TabsContent value="acquaintances">
            <FriendsList 
              friends={acquaintances} 
              onViewProfile={handleViewProfile}
              onUpdateRelationshipType={handleUpdateRelationshipType}
              onTemporaryUpgrade={handleTemporaryUpgrade}
            />
          </TabsContent>
          
          <TabsContent value="requests">
            <FriendRequests 
              requests={friendRequests}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Friends;
