
import { PostData } from "@/types/post";

// Define type for post returned from Supabase
export interface SupabasePost {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_global: boolean;
  is_pinned: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderated_by: string | null;
  moderated_at: string | null;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  likes?: Array<{
    id: string;
    user_id: string;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles?: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
}

// Transform Supabase post to PostData format
export const transformPostData = (post: SupabasePost, currentUserId?: string): PostData => {
  const likesCount = post.likes?.length || 0;
  const isLikedByUser = currentUserId ? 
    post.likes?.some(like => like.user_id === currentUserId) || false : false;

  // Transform comments
  const transformedComments = post.comments?.map(comment => ({
    id: comment.id,
    author: {
      id: comment.user_id,
      name: comment.profiles?.full_name || 'Unknown User',
      avatar: comment.profiles?.avatar_url || '/placeholder.svg',
      initials: comment.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'
    },
    content: comment.content,
    timestamp: new Date(comment.created_at).toLocaleString()
  })) || [];

  return {
    id: post.id,
    author: {
      id: post.user_id,
      name: post.profiles?.full_name || "Unknown User",
      avatar: post.profiles?.avatar_url || "/placeholder.svg",
      initials: post.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("") || "??"
    },
    content: post.content,
    image: post.image_url || undefined,
    timestamp: new Date(post.created_at).toLocaleDateString(),
    likes: likesCount,
    comments: transformedComments,
    liked: isLikedByUser,
    isGlobal: post.is_global || false,
    isPinned: post.is_pinned || false,
    moderationStatus: post.moderation_status,
    moderatedBy: post.moderated_by,
    moderatedAt: post.moderated_at
  };
};
