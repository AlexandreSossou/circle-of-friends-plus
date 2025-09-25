import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadPhoto } from "@/services/photoUpload";
import { useToast } from "@/hooks/use-toast";

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
  const [uploadType, setUploadType] = useState<'cover' | 'avatar'>('cover');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type (images and videos for avatars, only images for covers)
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (uploadType === 'cover' && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file for cover photo.",
        variant: "destructive"
      });
      return;
    }
    
    if (uploadType === 'avatar' && !isImage && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file for profile picture.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB for images, max 10MB for videos)
    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const fileTypeText = isVideo ? "video" : "image";
    const sizeText = isVideo ? "10MB" : "5MB";
    
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
      const bucket = uploadType === 'cover' ? 'covers' : 'avatars';
      console.log(`Starting ${uploadType} photo upload for user:`, user.id);
      const result = await uploadPhoto(file, bucket, user.id);
      console.log('Upload result:', result);
      
      if (result.success && result.url) {
        if (uploadType === 'cover') {
          console.log('Calling onCoverUpdate with URL:', result.url);
          onCoverUpdate(result.url);
          toast({
            title: "Cover photo updated",
            description: "Your cover photo has been updated successfully."
          });
        } else {
          console.log('Calling onAvatarUpdate with URL:', result.url);
          onAvatarUpdate(result.url);
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been updated successfully."
          });
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error(`Error uploading ${uploadType} photo:`, error);
      toast({
        title: "Upload failed",
        description: `Failed to update ${uploadType === 'cover' ? 'cover photo' : 'profile picture'}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditCover = () => {
    setUploadType('cover');
    fileInputRef.current?.click();
  };

  const handleEditAvatar = () => {
    setUploadType('avatar');
    fileInputRef.current?.click();
  };

  return (
    <div className="h-40 md:h-56 lg:h-64 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
      <img
        src={coverPhotoUrl || "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1000"}
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
              <span>{isUploading && uploadType === 'avatar' ? 'Uploading...' : 'Edit Profile'}</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleEditCover}
              disabled={isUploading}
            >
              <CameraIcon className="w-4 h-4" />
              <span>{isUploading && uploadType === 'cover' ? 'Uploading...' : 'Edit Cover'}</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={uploadType === 'avatar' ? "image/*,video/*" : "image/*"}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ProfileCover;