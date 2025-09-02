import { supabase } from "@/integrations/supabase/client";

interface LocalAlertLimitResult {
  canCreate: boolean;
  remainingLocalAlerts: number;
  limitReason?: string;
}

const getUserLocalAlertCountThisMonth = async (userId: string): Promise<number> => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (error) {
      console.error("Error fetching user local alert count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUserLocalAlertCountThisMonth:", error);
    return 0;
  }
};

export const canUserCreateLocalAlert = async (userId: string): Promise<LocalAlertLimitResult> => {
  try {
    // Get user profile to check gender
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gender")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return {
        canCreate: false,
        remainingLocalAlerts: 0,
        limitReason: "Unable to verify user profile"
      };
    }

    // Check how many local alerts the user has created this month
    const currentCount = await getUserLocalAlertCountThisMonth(userId);

    // Check if user is male
    const isMale = profile.gender?.toLowerCase() === 'male';
    
    if (isMale) {
      // Male users can only create 1 local alert per month
      const MALE_MONTHLY_LIMIT = 1;
      
      if (currentCount >= MALE_MONTHLY_LIMIT) {
        return {
          canCreate: false,
          remainingLocalAlerts: 0,
          limitReason: `Male users are limited to 1 local alert per month. You have already created ${currentCount} local alert${currentCount > 1 ? 's' : ''} this month.`
        };
      }

      return {
        canCreate: true,
        remainingLocalAlerts: MALE_MONTHLY_LIMIT - currentCount
      };
    }

    // Other users (female, non-binary, etc.) have no local alert limits
    return {
      canCreate: true,
      remainingLocalAlerts: Infinity
    };
  } catch (error) {
    console.error('Error checking local alert limits:', error);
    // In case of error, allow creation but log the issue
    return {
      canCreate: true,
      remainingLocalAlerts: 1
    };
  }
};
