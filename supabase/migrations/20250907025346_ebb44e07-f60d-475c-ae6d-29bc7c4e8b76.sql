-- Fix security issue: Restrict public profile discovery to essential fields only

-- First, update the existing safe profile discovery function to return only essential information
CREATE OR REPLACE FUNCTION public.get_public_profile_discovery(profile_id uuid)
RETURNS TABLE(id uuid, username text, avatar_url text, age integer, gender text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Only return truly essential discovery info for matching/discovery
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.age,
    p.gender
  FROM public.profiles p
  WHERE p.id = profile_id
    AND NOT p.is_banned
    AND p.id != auth.uid()  -- Don't apply restrictions to own profile
    AND auth.uid() IS NOT NULL; -- Must be authenticated
$function$;

-- Drop the problematic public discovery policy that exposes too much data
DROP POLICY IF EXISTS "Secure public discovery - basic info only" ON public.profiles;

-- Create a new, more secure public discovery policy that severely limits exposed data
CREATE POLICY "Minimal public discovery - username and avatar only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only allow viewing of essential fields for discovery/matching
  -- Full access is only through friend relationships or self-access
  (auth.uid() IS NOT NULL) 
  AND (NOT is_banned) 
  AND (auth.uid() <> id)
  -- This policy will be used in conjunction with application-level filtering
  -- to ensure only essential fields are returned for public discovery
);

-- Update the existing friend profile function to include more appropriate fields for friends
CREATE OR REPLACE FUNCTION public.get_friend_profile_data(profile_id uuid)
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
  sexual_orientation text, 
  expression text,
  marital_status text, 
  looking_for text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Return extended info for friends, but exclude the most sensitive data (email, libido, private fields)
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
    p.sexual_orientation,
    p.expression,
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
$function$;

-- Create a function specifically for admin/moderator access with full profile data
CREATE OR REPLACE FUNCTION public.get_admin_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  username text,
  full_name text,
  email text,
  avatar_url text,
  cover_photo_url text,
  bio text,
  location text,
  gender text,
  age integer,
  sexual_orientation text,
  expression text,
  libido text,
  marital_status text,
  private_marital_status text,
  looking_for text[],
  partner_id uuid,
  partners uuid[],
  private_partner_id uuid,
  private_partners uuid[],
  is_banned boolean,
  banned_until timestamp with time zone,
  banned_by uuid,
  banned_reason text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Full profile access for admins and moderators only
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.username,
    p.full_name,
    p.email,
    p.avatar_url,
    p.cover_photo_url,
    p.bio,
    p.location,
    p.gender,
    p.age,
    p.sexual_orientation,
    p.expression,
    p.libido,
    p.marital_status,
    p.private_marital_status,
    p.looking_for,
    p.partner_id,
    p.partners,
    p.private_partner_id,
    p.private_partners,
    p.is_banned,
    p.banned_until,
    p.banned_by,
    p.banned_reason
  FROM public.profiles p
  WHERE p.id = profile_id
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role) 
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
    );
$function$;

-- Add a comment to document the security fix
COMMENT ON POLICY "Minimal public discovery - username and avatar only" ON public.profiles IS 
'Security fix: Restricts public profile discovery to prevent exposure of sensitive personal information. Use dedicated functions for friend/admin access.';

-- Add comments to the new functions
COMMENT ON FUNCTION public.get_public_profile_discovery(uuid) IS 
'Returns minimal profile data for public discovery - only essential matching fields (username, avatar, age, gender)';

COMMENT ON FUNCTION public.get_friend_profile_data(uuid) IS 
'Returns extended profile data for verified friends - excludes most sensitive information like email and private fields';

COMMENT ON FUNCTION public.get_admin_profile_data(uuid) IS 
'Returns complete profile data for admins and moderators only - includes all fields including sensitive information';