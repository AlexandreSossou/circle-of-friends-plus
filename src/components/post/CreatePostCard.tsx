
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreatePost } from "@/hooks/useCreatePost";
import PostInput from "./PostInput";
import ImagePreview from "./ImagePreview";
import PostActions from "./PostActions";
import VisibilityToggle from "./VisibilityToggle";
import SubmitPostButton from "./SubmitPostButton";

const CreatePostCard = () => {
  const {
    postText,
    imagePreview,
    isSubmitting,
    isGlobal,
    handleTextChange,
    handleImageChange,
    removeImage,
    setIsGlobal,
    handleSubmit,
    isValid
  } = useCreatePost();
  
  return (
    <div className="social-card p-4 mb-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <PostInput 
            postText={postText} 
            onTextChange={handleTextChange} 
          />
          
          <ImagePreview 
            imagePreview={imagePreview} 
            onRemoveImage={removeImage} 
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 space-y-3 sm:space-y-0">
            <PostActions onImageChange={handleImageChange} />
            
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <VisibilityToggle 
                isGlobal={isGlobal} 
                onVisibilityChange={setIsGlobal} 
              />
              
              <SubmitPostButton 
                isSubmitting={isSubmitting} 
                isDisabled={!isValid}
                onSubmit={handleSubmit} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostCard;
