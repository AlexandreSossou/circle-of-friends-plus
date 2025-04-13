
import { supabase } from "@/integrations/supabase/client";

export type RelationshipUpdateParams = {
  userId: string;
  maritalStatus: string;
  partnerId?: string;
};

export const updateRelationshipStatus = async ({
  userId,
  maritalStatus,
  partnerId
}: RelationshipUpdateParams) => {
  try {
    // First check if the partner exists in the profiles table
    if (partnerId) {
      const { data: partnerExists, error: partnerCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', partnerId)
        .single();
        
      if (partnerCheckError || !partnerExists) {
        console.error("Partner profile not found:", partnerCheckError || "No partner with this ID exists");
        return { success: false, error: "The selected partner profile does not exist" };
      }
    }
    
    // Then proceed with updating the relationship status
    const { data, error } = await supabase
      .from('profiles')
      .update({
        marital_status: maritalStatus,
        partner_id: partnerId || null // Explicitly set to null if undefined
      })
      .eq('id', userId);
      
    if (error) {
      console.error("Error updating relationship status:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating relationship status:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};
