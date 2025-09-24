
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreatePost } from "@/hooks/useCreatePost";
import { usePostLimit } from "@/hooks/usePostLimit";
import { UserMentionInput } from "./UserMentionInput";
import ImagePreview from "./ImagePreview";
import ImageConsentTagging from "./ImageConsentTagging";
import PostActions from "./PostActions";
import VisibilityToggle from "./VisibilityToggle";
import SubmitPostButton from "./SubmitPostButton";
import PostLimitStatus from "./PostLimitStatus";

const CreatePostCard = () => {
  const {
    postText,
    imagePreview,
    isSubmitting,
    isGlobal,
    taggedUsers,
    handleTextChange,
    handleImageChange,
    removeImage,
    setIsGlobal,
    handleSubmit,
    handleTaggedUsersChange,
    isValid
  } = useCreatePost();

  const { canCreate } = usePostLimit();
  
  return (
    <div className="social-card p-4 mb-4">
      <PostLimitStatus />
      
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <UserMentionInput 
            value={postText} 
            onChange={handleTextChange}
            disabled={!canCreate}
            className="border-none bg-social-gray focus-visible:ring-0 p-3"
          />
          
          <ImagePreview 
            imagePreview={imagePreview} 
            onRemoveImage={removeImage} 
          />
          
          <ImageConsentTagging
            imagePreview={imagePreview}
            taggedUsers={taggedUsers}
            onTaggedUsersChange={handleTaggedUsersChange}
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 space-y-3 sm:space-y-0">
            <PostActions 
              onImageChange={handleImageChange}
              disabled={!canCreate}
            />
            
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <VisibilityToggle 
                isGlobal={isGlobal} 
                onVisibilityChange={setIsGlobal}
                disabled={!canCreate}
              />
              
              <SubmitPostButton 
                isSubmitting={isSubmitting} 
                isDisabled={!isValid || !canCreate}
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
