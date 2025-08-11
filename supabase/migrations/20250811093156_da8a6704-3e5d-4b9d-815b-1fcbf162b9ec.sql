-- Remove the policy that still allows direct access to profiles table by friends/moderators
-- This policy bypasses our secure email protection functions

DROP POLICY IF EXISTS "Users can view safe profile data" ON public.profiles;

-- The email harvesting vulnerability is already fixed through the secure functions:
-- 1. get_safe_profile() only returns emails to profile owners and admins
-- 2. get_safe_profiles_list() only returns emails to profile owners and admins  
-- 3. All application code has been updated to use these secure functions

-- Keep only the essential policies:
-- - Users can view their own full profile (needed for profile editing)
-- - Admins can view all profile data (needed for administration)
-- All other access must go through the secure functions which protect emails