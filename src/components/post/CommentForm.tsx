
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentFormProps {
  commentText: string;
  onCommentChange: (text: string) => void;
  onCommentSubmit: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  commentText,
  onCommentChange,
  onCommentSubmit
}) => {
  return (
    <div className="flex items-start gap-3 mt-4">
      <Avatar>
        <AvatarImage src="/placeholder.svg" alt="You" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
        <Textarea
          placeholder="Write a comment..."
          className="resize-none min-h-[60px] pr-10 border-none bg-social-gray focus-visible:ring-0"
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onCommentSubmit();
            }
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={onCommentSubmit}
          disabled={!commentText.trim()}
          className="absolute right-2 bottom-2 text-social-blue"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CommentForm;
