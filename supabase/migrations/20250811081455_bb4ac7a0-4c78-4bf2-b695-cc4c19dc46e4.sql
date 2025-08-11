-- Fix critical RLS vulnerability on safe_profiles view
-- Views need explicit RLS policies to be properly secured

-- Enable RLS on the safe_profiles view
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Drop and recreate the view with proper security
DROP VIEW IF EXISTS public.safe_profiles;

-- Create the safe_profiles view as a security definer function instead
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  age integer,
  partner_id uuid,
  partners uuid[],
  private_partner_id uuid,
  private_partners uuid[],
  is_banned boolean,
  banned_until timestamptz,
  banned_by uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  gender text,
  marital_status text,
  private_marital_status text,
  looking_for text[],
  banned_reason text,
  email text
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
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
      -- Only show ban status to admins/moderators or the user themselves
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
  WHERE p.id = profile_id
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

-- Create a more secure way to get multiple profiles
CREATE OR REPLACE FUNCTION public.get_safe_profiles_list(profile_ids uuid[] DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  age integer,
  partner_id uuid,
  partners uuid[],
  private_partner_id uuid,
  private_partners uuid[],
  is_banned boolean,
  banned_until timestamptz,
  banned_by uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  gender text,
  marital_status text,
  private_marital_status text,
  looking_for text[],
  banned_reason text,
  email text
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_profiles_list(uuid[]) TO authenticated;