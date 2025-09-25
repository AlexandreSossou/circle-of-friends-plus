
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/post";

export const usePostActions = (
  postId: string,
  initialLiked: boolean,
  initialLikesCount: number,
  initialComments: Comment[]
) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load comments when component mounts or when showComments changes
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments: Comment[] = data.map(comment => ({
        id: comment.id,
        author: {
          id: comment.user_id,
          name: comment.profiles?.full_name || 'Unknown User',
          avatar: comment.profiles?.avatar_url || '/placeholder.svg',
          initials: comment.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'
        },
        content: comment.content,
        timestamp: new Date(comment.created_at).toLocaleString()
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    }
  };
  
  const toggleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    
    try {
      if (liked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setLikesCount(prevCount => prevCount - 1);
        setLiked(false);
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert([{
            post_id: postId,
            user_id: user.id
          }]);

        if (error) throw error;
        
        setLikesCount(prevCount => prevCount + 1);
        setLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !user || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content: commentText.trim(),
          post_id: postId,
          user_id: user.id
        }])
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        author: {
          id: data.user_id,
          name: data.profiles?.full_name || 'Unknown User',
          avatar: data.profiles?.avatar_url || '/placeholder.svg',
          initials: data.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'
        },
        content: data.content,
        timestamp: new Date(data.created_at).toLocaleString()
      };
      
      setComments([...comments, newComment]);
      setCommentText("");
      
      toast({
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleShare = () => {
    toast({
      title: "Post shared",
      description: "Post has been shared with your friends",
    });
  };

  return {
    liked,
    likesCount,
    showComments,
    commentText,
    comments,
    toggleLike,
    toggleComments,
    handleCommentSubmit,
    setCommentText,
    handleShare,
    isSubmittingComment
  };
};
