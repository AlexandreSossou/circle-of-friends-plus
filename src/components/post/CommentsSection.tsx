
import React from "react";
import CommentsList from "./CommentsList";
import CommentForm from "./CommentForm";
import { Comment } from "@/types/post";

interface CommentsSectionProps {
  comments: Comment[];
  commentText: string;
  onCommentChange: (text: string) => void;
  onCommentSubmit: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  commentText,
  onCommentChange,
  onCommentSubmit
}) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <CommentsList comments={comments} />
      <CommentForm 
        commentText={commentText}
        onCommentChange={onCommentChange}
        onCommentSubmit={onCommentSubmit}
      />
    </div>
  );
};

export default CommentsSection;
