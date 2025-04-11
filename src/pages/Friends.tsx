import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, UserPlus, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const allFriends = [
    { id: "friend-1", name: "Emma Watson", avatar: "/placeholder.svg", initials: "EW", mutualFriends: 5 },
    { id: "friend-2", name: "James Smith", avatar: "/placeholder.svg", initials: "JS", mutualFriends: 3 },
    { id: "friend-3", name: "Sarah Johnson", avatar: "/placeholder.svg", initials: "SJ", mutualFriends: 7 },
    { id: "friend-4", name: "Michael Brown", avatar: "/placeholder.svg", initials: "MB", mutualFriends: 2 },
    { id: "friend-5", name: "Jessica Taylor", avatar: "/placeholder.svg", initials: "JT", mutualFriends: 1 },
    { id: "friend-6", name: "David Lee", avatar: "/placeholder.svg", initials: "DL", mutualFriends: 4 }
  ];
  
  const friendRequests = [
    { id: "request-1", name: "Ryan Cooper", avatar: "/placeholder.svg", initials: "RC", mutualFriends: 8 },
    { id: "request-2", name: "Olivia Martinez", avatar: "/placeholder.svg", initials: "OM", mutualFriends: 2 }
  ];
  
  const suggestions = [
    { id: "suggestion-1", name: "Christopher Wilson", avatar: "/placeholder.svg", initials: "CW", mutualFriends: 6 },
    { id: "suggestion-2", name: "Sophia Anderson", avatar: "/placeholder.svg", initials: "SA", mutualFriends: 4 },
    { id: "suggestion-3", name: "Matthew Thomas", avatar: "/placeholder.svg", initials: "MT", mutualFriends: 3 },
    { id: "suggestion-4", name: "Emily Garcia", avatar: "/placeholder.svg", initials: "EG", mutualFriends: 5 }
  ];
  
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
  
  const filteredFriends = allFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search friends..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {filteredFriends.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="social-card p-4 flex items-center">
                    <Link to={`/profile/${friend.id}`} className="flex items-center flex-1">
                      <Avatar className="mr-3">
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{friend.name}</h3>
                        <p className="text-xs text-social-textSecondary">{friend.mutualFriends} mutual friends</p>
                      </div>
                    </Link>
                    <Link to={`/profile/${friend.id}`}>
                      <Button variant="ghost" size="sm">
                        <UserCheck className="w-4 h-4 mr-2" />
                        <span>Profile</span>
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-social-textSecondary">
                <p>No friends match your search.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests">
            {friendRequests.length > 0 ? (
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <div key={request.id} className="social-card p-4">
                    <div className="flex items-center">
                      <Link to={`/profile/${request.id}`} className="flex items-center flex-1">
                        <Avatar className="mr-3">
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback>{request.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.name}</h3>
                          <p className="text-xs text-social-textSecondary">{request.mutualFriends} mutual friends</p>
                        </div>
                      </Link>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAcceptRequest(request.id, request.name)}
                          className="bg-social-blue hover:bg-social-darkblue"
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-social-textSecondary">
                <p>No pending friend requests.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="social-card p-4">
                  <div className="flex items-center">
                    <Link to={`/profile/${suggestion.id}`} className="flex items-center flex-1">
                      <Avatar className="mr-3">
                        <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                        <AvatarFallback>{suggestion.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{suggestion.name}</h3>
                        <p className="text-xs text-social-textSecondary">{suggestion.mutualFriends} mutual friends</p>
                      </div>
                    </Link>
                    <Button 
                      onClick={() => handleAddFriend(suggestion.id, suggestion.name)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Friends;
