
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string;
  isOwnProfile: boolean;
}

const ProfileAvatar = ({ avatarUrl, isOwnProfile }: ProfileAvatarProps) => {
  return (
    <div className="absolute top-28 md:top-32 lg:top-40 left-4 md:left-6 z-10">
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
        <img
          src={avatarUrl || "/placeholder.svg"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      {isOwnProfile && (
        <Button 
          variant="secondary" 
          size="icon"
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white"
        >
          <CameraIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default ProfileAvatar;
