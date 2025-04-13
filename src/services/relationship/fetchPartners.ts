
import { supabase } from "@/integrations/supabase/client";
import { mockProfiles } from "../mocks/mockProfiles";
import { Partner } from "@/types/relationship";

export const fetchPotentialPartners = async (userId: string): Promise<Partner[]> => {
  console.log("Fetching profiles from database...");
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .neq('id', userId);
    
    if (error) {
      console.error("Error fetching profiles:", error);
      return useMockProfiles(userId);
    }
    
    if (data && data.length > 0) {
      console.log("Got profiles from database:", data.length);
      return data
        .filter(profile => profile && profile.id)
        .map(profile => ({
          id: profile.id,
          full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
        }));
    } else {
      console.log("No profiles found in database, using mock data");
      return useMockProfiles(userId);
    }
  } catch (err) {
    console.error("Exception when fetching profiles:", err);
    return useMockProfiles(userId);
  }
};

const useMockProfiles = (userId: string): Partner[] => {
  console.log("Using mock profiles as partners");
  try {
    const mockPartners = Object.values(mockProfiles)
      .filter(profile => profile && profile.id && profile.id !== userId)
      .map(profile => ({
        id: profile.id,
        full_name: profile.full_name || `User ${profile.id.substring(0, 8)}`
      }));
    
    console.log("Available mock partners:", mockPartners.length);
    return mockPartners;
  } catch (error) {
    console.error("Error processing mock profiles:", error);
    return [];
  }
};
