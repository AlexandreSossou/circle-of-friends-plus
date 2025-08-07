
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

import MainLayout from "@/components/layout/MainLayout";
import CreatePostCard from "@/components/post/CreatePostCard";
import FeedFilter, { FeedType } from "@/components/post/FeedFilter";
import PostsList from "@/components/post/PostsList";
import LiveSessionsCarousel from "@/components/live/LiveSessionsCarousel";
import { useLiveSessions } from "@/hooks/useLiveSessions";
import { fetchPosts, fetchUserConnections } from "@/api/posts";

const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeed, setActiveFeed] = useState<FeedType>("connections");
  const { liveSessions } = useLiveSessions();

  // Fetch friends and acquaintances list for filtering posts
  const { data: connections } = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: async () => fetchUserConnections(user?.id),
    enabled: !!user,
  });

  // Fetch posts with filter based on active feed
  const { data: posts = [] } = useQuery({
    queryKey: ["posts", activeFeed, user?.id, connections],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const result = await fetchPosts(activeFeed, user?.id, connections);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: true,
  });

  const handleFeedChange = (feedType: FeedType) => {
    setActiveFeed(feedType);
  };

  const handlePostDeleted = () => {
    // Invalidate and refetch posts
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <MainLayout>
      <FeedFilter activeFeed={activeFeed} onFeedChange={handleFeedChange} />
      {liveSessions.length > 0 && (
        <LiveSessionsCarousel sessions={liveSessions} />
      )}
      <CreatePostCard />
      <PostsList posts={posts} isLoading={isLoading} feedType={activeFeed} onPostDeleted={handlePostDeleted} />
    </MainLayout>
  );
};

export default Index;
