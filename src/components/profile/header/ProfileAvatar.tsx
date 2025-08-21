
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadPhoto } from "@/services/photoUpload";
import { useToast } from "@/hooks/use-toast";

interface ProfileAvatarProps {
  avatarUrl: string;
  isOwnProfile: boolean;
  onAvatarUpdate: (url: string) => void;
}

const ProfileAvatar = ({ avatarUrl, isOwnProfile, onAvatarUpdate }: ProfileAvatarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
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
          title: "Avatar updated",
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
    <div className="absolute top-28 md:top-32 lg:top-40 left-4 md:left-6 z-10">
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
        <img
          src={avatarUrl || "/placeholder.svg"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      {isOwnProfile && (
        <>
          <Button 
            variant="secondary" 
            size="icon"
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white"
            onClick={handleEditAvatar}
            disabled={isUploading}
          >
            <CameraIcon className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ProfileAvatar;
