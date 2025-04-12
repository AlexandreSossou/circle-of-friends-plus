
import { Link } from "react-router-dom";
import PostCard from "@/components/post/PostCard";

type Post = {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: any[];
  liked: boolean;
};

type ProfilePostsProps = {
  posts: Post[];
  isOwnProfile: boolean;
};

const ProfilePosts = ({ posts, isOwnProfile }: ProfilePostsProps) => {
  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center py-8 text-social-textSecondary">
          <p>No posts to display.</p>
          {isOwnProfile && (
            <p className="mt-2">
              <Link to="/" className="text-social-blue hover:underline">
                Create your first post
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;
