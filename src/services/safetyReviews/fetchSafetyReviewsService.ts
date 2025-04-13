
import { supabase } from "@/integrations/supabase/client";
import { Review, Reviewer } from "@/types/safetyReview";

export const fetchSafetyReviews = async (profileId: string): Promise<Review[]> => {
  if (!profileId) return [];

  try {
    const { data, error } = await supabase
      .from("safety_reviews")
      .select(`
        id,
        rating,
        content,
        created_at,
        user_id,
        profiles:user_id(full_name, avatar_url)
      `)
      .eq("reviewed_user_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching safety reviews:", error.message);
      return [];
    }

    return data.map((review) => {
      const profile = review.profiles as any;
      const reviewer: Reviewer = {
        name: profile?.full_name || "Anonymous",
        avatar: profile?.avatar_url || "/placeholder.svg",
        initials: profile?.full_name 
          ? profile.full_name.split(" ").map((n: string) => n[0]).join("") 
          : "AN"
      };

      return {
        id: review.id,
        rating: review.rating,
        content: review.content,
        created_at: review.created_at,
        reviewer
      };
    });
  } catch (error) {
    console.error("Unexpected error fetching safety reviews:", error);
    return [];
  }
};
