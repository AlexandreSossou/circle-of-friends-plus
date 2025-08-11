-- CRITICAL: Remove RLS policies that allow direct table access bypassing secure functions
-- Current problem: "Authenticated users can access profiles for secure functions" policy 
-- allows friends/moderators to query the table directly, potentially accessing emails

-- Drop the policy that allows friends/moderators direct table access
DROP POLICY IF EXISTS "Authenticated users can access profiles for secure functions" ON public.profiles;

-- Keep only the essential minimal policies:
-- 1. Users can view their own profile (needed for profile editing/settings)
-- 2. Admins can view all profiles (needed for admin functions)

-- All other access MUST go through secure functions which control email visibility
-- This ensures no direct table queries can bypass email protection

-- Verify our current policies are now secure:
-- ✅ "Users can view their own full profile" - Own profile access only
-- ✅ "Admins can view all profile data" - Admin access only  
-- ✅ "Users can update their own profile" - Own profile updates only

-- NOTE: Application code uses secure functions (get_safe_profile, get_safe_profiles_list)
-- which have their own access control and email filtering built-in.
-- This change blocks any potential direct table access that could bypass email protection.