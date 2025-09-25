
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
    if (feedType === "connections" && userId) {
      if (connections && connections.length > 0) {
        // Include user's own posts and posts from connections
        const allUserIds = [userId, ...connections];
        query = query.in('user_id', allUserIds);
      } else {
        // If no connections, only show user's own posts
        query = query.eq('user_id', userId);
      }
    } else if (feedType === "global") {
      // For global feed, include posts marked as global or from connections
      if (userId && connections && connections.length > 0) {
        query = query.or(`is_global.eq.true,user_id.eq.${userId},user_id.in.(${connections.join(',')})`);
      } else if (userId) {
        query = query.or(`is_global.eq.true,user_id.eq.${userId}`);
      } else {
        query = query.eq('is_global', true);
      }
    }
    
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Get additional posts where user is tagged (separate query to avoid complex joins)
    let taggedPosts = [];
    if (userId) {
      // First get the post IDs where user is tagged
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tagged_user_id', userId);

      if (postTags && postTags.length > 0) {
        const taggedPostIds = postTags.map(tag => tag.post_id);
        
        const { data: taggedPostsData } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .in('id', taggedPostIds);
        
        if (taggedPostsData) {
          taggedPosts = taggedPostsData;
        }
      }
    }

    // Combine and deduplicate posts
    const allPosts = [...(data || []), ...taggedPosts];
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );

    // Sort by created_at
    uniquePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Transform the data to match the PostData type
    return (uniquePosts as SupabasePost[]).map(transformPostData);
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
