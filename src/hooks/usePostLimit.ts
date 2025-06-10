
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { canUserCreatePost } from "@/services/postLimits/postLimitService";

export const usePostLimit = () => {
  const { user } = useAuth();
  const [canCreate, setCanCreate] = useState(true);
  const [remainingPosts, setRemainingPosts] = useState(1);
  const [dailyLimit, setDailyLimit] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const checkPostLimit = async () => {
    if (!user) {
      setCanCreate(false);
      setRemainingPosts(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await canUserCreatePost(user.id);
      setCanCreate(result.canCreate);
      setRemainingPosts(result.remainingPosts);
      setDailyLimit(result.dailyLimit);
    } catch (error) {
      console.error('Error checking post limit:', error);
      setCanCreate(false);
      setRemainingPosts(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPostLimit();
  }, [user]);

  return {
    canCreate,
    remainingPosts,
    dailyLimit,
    isLoading,
    refreshLimit: checkPostLimit
  };
};
