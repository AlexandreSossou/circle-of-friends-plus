
import React from "react";
import { Link } from "react-router-dom";
import { FeedType } from "../post/FeedFilter";

interface EmptyPostsStateProps {
  feedType: FeedType;
}

const EmptyPostsState: React.FC<EmptyPostsStateProps> = ({ feedType }) => {
  return (
    <div className="social-card p-8 text-center">
      <p className="text-social-textSecondary mb-2">
        {feedType === "connections" ? 
          "No posts from your connections yet." : 
          "There are no posts yet."}
      </p>
      <p>
        {feedType === "connections" ? 
          "Try adding more connections or check the global feed!" : 
          "Be the first to post something!"}
      </p>
    </div>
  );
};

export default EmptyPostsState;
