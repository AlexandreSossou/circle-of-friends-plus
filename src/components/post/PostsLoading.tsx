
import React from "react";

const PostsLoading: React.FC = () => {
  return (
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
  );
};

export default PostsLoading;
