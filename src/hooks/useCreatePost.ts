
import { useState, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { canUserCreatePost } from "@/services/postLimits/postLimitService";

interface TaggedUser {
  id: string;
  full_name: string;
  avatar_url: string;
}

export const useCreatePost = () => {
  const [postText, setPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);
  const [imageTaggedUsers, setImageTaggedUsers] = useState<TaggedUser[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleTextChange = (text: string, users: TaggedUser[]) => {
    setPostText(text);
    setTaggedUsers(users);
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
    setImageTaggedUsers([]);
  };

  const handleTaggedUsersChange = (users: TaggedUser[]) => {
    setImageTaggedUsers(users);
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
        ])
        .select();
      
      if (error) throw error;

      // Create image consent requests for tagged users in images
      if (imageTaggedUsers.length > 0 && data && data[0] && imagePreview) {
        const postId = data[0].id;
        const consentInserts = imageTaggedUsers.map(taggedUser => ({
          post_id: postId,
          tagged_user_id: taggedUser.id,
          tagged_by_user_id: user.id
        }));

        const { error: consentError } = await supabase
          .from('image_consent')
          .insert(consentInserts);

        if (consentError) {
          console.error("Error creating image consent requests:", consentError);
        }
      }

      // Create post tags for ALL tagged users (from text mentions AND image tags)
      const allTaggedUserIds = [...new Set([...taggedUsers.map(u => u.id), ...imageTaggedUsers.map(u => u.id)])];
      const allTaggedUsers = [...taggedUsers, ...imageTaggedUsers].filter((user, index, arr) => 
        arr.findIndex(u => u.id === user.id) === index
      );
      
      if (allTaggedUsers.length > 0 && data && data[0]) {
        const postId = data[0].id;
        const tagInserts = allTaggedUsers.map(taggedUser => ({
          post_id: postId,
          tagged_user_id: taggedUser.id,
          tagged_by_user_id: user.id
        }));

        console.log('Creating post tags for users:', allTaggedUsers.map(u => u.full_name));
        console.log('Tag inserts:', tagInserts);

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagInserts);

        if (tagError) {
          console.error("Error creating post tags:", tagError);
        } else {
          console.log("Successfully created post tags");
        }
      }
      
      setPostText("");
      setImagePreview(null);
      setIsGlobal(false);
      setTaggedUsers([]);
      setImageTaggedUsers([]);
      
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
    taggedUsers,
    imageTaggedUsers,
    handleTextChange,
    handleImageChange,
    removeImage,
    setIsGlobal,
    handleSubmit,
    handleTaggedUsersChange,
    isValid: !(!postText.trim() && !imagePreview)
  };
};
