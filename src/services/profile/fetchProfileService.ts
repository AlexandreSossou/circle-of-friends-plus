
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { mockProfiles } from "../mocks/mockProfiles";

export const fetchProfileData = async (profileId: string | undefined): Promise<ProfileData | null> => {
  if (!profileId) return null;

  // First try to get the profile from the database
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      console.log("Error fetching profile from database:", error.message);
      console.log("Falling back to mock profile data");
      
      // If we have mock data for this profile ID, use it
      if (mockProfiles[profileId]) {
        return mockProfiles[profileId];
      }
      return null;
    }

    if (data.partner_id) {
      try {
        const { data: partnerData, error: partnerError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.partner_id)
          .single();

        if (!partnerError) {
          return {
            ...data,
            partner: partnerData
          } as ProfileData;
        }
      } catch (e) {
        console.error("Error fetching partner data:", e);
      }
    }

    return data as ProfileData;
  } catch (e) {
    console.error("Unexpected error fetching profile:", e);
    
    // Fallback to mock data
    if (mockProfiles[profileId]) {
      return mockProfiles[profileId];
    }
    return null;
  }
};
