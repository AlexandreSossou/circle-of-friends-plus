
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SupabasePost, transformPostData } from "./types/supabase-post";
import { fetchUserConnections } from "./connections";
import { getDemoPostData } from "./demo-data";
import { PostData } from "@/types/post";

// Fetch posts based on feed type and user connections
export const fetchPosts = async (
  feedType: 'connections' | 'global',
  userId: string | undefined,
  connections: string[] | undefined
) => {
  try {
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    // Filter by connections if "connections" feed is active and user is logged in
    if (feedType === "connections" && userId && connections) {
      if (connections.length > 0) {
        // Include user's own posts, posts from connections, and posts where user is tagged
        query = query.or(`user_id.eq.${userId},user_id.in.(${connections.join(',')}),id.in.(select post_id from post_tags where tagged_user_id = ${userId})`);
      } else {
        // If no connections, show user's own posts and posts where user is tagged
        query = query.or(`user_id.eq.${userId},id.in.(select post_id from post_tags where tagged_user_id = ${userId})`);
      }
    } else if (feedType === "global") {
      // For global feed, include posts marked as global, from connections, or where user is tagged
      if (userId && connections && connections.length > 0) {
        query = query.or(`is_global.eq.true,user_id.eq.${userId},user_id.in.(${connections.join(',')}),id.in.(select post_id from post_tags where tagged_user_id = ${userId})`);
      } else if (userId) {
        query = query.or(`is_global.eq.true,user_id.eq.${userId},id.in.(select post_id from post_tags where tagged_user_id = ${userId})`);
      } else {
        query = query.eq('is_global', true);
      }
    }
    
    const { data, error } = await query;

    if (error) {
      throw error;
    }
    
    // Transform the data to match the PostData type
    return (data as SupabasePost[]).map(transformPostData);
  } catch (error) {
    console.error("Error fetching posts:", error);
    toast({
      title: "Error",
      description: "Failed to load posts. Please try again later.",
      variant: "destructive"
    });
    return getDemoPostData();
  }
};

// Re-export other functions for backward compatibility
export { fetchUserConnections } from "./connections";
export { getDemoPostData } from "./demo-data";
export { transformPostData } from "./types/supabase-post";
export type { SupabasePost } from "./types/supabase-post";
