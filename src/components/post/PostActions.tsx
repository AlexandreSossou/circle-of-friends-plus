
import React, { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Plane, Heart, MessageSquare, Share } from "lucide-react";

interface PostActionsProps {
  liked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onImageChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({ 
  liked, 
  likesCount, 
  commentsCount, 
  onLike, 
  onComment, 
  onShare, 
  onImageChange,
  disabled = false
}) => {
  // This is the original PostActions component for creating a post
  if (onImageChange) {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" className="text-social-textSecondary" asChild disabled={disabled}>
          <label>
            <Camera className="w-5 h-5 mr-1" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
              disabled={disabled}
            />
          </label>
        </Button>
        
        <Button variant="ghost" size="sm" className="text-social-textSecondary" asChild disabled={disabled}>
          <Link to="/travels">
            <Plane className="w-5 h-5 mr-1" />
            <span>Travel</span>
          </Link>
        </Button>
      </div>
    );
  }
  
  // This is for the post interaction actions (like, comment, share)
  return (
    <div className="flex justify-between border-t border-b border-gray-200 py-2 px-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`text-social-textSecondary ${liked ? 'text-red-500' : ''}`}
        onClick={onLike}
      >
        <Heart className={`w-5 h-5 mr-1 ${liked ? 'fill-red-500' : ''}`} />
        <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-social-textSecondary"
        onClick={onComment}
      >
        <MessageSquare className="w-5 h-5 mr-1" />
        <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-social-textSecondary"
        onClick={onShare}
      >
        <Share className="w-5 h-5 mr-1" />
        <span>Share</span>
      </Button>
    </div>
  );
};

export default PostActions;
