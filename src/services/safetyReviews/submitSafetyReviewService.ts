
import { supabase } from "@/integrations/supabase/client";

export const submitSafetyReview = async (
  profileId: string,
  rating: number,
  content: string
): Promise<{ success: boolean; error?: string }> => {
  if (!profileId || rating < 1 || rating > 5 || !content.trim()) {
    return { success: false, error: "Invalid review data" };
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return { success: false, error: "You must be logged in to submit a review" };
    }

    const userId = userData.user.id;
    
    // Prevent users from reviewing themselves
    if (userId === profileId) {
      return { success: false, error: "You cannot review yourself" };
    }

    const { error } = await supabase
      .from("safety_reviews")
      .upsert({
        user_id: userId,
        reviewed_user_id: profileId,
        rating,
        content,
      }, {
        onConflict: 'user_id,reviewed_user_id',
      });

    if (error) {
      console.error("Error submitting review:", error);
      return { 
        success: false, 
        error: error.code === "23505" 
          ? "You have already reviewed this user" 
          : error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error submitting review:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};
