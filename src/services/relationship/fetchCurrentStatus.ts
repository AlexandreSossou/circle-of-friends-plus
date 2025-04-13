
import { supabase } from "@/integrations/supabase/client";
import { mockProfiles } from "../mocks/mockProfiles";

export interface CurrentStatus {
  marital_status?: string;
  partner_id?: string;
  partners?: string[];
}

export const fetchCurrentStatus = async (userId: string): Promise<CurrentStatus> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('marital_status, partner_id, partners')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching current status:", error);
      
      if (mockProfiles[userId]) {
        const mockUser = mockProfiles[userId];
        return {
          marital_status: mockUser.marital_status,
          partner_id: mockUser.partner_id,
          // Use safe access for partners from mockProfiles, since it might not have this property
          partners: mockUser.partners || []
        };
      }
      return {};
    }
    
    return {
      marital_status: data.marital_status,
      partner_id: data.partner_id,
      // Use optional chaining to safely access the partners property
      partners: data.partners || []
    };
  } catch (err) {
    console.error("Exception when fetching current status:", err);
    return {};
  }
};
