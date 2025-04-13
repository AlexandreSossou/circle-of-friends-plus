
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, UserPlus, MessageCircle, X } from "lucide-react";
import WinkButton from "../WinkButton";

interface ProfileActionsProps {
  profileId: string;
  isOwnProfile: boolean;
  isEditing: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
  onSaveProfile: () => void;
  handleAddFriend: () => void;
}

const ProfileActions = ({
  profileId,
  isOwnProfile,
  isEditing,
  onEditClick,
  onCancelEdit,
  onSaveProfile,
  handleAddFriend
}: ProfileActionsProps) => {
  if (!isOwnProfile) {
    return (
      <div className="flex flex-col gap-2">
        <Button 
          className="bg-social-blue hover:bg-social-darkblue" 
          onClick={handleAddFriend}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
        <div className="flex gap-2">
          <Link to={`/messages?recipient=${profileId}`}>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </Link>
          <WinkButton recipientId={profileId} />
        </div>
      </div>
    );
  }
  
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancelEdit}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSaveProfile}>
          Save Changes
        </Button>
      </div>
    );
  }
  
  return (
    <Button variant="outline" onClick={onEditClick}>
      <Edit className="w-4 h-4 mr-2" />
      Edit Profile
    </Button>
  );
};

export default ProfileActions;
