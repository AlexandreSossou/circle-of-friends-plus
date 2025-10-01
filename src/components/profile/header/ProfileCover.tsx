import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import winterCover from "@/assets/covers/winter.png";
import raveCover from "@/assets/covers/rave.png";
import beachCover from "@/assets/covers/beach.png";
import jungleCover from "@/assets/covers/jungle.png";

interface ProfileCoverProps {
  isOwnProfile: boolean;
  coverPhotoUrl?: string;
  onCoverUpdate: (url: string) => void;
}

const COVER_OPTIONS = [
  { id: 'winter', name: 'Winter', url: winterCover },
  { id: 'rave', name: 'Rave', url: raveCover },
  { id: 'beach', name: 'Beach', url: beachCover },
  { id: 'jungle', name: 'Jungle', url: jungleCover },
];

const ProfileCover = ({ isOwnProfile, coverPhotoUrl, onCoverUpdate }: ProfileCoverProps) => {
  const { toast } = useToast();
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  const handleCoverSelect = (coverUrl: string) => {
    onCoverUpdate(coverUrl);
    setShowCoverSelector(false);
    toast({
      title: "Cover photo updated",
      description: "Your cover photo has been updated successfully."
    });
  };

  return (
    <>
      <div className="h-40 md:h-56 lg:h-64 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
        <img
          src={coverPhotoUrl || beachCover}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <div className="absolute bottom-4 right-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowCoverSelector(true)}
            >
              <CameraIcon className="w-4 h-4" />
              <span>Change Cover</span>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showCoverSelector} onOpenChange={setShowCoverSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose a Cover Photo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {COVER_OPTIONS.map((cover) => (
              <button
                key={cover.id}
                onClick={() => handleCoverSelect(cover.url)}
                className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
              >
                <img
                  src={cover.url}
                  alt={cover.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">{cover.name}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileCover;