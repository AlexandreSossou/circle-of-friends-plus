
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Friend } from "@/types/profile";

type ProfileFriendsProps = {
  friends: Friend[];
};

const ProfileFriends = ({ friends }: ProfileFriendsProps) => {
  const navigate = useNavigate();

  const handleViewProfile = (id: string) => {
    // Navigate to the friend's profile using the proper UUID
    navigate(`/profile/${id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <div key={friend.id} className="social-card p-4 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-3 cursor-pointer" onClick={() => handleViewProfile(friend.id)}>
            <img 
              src={friend.avatar} 
              alt={friend.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium cursor-pointer" onClick={() => handleViewProfile(friend.id)}>
            {friend.name}
          </h3>
          <p className="text-sm text-social-textSecondary mt-1">
            {friend.mutualFriends} mutual friends
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full"
            onClick={() => handleViewProfile(friend.id)}
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ProfileFriends;
