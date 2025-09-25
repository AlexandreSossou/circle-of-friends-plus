import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Pin, PinOff } from "lucide-react";

interface PendingPost {
  id: string;
  content: string;
  image_url: string | null;
  is_global: boolean;
  is_pinned: boolean;
  created_at: string;
  moderation_status: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface TaggedUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  consent_status: 'pending' | 'approved' | 'rejected';
}

interface PostWithTags extends PendingPost {
  tagged_users?: TaggedUser[];
}

const PostModeration: React.FC = () => {
  const { user } = useAuth();
  const { hasModeratorAccess } = useUserRole();
  const [posts, setPosts] = useState<PostWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    if (hasModeratorAccess) {
      fetchPosts();
    }
  }, [hasModeratorAccess, selectedTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('moderation_status', selectedTab)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each post, fetch tagged users and their consent status
      const postsWithTags = await Promise.all(
        postsData.map(async (post) => {
          if (post.image_url) {
            // Get tagged users for image posts
            const { data: taggedData } = await supabase
              .from('post_tags')
              .select(`
                tagged_user_id
              `)
              .eq('post_id', post.id);

            if (taggedData && taggedData.length > 0) {
              // Get user profiles and consent status for each tagged user
              const taggedUsers = await Promise.all(
                taggedData.map(async (tag) => {
                  // Get user profile
                  const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .eq('id', tag.tagged_user_id)
                    .single();

                  // Get consent status
                  const { data: consentData } = await supabase
                    .from('image_consent')
                    .select('consent_status')
                    .eq('post_id', post.id)
                    .eq('tagged_user_id', tag.tagged_user_id)
                    .single();

                  return {
                    id: profileData?.id || '',
                    full_name: profileData?.full_name || null,
                    avatar_url: profileData?.avatar_url || null,
                    consent_status: (consentData?.consent_status || 'pending') as 'pending' | 'approved' | 'rejected'
                  };
                })
              );

              return {
                ...post,
                tagged_users: taggedUsers
              };
            }
          }
          
          return post;
        })
      );

      setPosts(postsWithTags);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts for moderation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = async (postId: string, currentPinStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          is_pinned: !currentPinStatus
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post ${!currentPinStatus ? 'pinned' : 'unpinned'} successfully`,
      });

      // Refresh the list
      fetchPosts();
    } catch (error) {
      console.error('Error updating pin status:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive"
      });
    }
  };

  const handleModerationAction = async (postId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          moderation_status: action,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post ${action} successfully`,
      });

      // Refresh the list
      fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive"
      });
    }
  };

  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!hasModeratorAccess) {
    return (
      <div className="text-center py-8">
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Post Moderation</h2>
        <Badge variant="secondary">
          {posts.length} {selectedTab} posts
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p>No {selectedTab} posts found.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={post.profiles.avatar_url || undefined} />
                        <AvatarFallback>
                          {post.profiles.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {post.profiles.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.is_global && (
                        <Badge variant="outline">Global</Badge>
                      )}
                      {post.is_pinned && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      <Badge className={`${post.moderation_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : post.moderation_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {post.moderation_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{post.content}</p>
                  
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post content" 
                      className="rounded-lg max-h-64 object-cover w-full"
                    />
                  )}

                  {post.tagged_users && post.tagged_users.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Tagged Users & Consent Status:</h4>
                      <div className="flex flex-wrap gap-2">
                        {post.tagged_users.map((taggedUser) => (
                          <div key={taggedUser.id} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={taggedUser.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {taggedUser.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{taggedUser.full_name}</span>
                            <Badge className={getConsentStatusColor(taggedUser.consent_status)}>
                              {taggedUser.consent_status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePinToggle(post.id, post.is_pinned)}
                      variant={post.is_pinned ? "outline" : "secondary"}
                      className="flex items-center space-x-1"
                      size="sm"
                    >
                      {post.is_pinned ? (
                        <>
                          <PinOff className="h-4 w-4" />
                          <span>Unpin</span>
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4" />
                          <span>Pin</span>
                        </>
                      )}
                    </Button>
                    
                    {selectedTab === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleModerationAction(post.id, 'approved')}
                          className="flex items-center space-x-1"
                          size="sm"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleModerationAction(post.id, 'rejected')}
                          className="flex items-center space-x-1"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostModeration;