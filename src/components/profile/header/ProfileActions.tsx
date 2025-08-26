
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, UserPlus, MessageCircle, X, Images, UserCheck, Clock } from "lucide-react";
import WinkButton from "../WinkButton";
import SharePhotosDialog from "../SharePhotosDialog";
import { useState } from "react";
import { useFriendshipStatus } from "@/hooks/useFriendshipStatus";
import { useFriendRequests } from "@/hooks/useFriendRequests";

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
  const { friendshipStatus, isLoading } = useFriendshipStatus(profileId);
  const { sendRequest, isSending } = useFriendRequests();

  const handleSendFriendRequest = () => {
    sendRequest(profileId);
  };

  const renderFriendButton = () => {
    if (isLoading) {
      return (
        <Button disabled className="bg-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          Loading...
        </Button>
      );
    }

    switch (friendshipStatus) {
      case 'friends':
        return (
          <Button disabled className="bg-green-600 hover:bg-green-700">
            <UserCheck className="w-4 h-4 mr-2" />
            Lovarinos
          </Button>
        );
      case 'pending_sent':
        return (
          <Button disabled className="bg-yellow-600 hover:bg-yellow-700">
            <Clock className="w-4 h-4 mr-2" />
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button disabled className="bg-blue-600 hover:bg-blue-700">
            <Clock className="w-4 h-4 mr-2" />
            Request Received
          </Button>
        );
      default:
        return (
          <Button 
            className="bg-social-blue hover:bg-social-darkblue" 
            onClick={handleSendFriendRequest}
            disabled={isSending}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Add Friend'}
          </Button>
        );
    }
  };

  if (!isOwnProfile) {
    return (
      <div className="flex flex-col gap-2">
        {renderFriendButton()}
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
