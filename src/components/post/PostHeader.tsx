
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";  
import { MoreHorizontal, Globe, Users, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostHeaderProps {
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  timestamp: string;
  isGlobal?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  postId?: string;
  postAuthorId?: string;
  onPostDeleted?: () => void;
}

const PostHeader: React.FC<PostHeaderProps> = ({ 
  author, 
  timestamp, 
  isGlobal, 
  moderationStatus,
  postId, 
  postAuthorId, 
  onPostDeleted 
}) => {
  const { user } = useAuth();
  const { hasAdminAccess, hasModeratorAccess } = useUserRole();
  const { toast } = useToast();

  const canDeletePost = () => {
    if (!user) return false;
    // User can delete their own post
    if (user.id === postAuthorId) return true;
    // Admins and moderators can delete any post
    return hasAdminAccess || hasModeratorAccess;
  };

  const handleDeletePost = async () => {
    if (!postId) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Log admin activity if it's not the user's own post
      if (user && user.id !== postAuthorId && (hasAdminAccess || hasModeratorAccess)) {
        await supabase
          .from('admin_activities')
          .insert({
            admin_id: user.id,
            action: 'delete_post',
            target_type: 'post',
            target_id: postId,
            details: { reason: 'Admin/Moderator deletion' }
          });
      }

      toast({
        title: "Post deleted",
        description: "Post has been successfully deleted"
      });

      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center">
        <Link to={`/profile/${author.id}`}>
          <Avatar className="mr-3">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <div className="flex items-center">
            <Link to={`/profile/${author.id}`} className="font-medium hover:underline">
              {author.name}
            </Link>
            {isGlobal !== undefined && (
              <span className="ml-2 flex items-center text-xs text-social-textSecondary">
                {isGlobal ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    <span>Global</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    <span>Connections</span>
                  </>
                )}
              </span>
            )}
            {moderationStatus && user?.id === postAuthorId && (
              <span className="ml-2 flex items-center text-xs">
                {moderationStatus === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Review
                  </Badge>
                )}
                {moderationStatus === 'approved' && (
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                )}
                {moderationStatus === 'rejected' && (
                  <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                  </Badge>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-social-textSecondary">{timestamp}</p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Save post</DropdownMenuItem>
          <DropdownMenuItem>Hide post</DropdownMenuItem>
          <DropdownMenuItem>Report post</DropdownMenuItem>
          {canDeletePost() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
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
                    onClick={handleDeletePost}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Post
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostHeader;
