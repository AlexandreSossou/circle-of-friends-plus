
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
};

type ProfileFriendsProps = {
  friends: Friend[];
};

const ProfileFriends = ({ friends }: ProfileFriendsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <div key={friend.id} className="social-card p-4 flex flex-col items-center text-center">
          <Link to={`/profile/${friend.id}`}>
            <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
              <img 
                src={friend.avatar} 
                alt={friend.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">{friend.name}</h3>
          </Link>
          <p className="text-sm text-social-textSecondary mt-1">
            {friend.mutualFriends} mutual friends
          </p>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ProfileFriends;
