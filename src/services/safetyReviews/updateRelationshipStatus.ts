
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
    const { data, error } = await supabase
      .from('profiles')
      .update({
        marital_status: maritalStatus,
        partner_id: partnerId
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
