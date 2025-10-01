import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadPhoto } from "@/services/photoUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COVER_OPTIONS, getCoverPhoto } from "@/utils/coverPhotos";

interface ProfileCoverProps {
  isOwnProfile: boolean;
  coverPhotoUrl?: string;
  onCoverUpdate: (url: string) => void;
  onAvatarUpdate: (url: string) => void;
}

const ProfileCover = ({ isOwnProfile, coverPhotoUrl, onCoverUpdate, onAvatarUpdate }: ProfileCoverProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  const handleCoverSelect = (coverId: string) => {
    onCoverUpdate(coverId);
    setShowCoverSelector(false);
    toast({
      title: "Cover photo updated",
      description: "Your cover photo has been updated successfully."
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file for profile picture.",
        variant: "destructive"
      });
      return;
    }

    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    const fileTypeText = isVideo ? "video" : "image";
    const sizeText = isVideo ? "20MB" : "5MB";
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select a ${fileTypeText} smaller than ${sizeText}.`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadPhoto(file, 'avatars', user.id);
      
      if (result.success && result.url) {
        onAvatarUpdate(result.url);
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully."
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditAvatar = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="h-40 md:h-56 lg:h-64 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
        <img
          src={getCoverPhoto(coverPhotoUrl)}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleEditAvatar}
                disabled={isUploading}
              >
                <CameraIcon className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Edit Profile'}</span>
              </Button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>

      <Dialog open={showCoverSelector} onOpenChange={setShowCoverSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose a Cover Photo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {COVER_OPTIONS.map((cover) => (
              <button
                key={cover.id}
                onClick={() => handleCoverSelect(cover.id)}
                className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
              >
                <img
                  src={cover.url}
                  alt={cover.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium text-sm text-center px-2">{cover.name}</span>
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