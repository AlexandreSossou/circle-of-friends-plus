
import { supabase } from "@/integrations/supabase/client";
import { mockProfiles } from "../../mocks/mockProfiles";

export const validatePartnerExists = async (partnerId: string): Promise<boolean> => {
  // Try to get from the database first
  const { data: partnerExists, error: partnerCheckError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', partnerId)
    .single();
    
  if (partnerCheckError || !partnerExists) {
    console.log(`Partner ${partnerId} not found in database, checking mock data...`);
    
    // If not in database, check if it exists in mock profiles
    if (!mockProfiles[partnerId]) {
      console.error(`Partner profile not found in database or mock data for ID: ${partnerId}`);
      return false;
    }
  }
  
  return true;
};

export const validateAllPartnersExist = async (partnerIds: string[]): Promise<boolean> => {
  for (const id of partnerIds) {
    const exists = await validatePartnerExists(id);
    if (!exists) {
      return false;
    }
  }
  return true;
};
