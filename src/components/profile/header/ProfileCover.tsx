
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";

interface ProfileCoverProps {
  isOwnProfile: boolean;
}

const ProfileCover = ({ isOwnProfile }: ProfileCoverProps) => {
  return (
    <div className="h-40 md:h-56 lg:h-64 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
      <img
        src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1000"
        alt="Cover"
        className="w-full h-full object-cover"
      />
      {isOwnProfile && (
        <div className="absolute bottom-4 right-4">
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <CameraIcon className="w-4 h-4" />
            <span>Edit Cover</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileCover;
