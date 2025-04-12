
import React, { ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

interface PostInputProps {
  postText: string;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const PostInput: React.FC<PostInputProps> = ({ postText, onTextChange }) => {
  return (
    <Textarea
      placeholder="What's on your mind?"
      className="resize-none min-h-[80px] border-none bg-social-gray focus-visible:ring-0 p-3"
      value={postText}
      onChange={onTextChange}
    />
  );
};

export default PostInput;
