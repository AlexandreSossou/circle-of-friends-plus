
import React from "react";
import PostCard, { PostData } from "./PostCard";
import PostsLoading from "./PostsLoading";
import EmptyPostsState from "./EmptyPostsState";
import { FeedType } from "./FeedFilter";

interface PostsListProps {
  posts: PostData[];
  isLoading: boolean;
  feedType: FeedType;
}

const PostsList: React.FC<PostsListProps> = ({ posts, isLoading, feedType }) => {
  if (isLoading) {
    return <PostsLoading />;
  }
  
  if (posts.length === 0) {
    return <EmptyPostsState feedType={feedType} />;
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsList;
