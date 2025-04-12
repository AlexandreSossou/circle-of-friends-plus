
import React, { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Plane } from "lucide-react";

interface PostActionsProps {
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PostActions: React.FC<PostActionsProps> = ({ onImageChange }) => {
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" className="text-social-textSecondary" asChild>
        <label>
          <Camera className="w-5 h-5 mr-1" />
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </label>
      </Button>
      
      <Button variant="ghost" size="sm" className="text-social-textSecondary" asChild>
        <Link to="/travels">
          <Plane className="w-5 h-5 mr-1" />
          <span>Travel</span>
        </Link>
      </Button>
    </div>
  );
};

export default PostActions;
