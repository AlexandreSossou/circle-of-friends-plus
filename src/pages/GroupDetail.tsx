import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, MessageCircle, UserPlus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroups } from "@/hooks/useGroups";
import { useGroupPosts } from "@/hooks/useGroupPosts";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import CreateGroupPost from "@/components/groups/CreateGroupPost";
import GroupPostCard from "@/components/groups/GroupPostCard";
import GroupMembersList from "@/components/groups/GroupMembersList";
import { GroupAvatarUpload } from "@/components/groups/GroupAvatarUpload";
import { GroupJoinRequestDialog } from "@/components/groups/GroupJoinRequestDialog";
import { GroupJoinRequestsList } from "@/components/groups/GroupJoinRequestsList";
import { GroupSettingsDialog } from "@/components/groups/GroupSettingsDialog";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { userGroups, publicGroups, isLoadingUserGroups, isLoadingPublicGroups, joinGroupMutation } = useGroups();
  const { posts, isLoading: isLoadingPosts, createPost, deletePost, isCreatingPost } = useGroupPosts(id);
  const { members, isLoading: isLoadingMembers } = useGroupMembers(id);
  
  // Find the group in user groups first, then public groups
  const group = userGroups.find(g => g.id === id) || publicGroups.find(g => g.id === id);
  const isLoading = isLoadingUserGroups || isLoadingPublicGroups;
  const isMember = userGroups.some(g => g.id === id);
  const isAdmin = group?.user_role === 'admin';

  const handleCreatePost = (content: string) => {
    createPost({ content });
  };

  const handleReply = (parentPostId: string, content: string) => {
    createPost({ content, parentPostId });
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
            <GroupAvatarUpload 
              groupId={group.id}
              currentAvatarUrl={group.avatar_url}
              groupName={group.name}
              isAdmin={isAdmin}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <p className="text-social-textSecondary capitalize mb-2">{group.category}</p>
              <div className="flex items-center gap-2 text-sm text-social-textSecondary">
                <Users className="w-4 h-4 mr-1" />
                <span>{group.member_count || 0} members</span>
                {isAdmin && (
                  <span className="px-3 py-1 bg-social-blue text-white rounded-full text-xs">
                    Admin
                  </span>
                )}
                {isMember && !isAdmin && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Member
                  </span>
                )}
                {group.join_policy === 'request' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    Request to Join
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isMember && group.join_policy === 'request' && (
                <GroupJoinRequestDialog groupId={group.id} groupName={group.name} />
              )}
              {!isMember && group.join_policy === 'open' && (
                <Button 
                  onClick={() => joinGroupMutation.mutate(group.id)}
                  disabled={joinGroupMutation.isPending}
                  className="bg-social-blue hover:bg-social-darkblue"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              )}
              {isMember && (
                <>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  {isAdmin && (
                    <GroupSettingsDialog groupId={group.id} groupName={group.name} />
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
            {isAdmin && <TabsTrigger value="requests">Join Requests</TabsTrigger>}
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {isMember ? (
              <div className="space-y-6">
                <CreateGroupPost 
                  onSubmit={handleCreatePost}
                  isSubmitting={isCreatingPost}
                />
                
                {isLoadingPosts ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                            <div className="h-16 bg-gray-200 rounded mt-2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <GroupPostCard
                        key={post.id}
                        post={post}
                        onReply={handleReply}
                        onDelete={deletePost}
                        isAdmin={group?.user_role === 'admin'}
                        isCreatingReply={isCreatingPost}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-social-textSecondary">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet. Be the first to start a conversation!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-social-textSecondary">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Join this group to view and create posts.</p>
                {group.join_policy === 'request' ? (
                  <GroupJoinRequestDialog groupId={group.id} groupName={group.name} />
                ) : (
                  <Button 
                    onClick={() => joinGroupMutation.mutate(group.id)}
                    disabled={joinGroupMutation.isPending}
                    className="mt-4 bg-social-blue hover:bg-social-darkblue"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="members" className="mt-6">
            {isMember ? (
              <GroupMembersList 
                members={members}
                isLoading={isLoadingMembers}
              />
            ) : (
              <div className="text-center py-10 text-social-textSecondary">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Join this group to see the members.</p>
              </div>
            )}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="requests" className="mt-6">
              <GroupJoinRequestsList groupId={group.id} />
            </TabsContent>
          )}
          
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