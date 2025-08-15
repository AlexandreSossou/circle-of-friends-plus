import { supabase } from "@/integrations/supabase/client";

interface AnnouncementLimitResult {
  canCreate: boolean;
  remainingAnnouncements: number;
  limitReason?: string;
}

export const getUserAnnouncementCountThisMonth = async (userId: string): Promise<number> => {
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
      console.error("Error fetching user announcement count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUserAnnouncementCountThisMonth:", error);
    return 0;
  }
};

export const canUserCreateAnnouncement = async (userId: string): Promise<AnnouncementLimitResult> => {
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
        remainingAnnouncements: 0,
        limitReason: "Unable to verify user profile"
      };
    }

    // Check if user is male
    const isMale = profile.gender?.toLowerCase() === 'male';
    
    if (isMale) {
      // Males are limited to 1 announcement per month
      const monthlyCount = await getUserAnnouncementCountThisMonth(userId);
      const monthlyLimit = 1;
      
      return {
        canCreate: monthlyCount < monthlyLimit,
        remainingAnnouncements: Math.max(0, monthlyLimit - monthlyCount),
        limitReason: monthlyCount >= monthlyLimit ? "Male users are limited to 1 announcement per month" : undefined
      };
    } else {
      // Other genders have no limit for now
      return {
        canCreate: true,
        remainingAnnouncements: 999, // Unlimited
      };
    }
  } catch (error) {
    console.error("Error in canUserCreateAnnouncement:", error);
    return {
      canCreate: false,
      remainingAnnouncements: 0,
      limitReason: "Error checking announcement limits"
    };
  }
};
