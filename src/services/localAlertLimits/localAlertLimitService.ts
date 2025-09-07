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

    // Get the limit configuration for this gender
    const { data: limitConfig, error: limitError } = await supabase
      .from("local_alert_limits")
      .select("monthly_limit, is_active")
      .eq("gender", profile.gender?.toLowerCase() || "")
      .eq("is_active", true)
      .single();

    let monthlyLimit = 0; // Default to unlimited (0)
    
    if (limitError || !limitConfig) {
      // If no specific config found, check for general gender categories
      const fallbackGenders = [
        profile.gender?.toLowerCase().includes('man') ? 'man' : null,
        profile.gender?.toLowerCase().includes('woman') ? 'woman' : null,
        profile.gender?.toLowerCase().includes('male') ? 'male' : null,
        profile.gender?.toLowerCase().includes('female') ? 'female' : null,
      ].filter(Boolean);

      for (const fallbackGender of fallbackGenders) {
        const { data: fallbackConfig } = await supabase
          .from("local_alert_limits")
          .select("monthly_limit, is_active")
          .eq("gender", fallbackGender)
          .eq("is_active", true)
          .single();

        if (fallbackConfig) {
          monthlyLimit = fallbackConfig.monthly_limit;
          break;
        }
      }
    } else {
      monthlyLimit = limitConfig.monthly_limit;
    }

    // If limit is 0, it means unlimited
    if (monthlyLimit === 0) {
      return {
        canCreate: true,
        remainingLocalAlerts: Infinity
      };
    }

    // Check if user has exceeded the limit
    if (currentCount >= monthlyLimit) {
      return {
        canCreate: false,
        remainingLocalAlerts: 0,
        limitReason: `${profile.gender || 'Users'} are limited to ${monthlyLimit} local alert${monthlyLimit > 1 ? 's' : ''} per month. You have already created ${currentCount} local alert${currentCount > 1 ? 's' : ''} this month.`
      };
    }

    return {
      canCreate: true,
      remainingLocalAlerts: monthlyLimit - currentCount
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
