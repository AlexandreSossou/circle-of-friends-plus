-- Fix the remaining function search path issues
-- Update the newer functions to have immutable search paths

-- Fix get_public_profile_discovery function 
CREATE OR REPLACE FUNCTION public.get_public_profile_discovery(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  age integer,
  gender text,
  location text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
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

-- Fix get_friend_profile_data function
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
SET search_path TO ''
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

-- Fix get_safe_profiles_list function
CREATE OR REPLACE FUNCTION public.get_safe_profiles_list(profile_ids uuid[] DEFAULT NULL::uuid[])
RETURNS TABLE(
  id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, age integer, partner_id uuid, partners uuid[], private_partner_id uuid, private_partners uuid[], is_banned boolean, banned_until timestamp with time zone, banned_by uuid, username text, full_name text, avatar_url text, bio text, location text, gender text, marital_status text, private_marital_status text, looking_for text[], banned_reason text, email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.age,
    p.partner_id,
    p.partners,
    p.private_partner_id,
    p.private_partners,
    CASE 
      WHEN auth.uid() = p.id OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role) THEN p.is_banned
      ELSE false
    END as is_banned,
    CASE 
      WHEN auth.uid() = p.id OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role) THEN p.banned_until
      ELSE NULL
    END as banned_until,
    CASE 
      WHEN auth.uid() = p.id OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role) THEN p.banned_by
      ELSE NULL
    END as banned_by,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.gender,
    p.marital_status,
    p.private_marital_status,
    p.looking_for,
    CASE 
      WHEN auth.uid() = p.id OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role) THEN p.banned_reason
      ELSE NULL
    END as banned_reason,
    -- Email is ONLY visible to the profile owner and admins
    CASE 
      WHEN auth.uid() = p.id OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN p.email
      ELSE NULL
    END as email
  FROM public.profiles p
  WHERE (profile_ids IS NULL OR p.id = ANY(profile_ids))
    AND (
      -- User can see their own profile
      auth.uid() = p.id 
      -- Admins can see all profiles
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      -- Moderators can see profiles (but not emails)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      -- Friends can see each other's profiles (but not emails)  
      OR p.id IN (
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
$$;