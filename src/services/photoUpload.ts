import { supabase } from "@/integrations/supabase/client";

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadPhoto = async (
  file: File, 
  bucket: 'avatars' | 'covers', 
  userId: string
): Promise<PhotoUploadResult> => {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert: true // Replace existing file if it exists
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error(`Error uploading ${bucket} photo:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const deletePhoto = async (
  url: string, 
  bucket: 'avatars' | 'covers'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract the file path from the URL
    const urlParts = url.split(`${bucket}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid URL format');
    }
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${bucket} photo:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};