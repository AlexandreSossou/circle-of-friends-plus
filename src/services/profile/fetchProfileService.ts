
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { mockProfiles } from "../mocks/mockProfiles";

export const fetchProfileData = async (profileId: string | undefined): Promise<ProfileData | null> => {
  if (!profileId) return null;

  // Use the secure function to get profile data with proper RLS
  try {
    const { data, error } = await supabase
      .rpc("get_safe_profile", { profile_id: profileId });

    console.log("Profile data from RPC:", data);

    if (error) {
      console.log("Error fetching profile from database:", error.message);
      console.log("Falling back to mock profile data");
      
      // If we have mock data for this profile ID, use it
      if (mockProfiles[profileId]) {
        return mockProfiles[profileId];
      }
      return null;
    }

    // Get the first result (RPC returns array)
    const profileData = Array.isArray(data) ? data[0] : data;
    if (!profileData) {
      if (mockProfiles[profileId]) {
        return mockProfiles[profileId];
      }
      return null;
    }

    if (profileData.partner_id) {
      try {
        const { data: partnerData, error: partnerError } = await supabase
          .rpc("get_safe_profile", { profile_id: profileData.partner_id });

        if (!partnerError && partnerData && partnerData.length > 0) {
          return {
            ...profileData,
            partner: { 
              full_name: partnerData[0].full_name, 
              avatar_url: partnerData[0].avatar_url 
            }
          } as ProfileData;
        }
      } catch (e) {
        console.error("Error fetching partner data:", e);
      }
    }

    return profileData as ProfileData;
  } catch (e) {
    console.error("Unexpected error fetching profile:", e);
    
    // Fallback to mock data
    if (mockProfiles[profileId]) {
      return mockProfiles[profileId];
    }
    return null;
  }
};
