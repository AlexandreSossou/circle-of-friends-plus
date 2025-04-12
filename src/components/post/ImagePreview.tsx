
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  imagePreview: string | null;
  onRemoveImage: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imagePreview, onRemoveImage }) => {
  if (!imagePreview) return null;
  
  return (
    <div className="relative mt-2 rounded-lg overflow-hidden">
      <img src={imagePreview} alt="Post preview" className="w-full max-h-80 object-cover" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 w-8 h-8 rounded-full"
        onClick={onRemoveImage}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ImagePreview;
