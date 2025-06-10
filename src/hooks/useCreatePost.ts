
import { useState, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { canUserCreatePost } from "@/services/postLimits/postLimitService";

export const useCreatePost = () => {
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
  };
  
  const handleSubmit = async () => {
    if (!postText.trim() && !imagePreview) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if user can create a post (daily limit)
      const limitCheck = await canUserCreatePost(user.id);
      
      if (!limitCheck.canCreate) {
        toast({
          title: "Daily post limit reached",
          description: `You can only create ${limitCheck.dailyLimit} post(s) per day. Try again tomorrow.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Create the post with visibility field
      const { data, error } = await supabase
        .from('posts')
        .insert([
          { 
            content: postText,
            image_url: imagePreview,
            user_id: user.id,
            is_global: isGlobal
          }
        ]);
      
      if (error) throw error;
      
      setPostText("");
      setImagePreview(null);
      setIsGlobal(false);
      
      toast({
        title: "Post created",
        description: `Your post has been published successfully. ${limitCheck.remainingPosts - 1} posts remaining today.`,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Post failed",
        description: "There was an error creating your post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    postText,
    imagePreview,
    isSubmitting,
    isGlobal,
    handleTextChange,
    handleImageChange,
    removeImage,
    setIsGlobal,
    handleSubmit,
    isValid: !(!postText.trim() && !imagePreview)
  };
};
