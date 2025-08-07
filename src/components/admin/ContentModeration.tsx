import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Trash2, Eye, Check, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Report {
  id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  post_id?: string;
  reported_user_id?: string;
  reporter_profiles: {
    full_name?: string;
  };
  reported_profiles?: {
    full_name?: string;
  };
  posts?: Post;
}

const ContentModeration = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch recent posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch additional data for each report
      const reportsWithDetails = await Promise.all(
        (reportsData || []).map(async (report) => {
          // Fetch reporter profile
          const { data: reporterProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', report.reporter_id)
            .maybeSingle();

          // Fetch reported user profile if exists
          let reportedProfile = null;
          if (report.reported_user_id) {
            const { data } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', report.reported_user_id)
              .maybeSingle();
            reportedProfile = data;
          }

          // Fetch post if exists
          let post = null;
          if (report.post_id) {
            const { data: postData } = await supabase
              .from('posts')
              .select(`
                id,
                content,
                image_url,
                created_at,
                user_id
              `)
              .eq('id', report.post_id)
              .maybeSingle();

            if (postData) {
              // Fetch post author profile
              const { data: authorProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', postData.user_id)
                .maybeSingle();

              post = {
                ...postData,
                profiles: authorProfile
              };
            }
          }

          return {
            ...report,
            reporter_profiles: reporterProfile,
            reported_profiles: reportedProfile,
            posts: post
          };
        })
      );

      setPosts(postsData || []);
      setReports(reportsWithDetails);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'delete_post',
            target_type: 'post',
            target_id: postId,
            details: {}
          });
      }

      toast({
        title: "Post deleted",
        description: "Post has been successfully deleted"
      });

      fetchContent();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'update_report_status',
            target_type: 'report',
            target_id: reportId,
            details: { status }
          });
      }

      toast({
        title: "Report updated",
        description: `Report status updated to ${status}`
      });

      fetchContent();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="reports" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reports">Reports ({reports.filter(r => r.status === 'pending').length})</TabsTrigger>
        <TabsTrigger value="posts">Recent Posts</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No reports to review</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Report: {report.reason}
                  </CardTitle>
                  <Badge 
                    variant={
                      report.status === 'pending' ? 'default' :
                      report.status === 'resolved' ? 'secondary' :
                      'outline'
                    }
                  >
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Reported by: {report.reporter_profiles?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(report.created_at).toLocaleString()}
                  </p>
                  {report.description && (
                    <p className="text-sm mt-2">{report.description}</p>
                  )}
                </div>

                {report.posts && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={report.posts.profiles?.avatar_url} />
                        <AvatarFallback>
                          {report.posts.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {report.posts.profiles?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.posts.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{report.posts.content}</p>
                    {report.posts.image_url && (
                      <img 
                        src={report.posts.image_url} 
                        alt="Post content" 
                        className="mt-3 rounded-lg max-w-xs max-h-48 object-cover"
                      />
                    )}
                  </div>
                )}

                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                    {report.posts && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Post
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this post? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deletePost(report.posts!.id);
                                updateReportStatus(report.id, 'resolved');
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Post
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="posts" className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {post.profiles?.full_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this post? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePost(post.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Post
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-sm mb-3">{post.content}</p>
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="rounded-lg max-w-xs max-h-48 object-cover"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default ContentModeration;