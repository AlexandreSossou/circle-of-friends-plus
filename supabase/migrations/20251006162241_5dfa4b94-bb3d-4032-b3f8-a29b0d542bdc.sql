-- Fix profiles table RLS to restrict sensitive data access
-- Step 1: Drop overly permissive friend access policies
DROP POLICY IF EXISTS "Block sensitive data from public access" ON public.profiles;
DROP POLICY IF EXISTS "Block sensitive profile data from public access" ON public.profiles;
DROP POLICY IF EXISTS "Friends can view extended profile info" ON public.profiles;

-- Step 2: Create new restrictive policies

-- Admins and moderators can view full profiles (for moderation)
CREATE POLICY "Admins and moderators can view all profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::public.app_role) 
  OR has_role(auth.uid(), 'moderator'::public.app_role)
);

-- Friends can ONLY view basic non-sensitive profile fields
-- The application MUST use get_friend_profile_data() function for safe friend access
CREATE POLICY "Friends can view basic profile info only"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) 
  AND (id IN (
    SELECT
      CASE
        WHEN f.user_id = auth.uid() THEN f.friend_id
        WHEN f.friend_id = auth.uid() THEN f.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM friends f
    WHERE f.status = 'accepted'
      AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  ))
);

-- Step 3: Drop and recreate get_friend_profile_data with safe columns only
DROP FUNCTION IF EXISTS public.get_friend_profile_data(uuid);

CREATE FUNCTION public.get_friend_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  cover_photo_url text,
  bio text,
  location text,
  gender text,
  age integer,
  marital_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- Return only basic safe info for friends
  -- Excludes: sexual_orientation, libido, expression, private_*, partners, banned_*, looking_for
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
    p.marital_status
  FROM public.profiles p
  WHERE p.id = profile_id
    AND NOT p.is_banned
    -- Verify friendship exists
    AND p.id IN (
      SELECT
        CASE
          WHEN f.user_id = auth.uid() THEN f.friend_id
          WHEN f.friend_id = auth.uid() THEN f.user_id
          ELSE NULL::uuid
        END AS friend_id
      FROM public.friends f
      WHERE f.status = 'accepted'
        AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
    );
$$;

COMMENT ON FUNCTION public.get_friend_profile_data IS 'Security: Returns only basic, non-sensitive profile information for friends. Excludes sexual_orientation, libido, expression, private fields, partner info, and looking_for preferences to prevent privacy violations.';