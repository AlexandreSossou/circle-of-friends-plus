
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, UserPlus, MessageCircle, X, Images } from "lucide-react";
import WinkButton from "../WinkButton";
import SharePhotosDialog from "../SharePhotosDialog";
import { useState } from "react";

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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
        <div className="flex gap-2 w-full">
          <Link to={`/messages?recipient=${profileId}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </Link>
          <WinkButton recipientId={profileId} />
        </div>
        <Button 
          variant="outline" 
          className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
          onClick={() => setShareDialogOpen(true)}
        >
          <Images className="w-4 h-4 mr-2" />
          Pics Share
        </Button>
        
        <SharePhotosDialog 
          open={shareDialogOpen} 
          onOpenChange={setShareDialogOpen} 
          recipientId={profileId}
        />
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
