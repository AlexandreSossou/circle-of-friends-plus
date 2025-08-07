
import React from "react";
import PostCard from "./PostCard";
import PostsLoading from "./PostsLoading";
import EmptyPostsState from "./EmptyPostsState";
import { FeedType } from "./FeedFilter";
import { PostData } from "@/types/post";

interface PostsListProps {
  posts: PostData[];
  isLoading: boolean;
  feedType: FeedType;
  onPostDeleted?: () => void;
}

const PostsList: React.FC<PostsListProps> = ({ posts, isLoading, feedType, onPostDeleted }) => {
  if (isLoading) {
    return <PostsLoading />;
  }
  
  if (posts.length === 0) {
    return <EmptyPostsState feedType={feedType} />;
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onPostDeleted={onPostDeleted} />
      ))}
    </div>
  );
};

export default PostsList;
