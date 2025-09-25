
import { useState } from "react";
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
  const [comments, setComments] = useState(initialComments);
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
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
  
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      author: {
        id: "current-user",
        name: "John Doe",
        avatar: "/placeholder.svg",
        initials: "JD"
      },
      content: commentText,
      timestamp: "Just now"
    };
    
    setComments([...comments, newComment]);
    setCommentText("");
    
    toast({
      description: "Comment added successfully",
    });
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
    handleShare
  };
};
