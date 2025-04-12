
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Comment } from "@/types/post";

export const usePostActions = (
  initialLiked: boolean,
  initialLikesCount: number,
  initialComments: Comment[]
) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(initialComments);
  const { toast } = useToast();
  
  const toggleLike = () => {
    if (liked) {
      setLikesCount(prevCount => prevCount - 1);
    } else {
      setLikesCount(prevCount => prevCount + 1);
    }
    setLiked(!liked);
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
