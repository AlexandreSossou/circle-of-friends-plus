
import { supabase } from "@/integrations/supabase/client";

export interface PostLimit {
  id: string;
  daily_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchPostLimit = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('post_limits')
      .select('daily_limit')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching post limit:', error);
      return 5; // Default fallback
    }

    // If no data found, return default limit
    if (!data) {
      console.log('No post limit found, using default of 5');
      return 5;
    }

    return data.daily_limit || 5;
  } catch (error) {
    console.error('Error fetching post limit:', error);
    return 5; // Default fallback
  }
};

export const getUserPostCountToday = async (userId: string): Promise<number> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data, error } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());

    if (error) {
      console.error('Error fetching user post count:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error fetching user post count:', error);
    return 0;
  }
};

export const canUserCreatePost = async (userId: string): Promise<{ canCreate: boolean; remainingPosts: number; dailyLimit: number }> => {
  try {
    const [dailyLimit, currentCount] = await Promise.all([
      fetchPostLimit(),
      getUserPostCountToday(userId)
    ]);

    const remainingPosts = Math.max(0, dailyLimit - currentCount);
    const canCreate = remainingPosts > 0;

    return {
      canCreate,
      remainingPosts,
      dailyLimit
    };
  } catch (error) {
    console.error('Error checking if user can create post:', error);
    return {
      canCreate: false,
      remainingPosts: 0,
      dailyLimit: 1
    };
  }
};
