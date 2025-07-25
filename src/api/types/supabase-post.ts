
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
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Transform Supabase post to PostData format
export const transformPostData = (post: SupabasePost): PostData => {
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
    likes: 0,
    comments: [],
    liked: false,
    isGlobal: post.is_global || false
  };
};
