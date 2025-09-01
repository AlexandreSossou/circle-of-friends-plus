
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
}

const ProfileCover = ({ isOwnProfile, coverPhotoUrl, onCoverUpdate }: ProfileCoverProps) => {
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
      console.log('Starting cover photo upload for user:', user.id);
      const result = await uploadPhoto(file, 'covers', user.id);
      console.log('Upload result:', result);
      
      if (result.success && result.url) {
        console.log('Calling onCoverUpdate with URL:', result.url);
        onCoverUpdate(result.url);
        toast({
          title: "Cover photo updated",
          description: "Your cover photo has been updated successfully."
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update cover photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditCover = () => {
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
          <div className="absolute bottom-4 right-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleEditCover}
              disabled={isUploading}
            >
              <CameraIcon className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Edit Cover'}</span>
            </Button>
          </div>
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

export default ProfileCover;
