-- Create a secure function to get public profile data (discovery mode)
-- This function only returns safe, non-sensitive fields for public discovery
CREATE OR REPLACE FUNCTION public.get_public_profile_discovery(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  age integer,
  gender text,
  location text  -- Only city/general location, not specific address
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return basic discovery info, no sensitive data
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.age,
    p.gender,
    p.location  -- Consider this carefully - you may want to remove this too
  FROM public.profiles p
  WHERE p.id = profile_id
    AND NOT p.is_banned
    AND p.id != auth.uid()  -- Don't apply restrictions to own profile
    -- Additional safety: ensure requester is authenticated
    AND auth.uid() IS NOT NULL;
$$;

-- Create a function to get friend profile data (more info than public)
CREATE OR REPLACE FUNCTION public.get_friend_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  gender text,
  age integer,
  sexual_orientation text,
  marital_status text,
  looking_for text[]
)
LANGUAGE sql
STABLE  
SECURITY DEFINER
SET search_path = public
AS $$
  -- Return extended info for friends, but still protect the most sensitive data (email, libido, etc.)
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.gender,
    p.age,
    p.sexual_orientation,
    p.marital_status,
    p.looking_for
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