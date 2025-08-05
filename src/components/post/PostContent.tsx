
import React from "react";
import { Link } from "react-router-dom";

interface PostContentProps {
  content: string;
  image?: string;
}

const PostContent: React.FC<PostContentProps> = ({ content, image }) => {
  // Parse mentions in content and make them clickable
  const parseContentWithMentions = (text: string) => {
    const mentionRegex = /@([^@\s]+)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, index) => {
      // If index is odd, it's a mentioned username
      if (index % 2 === 1) {
        return (
          <Link 
            key={index}
            to={`/profile/${part}`}
            className="text-primary hover:underline font-medium"
          >
            @{part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <>
      <div className="mt-3">
        <p className="whitespace-pre-line">
          {parseContentWithMentions(content)}
        </p>
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
