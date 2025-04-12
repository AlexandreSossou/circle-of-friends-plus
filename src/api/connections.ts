
import { supabase } from "@/integrations/supabase/client";

// Fetch user connections (friends and acquaintances)
export const fetchUserConnections = async (userId: string | undefined) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", userId)
      .in("relationship_type", ["friend", "acquaintance"]);
      
    if (error) throw error;
    
    return data.map(item => item.friend_id);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
};
