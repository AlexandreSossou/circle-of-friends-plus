import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { GroupPost } from "@/hooks/useGroupPosts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GroupPostCardProps {
  post: GroupPost;
  onReply: (postId: string, content: string) => void;
  onDelete: (postId: string) => void;
  isAdmin: boolean;
  isCreatingReply?: boolean;
}

const GroupPostCard = ({ post, onReply, onDelete, isAdmin, isCreatingReply }: GroupPostCardProps) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(post.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const canDelete = user?.id === post.user_id || isAdmin;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Main Post */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <Avatar>
            <AvatarImage src={post.author?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{getAuthorInitials(post.author?.full_name || "?")}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{post.author?.full_name || "Unknown"}</p>
                <p className="text-xs text-social-textSecondary">
                  {format(new Date(post.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this post? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(post.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Reply {post.replies && post.replies.length > 0 && `(${post.replies.length})`}
          </Button>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="pl-12 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyContent.trim() || isCreatingReply}
            >
              {isCreatingReply ? "Posting..." : "Post Reply"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="pl-12 space-y-4 border-l-2">
          {post.replies.map((reply) => (
            <div key={reply.id} className="pl-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reply.author?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(reply.author?.full_name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{reply.author?.full_name || "Unknown"}</p>
                      <p className="text-xs text-social-textSecondary">
                        {format(new Date(reply.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    {(user?.id === reply.user_id || isAdmin) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Reply</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this reply?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(reply.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupPostCard;