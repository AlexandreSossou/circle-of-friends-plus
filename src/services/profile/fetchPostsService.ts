
import { supabase } from "@/integrations/supabase/client";
import { mockPostsByUser } from "../mocks/mockProfiles";

export const fetchProfilePosts = async (profileId: string | undefined): Promise<any[]> => {
  if (!profileId) return [];

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error fetching posts from database:", error.message);
      console.log("Falling back to mock post data");
      
      // If we have mock data for this profile ID, use it
      if (mockPostsByUser[profileId]) {
        return mockPostsByUser[profileId];
      }
      return [];
    }

    return data || [];
  } catch (e) {
    console.error("Unexpected error fetching posts:", e);
    
    // Fallback to mock data
    if (mockPostsByUser[profileId]) {
      return mockPostsByUser[profileId];
    }
    return [];
  }
};
