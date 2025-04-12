
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CreatePostCard from "@/components/post/CreatePostCard";
import PostCard from "@/components/post/PostCard";
import FeedFilter, { FeedType } from "@/components/post/FeedFilter";
import { PostData } from "@/components/post/PostCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

// Define type for post returned from Supabase
interface SupabasePost {
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

const Index = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeed, setActiveFeed] = useState<FeedType>("connections");

  // Fetch friends and acquaintances list for filtering posts
  const { data: connections } = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from("friends")
          .select("friend_id")
          .eq("user_id", user.id)
          .in("relationship_type", ["friend", "acquaintance"]);
          
        if (error) throw error;
        
        return data.map(item => item.friend_id);
      } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch posts with filter based on active feed
  const { data: posts = [] } = useQuery({
    queryKey: ["posts", activeFeed, user?.id, connections],
    queryFn: async () => {
      setIsLoading(true);
      
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
        if (activeFeed === "connections" && user && connections) {
          if (connections.length > 0) {
            // Include user's own posts and posts from connections that are not global
            query = query.or(`user_id.eq.${user.id},user_id.in.(${connections.join(',')})`);
          } else {
            // If no connections, only show user's own posts
            query = query.eq('user_id', user.id);
          }
        } else if (activeFeed === "global") {
          // For global feed, include posts marked as global or from connections
          if (user && connections && connections.length > 0) {
            query = query.or(`is_global.eq.true,user_id.eq.${user.id},user_id.in.(${connections.join(',')})`);
          } else if (user) {
            query = query.or(`is_global.eq.true,user_id.eq.${user.id}`);
          } else {
            query = query.eq('is_global', true);
          }
        }
        
        const { data, error } = await query;

        if (error) {
          throw error;
        }
        
        // Transform the data to match the PostData type
        return (data as SupabasePost[]).map((post) => ({
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
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive"
        });
        return getDemoPostData();
      } finally {
        setIsLoading(false);
      }
    },
    enabled: true,
  });

  const handleFeedChange = (feedType: FeedType) => {
    setActiveFeed(feedType);
  };

  const getDemoPostData = (): PostData[] => {
    return [
      {
        id: "post-1",
        author: {
          id: "user-1",
          name: "Jane Smith",
          avatar: "/placeholder.svg",
          initials: "JS"
        },
        content: "Just finished a wonderful hike in the mountains! The views were absolutely breathtaking and the weather was perfect.",
        image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1000",
        timestamp: "2 hours ago",
        likes: 24,
        comments: [
          {
            id: "comment-1",
            author: {
              id: "user-3",
              name: "Michael Johnson",
              avatar: "/placeholder.svg",
              initials: "MJ"
            },
            content: "That looks amazing! Where is this?",
            timestamp: "1 hour ago"
          }
        ],
        liked: false
      },
      {
        id: "post-2",
        author: {
          id: "user-2",
          name: "Alex Williams",
          avatar: "/placeholder.svg",
          initials: "AW"
        },
        content: "I'm so excited to announce that I've started a new position as Senior Software Developer at TechCorp! Looking forward to this new chapter in my career.",
        timestamp: "5 hours ago",
        likes: 42,
        comments: [
          {
            id: "comment-2",
            author: {
              id: "user-4",
              name: "Sarah Davis",
              avatar: "/placeholder.svg",
              initials: "SD"
            },
            content: "Congratulations! They're lucky to have you!",
            timestamp: "4 hours ago"
          },
          {
            id: "comment-3",
            author: {
              id: "user-5",
              name: "David Wilson",
              avatar: "/placeholder.svg",
              initials: "DW"
            },
            content: "Amazing news! Let's catch up soon!",
            timestamp: "3 hours ago"
          }
        ],
        liked: true
      },
      {
        id: "post-3",
        author: {
          id: "group-1",
          name: "Tech Enthusiasts",
          avatar: "/placeholder.svg",
          initials: "TE"
        },
        content: "Our next virtual meetup will be on Friday at 7 PM EST. We'll be discussing the latest AI developments and their implications for the tech industry. Don't miss it!",
        timestamp: "Yesterday",
        likes: 15,
        comments: [],
        liked: false
      }
    ];
  };

  return (
    <MainLayout>
      <FeedFilter activeFeed={activeFeed} onFeedChange={handleFeedChange} />
      <CreatePostCard />
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="social-card p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-40 bg-gray-200 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="social-card p-8 text-center">
          <p className="text-social-textSecondary mb-2">
            {activeFeed === "connections" ? 
              "No posts from your connections yet." : 
              "There are no posts yet."}
          </p>
          <p>
            {activeFeed === "connections" ? 
              "Try adding more connections or check the global feed!" : 
              "Be the first to post something!"}
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default Index;
