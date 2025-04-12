
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostActionsProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  liked,
  likesCount,
  commentsCount,
  onLike,
  onComment,
  onShare
}) => {
  return (
    <>
      <div className="px-4 py-2 border-t border-b border-gray-200">
        <div className="flex justify-between text-sm text-social-textSecondary">
          <div>{likesCount > 0 ? `${likesCount} likes` : ""}</div>
          <div>{commentsCount > 0 ? `${commentsCount} comments` : ""}</div>
        </div>
      </div>
      
      <div className="p-2 flex justify-around">
        <Button
          variant="ghost"
          onClick={onLike}
          className={`flex-1 ${liked ? "text-social-blue" : "text-social-textSecondary"}`}
        >
          <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-social-blue" : ""}`} />
          Like
        </Button>
        
        <Button
          variant="ghost"
          onClick={onComment}
          className="flex-1 text-social-textSecondary"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Comment
        </Button>
        
        <Button
          variant="ghost"
          onClick={onShare}
          className="flex-1 text-social-textSecondary"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>
    </>
  );
};

export default PostActions;
