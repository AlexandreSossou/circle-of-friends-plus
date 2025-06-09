
import { supabase } from "@/integrations/supabase/client";
import { RelationshipPreference } from "@/types/profile";

export const fetchRelationshipPreferences = async (): Promise<RelationshipPreference[]> => {
  try {
    const { data, error } = await supabase
      .from('relationship_preferences')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error("Error fetching relationship preferences:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Exception when fetching relationship preferences:", err);
    return [];
  }
};
