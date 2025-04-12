
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types/post";

interface CommentsListProps {
  comments: Comment[];
}

const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  return (
    <>
      {comments.map(comment => (
        <div key={comment.id} className="flex items-start gap-3 mb-3">
          <Link to={`/profile/${comment.author.id}`}>
            <Avatar>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback>{comment.author.initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="bg-social-gray p-3 rounded-lg">
              <Link to={`/profile/${comment.author.id}`} className="font-medium hover:underline">
                {comment.author.name}
              </Link>
              <p className="mt-1">{comment.content}</p>
            </div>
            <div className="flex gap-3 text-xs mt-1 text-social-textSecondary">
              <span>{comment.timestamp}</span>
              <button className="font-medium">Like</button>
              <button className="font-medium">Reply</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CommentsList;
