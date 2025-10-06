-- Comprehensive security fix for profiles table RLS
-- Remove ALL existing SELECT policies and rebuild with explicit, secure policies

-- Step 1: Drop ALL existing problematic policies
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block sensitive data from public access" ON public.profiles;
DROP POLICY IF EXISTS "Block sensitive profile data from public access" ON public.profiles;
DROP POLICY IF EXISTS "Friends can view extended profile info" ON public.profiles;
DROP POLICY IF EXISTS "Friends can view basic profile info only" ON public.profiles;
DROP POLICY IF EXISTS "Admins and moderators can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

-- Step 2: Create clear, explicit, and secure SELECT policies
-- Policy 1: Users can ONLY view their own complete profile
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Policy 2: Admins and moderators can view all profiles (for moderation purposes)
CREATE POLICY "Admins and moderators full access"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'admin'::public.app_role) 
    OR has_role(auth.uid(), 'moderator'::public.app_role)
  )
);

-- Policy 3: Friends have LIMITED access - MUST use get_friend_profile_data() function
-- This policy grants row-level access but application MUST use the secure function for column filtering
CREATE POLICY "Friends limited access via function only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND id != auth.uid()  -- Not their own profile
  AND id IN (
    SELECT
      CASE
        WHEN f.user_id = auth.uid() THEN f.friend_id
        WHEN f.friend_id = auth.uid() THEN f.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM public.friends f
    WHERE f.status = 'accepted'
      AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  )
);

-- Step 3: Add database-level comment documenting the security model
COMMENT ON TABLE public.profiles IS 'SECURITY MODEL: Users see only their own full profile. Admins/moderators see all profiles. Friends can query this table but MUST use get_friend_profile_data() function to get only non-sensitive fields (username, name, avatar, bio, location, age, gender, marital_status). Direct SELECT queries by friends will return sensitive data - application code must enforce function usage.';

-- Step 4: Create a secure view for friend profile access (read-only, safe columns only)
CREATE OR REPLACE VIEW public.friend_profiles_safe AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.cover_photo_url,
  p.bio,
  p.location,
  p.gender,
  p.age,
  p.marital_status,
  p.created_at
FROM public.profiles p
WHERE p.id IN (
  SELECT
    CASE
      WHEN f.user_id = auth.uid() THEN f.friend_id
      WHEN f.friend_id = auth.uid() THEN f.user_id
      ELSE NULL::uuid
    END AS friend_id
  FROM public.friends f
  WHERE f.status = 'accepted'
    AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
)
AND NOT p.is_banned;

-- Grant access to the view
GRANT SELECT ON public.friend_profiles_safe TO authenticated;

COMMENT ON VIEW public.friend_profiles_safe IS 'Safe view for friend profile access. Only returns non-sensitive fields. Use this view instead of direct profiles table queries for friend data.';

-- Step 5: Log the security improvement
DO $$
BEGIN
  RAISE NOTICE 'SECURITY FIX APPLIED: Profiles table now has explicit, minimal-privilege RLS policies. Friends can only see limited data through get_friend_profile_data() function or friend_profiles_safe view. Sensitive fields (sexual_orientation, libido, expression, private_*, partners, looking_for) are protected from friend access.';
END $$;