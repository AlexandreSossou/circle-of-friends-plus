
import { useState } from "react";
import { PostData } from "@/types/post";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import CommentsSection from "./CommentsSection";
import { usePostActions } from "@/hooks/usePostActions";

interface PostCardProps {
  post: PostData;
  onPostDeleted?: () => void;
}

const PostCard = ({ post, onPostDeleted }: PostCardProps) => {
  const {
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
  } = usePostActions(post.id, post.liked, post.likes, post.comments);
  
  return (
    <div className="social-card mb-4">
      <div className="p-4">
        <PostHeader 
          author={post.author}
          timestamp={post.timestamp}
          isGlobal={post.isGlobal}
          moderationStatus={post.moderationStatus}
          postId={post.id}
          postAuthorId={post.author.id}
          onPostDeleted={onPostDeleted}
        />
        
        <PostContent 
          content={post.content}
          image={post.image}
          postId={post.id}
        />
      </div>
      
      <PostActions 
        liked={liked}
        likesCount={likesCount}
        commentsCount={comments.length}
        onLike={toggleLike}
        onComment={toggleComments}
        onShare={handleShare}
      />
      
      {showComments && (
        <CommentsSection 
          comments={comments}
          commentText={commentText}
          onCommentChange={setCommentText}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
    </div>
  );
};

export default PostCard;
