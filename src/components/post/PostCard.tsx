
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

export interface PostData {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  timestamp: string;
}

interface PostCardProps {
  post: PostData;
}

const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments);
  const { toast } = useToast();
  
  const toggleLike = () => {
    if (liked) {
      setLikesCount(prevCount => prevCount - 1);
    } else {
      setLikesCount(prevCount => prevCount + 1);
    }
    setLiked(!liked);
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      author: {
        id: "current-user",
        name: "John Doe",
        avatar: "/placeholder.svg",
        initials: "JD"
      },
      content: commentText,
      timestamp: "Just now"
    };
    
    setComments([...comments, newComment]);
    setCommentText("");
    
    toast({
      description: "Comment added successfully",
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Post shared",
      description: "Post has been shared with your friends",
    });
  };
  
  return (
    <div className="social-card mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Link to={`/profile/${post.author.id}`}>
              <Avatar className="mr-3">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.initials}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link to={`/profile/${post.author.id}`} className="font-medium hover:underline">
                {post.author.name}
              </Link>
              <p className="text-xs text-social-textSecondary">{post.timestamp}</p>
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
        
        <div className="mt-3">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>
      </div>
      
      {post.image && (
        <div className="max-h-[500px] overflow-hidden">
          <img src={post.image} alt="Post" className="w-full object-cover" />
        </div>
      )}
      
      <div className="px-4 py-2 border-t border-b border-gray-200">
        <div className="flex justify-between text-sm text-social-textSecondary">
          <div>{likesCount > 0 ? `${likesCount} likes` : ""}</div>
          <div>{comments.length > 0 ? `${comments.length} comments` : ""}</div>
        </div>
      </div>
      
      <div className="p-2 flex justify-around">
        <Button
          variant="ghost"
          onClick={toggleLike}
          className={`flex-1 ${liked ? "text-social-blue" : "text-social-textSecondary"}`}
        >
          <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-social-blue" : ""}`} />
          Like
        </Button>
        
        <Button
          variant="ghost"
          onClick={toggleComments}
          className="flex-1 text-social-textSecondary"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Comment
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleShare}
          className="flex-1 text-social-textSecondary"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>
      
      {showComments && (
        <div className="p-4 border-t border-gray-200">
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
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="absolute right-2 bottom-2 text-social-blue"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
