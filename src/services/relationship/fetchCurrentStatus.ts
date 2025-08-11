
import { supabase } from "@/integrations/supabase/client";
import { mockProfiles } from "../mocks/mockProfiles";

export interface CurrentStatus {
  marital_status?: string;
  partner_id?: string;
  partners?: string[];
  private_marital_status?: string;
  private_partner_id?: string;
  private_partners?: string[];
  looking_for?: string[];
}

export const fetchCurrentStatus = async (userId: string): Promise<CurrentStatus> => {
  try {
    const { data, error } = await supabase
      .rpc('get_safe_profile', { profile_id: userId });
    
    if (error) {
      console.error("Error fetching current status:", error);
      
      if (mockProfiles[userId]) {
        const mockUser = mockProfiles[userId];
        return {
          marital_status: mockUser.marital_status,
          partner_id: mockUser.partner_id,
          partners: mockUser.partners ?? [],
          private_marital_status: mockUser.private_marital_status,
          private_partner_id: mockUser.private_partner_id,
          private_partners: mockUser.private_partners ?? [],
          looking_for: mockUser.looking_for ?? []
        };
      }
      return {};
    }
    
    // Get the first result (RPC returns array)
    const profileData = Array.isArray(data) ? data[0] : data;
    if (!profileData) {
      if (mockProfiles[userId]) {
        const mockUser = mockProfiles[userId];
        return {
          marital_status: mockUser.marital_status,
          partner_id: mockUser.partner_id,
          partners: mockUser.partners ?? [],
          private_marital_status: mockUser.private_marital_status,
          private_partner_id: mockUser.private_partner_id,
          private_partners: mockUser.private_partners ?? [],
          looking_for: mockUser.looking_for ?? []
        };
      }
      return {};
    }
    
    return {
      marital_status: profileData.marital_status,
      partner_id: profileData.partner_id,
      partners: profileData.partners ?? [],
      private_marital_status: profileData.private_marital_status,
      private_partner_id: profileData.private_partner_id,
      private_partners: profileData.private_partners ?? [],
      looking_for: profileData.looking_for ?? []
    };
  } catch (err) {
    console.error("Exception when fetching current status:", err);
    return {};
  }
};
