
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { usePostVisibility } from "@/hooks/usePostVisibility";

interface PostContentProps {
  content: string;
  image?: string;
  postId: string;
}

const PostContent: React.FC<PostContentProps> = ({ content, image, postId }) => {
  const { isVisible } = usePostVisibility(postId, !!image);
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
          {isVisible ? (
            <img src={image} alt="Post" className="w-full object-cover" />
          ) : (
            <div className="bg-muted p-8 rounded-lg text-center">
              <EyeOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">Image Hidden</p>
              <p className="text-sm text-muted-foreground mt-1">
                This image is waiting for consent approval from tagged users
              </p>
              <Badge variant="secondary" className="mt-2">
                <Eye className="w-3 h-3 mr-1" />
                Pending Consent
              </Badge>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PostContent;
