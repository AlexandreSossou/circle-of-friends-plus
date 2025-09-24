import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Settings, MessageCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroups } from "@/hooks/useGroups";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { userGroups, publicGroups, isLoadingUserGroups, isLoadingPublicGroups } = useGroups();
  
  // Find the group in user groups first, then public groups
  const group = userGroups.find(g => g.id === id) || publicGroups.find(g => g.id === id);
  const isLoading = isLoadingUserGroups || isLoadingPublicGroups;
  const isMember = userGroups.some(g => g.id === id);
  
  const getGroupInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="social-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="social-card p-6 text-center">
          <h1 className="text-xl font-semibold mb-4">Group not found</h1>
          <p className="text-social-textSecondary mb-4">The group you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/groups">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="social-card p-6 mb-6">
        <div className="flex items-center mb-6">
          <Link to="/groups" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center flex-1">
            <Avatar className="w-20 h-20 mr-6">
              <AvatarImage src={group.avatar_url || "/placeholder.svg"} alt={group.name} />
              <AvatarFallback className="text-lg">{getGroupInitials(group.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <p className="text-social-textSecondary capitalize mb-2">{group.category}</p>
              <div className="flex items-center text-sm text-social-textSecondary">
                <Users className="w-4 h-4 mr-1" />
                <span>{group.member_count || 0} members</span>
                {group.user_role === 'admin' && (
                  <span className="ml-4 px-3 py-1 bg-social-blue text-white rounded-full text-xs">
                    Admin
                  </span>
                )}
                {isMember && group.user_role !== 'admin' && (
                  <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Member
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isMember && (
                <>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  {group.user_role === 'admin' && (
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {group.description && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-social-textSecondary">{group.description}</p>
          </div>
        )}

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="text-center py-10 text-social-textSecondary">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. Be the first to start a conversation!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="mt-6">
            <div className="text-center py-10 text-social-textSecondary">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Group members will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <div className="text-center py-10 text-social-textSecondary">
              <p>No upcoming events for this group.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GroupDetail;