
import React from "react";

interface PostContentProps {
  content: string;
  image?: string;
}

const PostContent: React.FC<PostContentProps> = ({ content, image }) => {
  return (
    <>
      <div className="mt-3">
        <p className="whitespace-pre-line">{content}</p>
      </div>
      
      {image && (
        <div className="max-h-[500px] overflow-hidden">
          <img src={image} alt="Post" className="w-full object-cover" />
        </div>
      )}
    </>
  );
};

export default PostContent;
