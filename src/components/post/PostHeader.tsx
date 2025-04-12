
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Globe, Users } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface PostHeaderProps {
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  timestamp: string;
  isGlobal?: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({ author, timestamp, isGlobal }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center">
        <Link to={`/profile/${author.id}`}>
          <Avatar className="mr-3">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <div className="flex items-center">
            <Link to={`/profile/${author.id}`} className="font-medium hover:underline">
              {author.name}
            </Link>
            {isGlobal !== undefined && (
              <span className="ml-2 flex items-center text-xs text-social-textSecondary">
                {isGlobal ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    <span>Global</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    <span>Connections</span>
                  </>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-social-textSecondary">{timestamp}</p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Save post</DropdownMenuItem>
          <DropdownMenuItem>Hide post</DropdownMenuItem>
          <DropdownMenuItem>Report post</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostHeader;
