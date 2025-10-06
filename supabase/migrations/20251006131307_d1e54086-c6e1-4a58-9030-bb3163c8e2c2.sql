-- Security Fix: Remove email column from profiles table
-- Emails should only be stored in auth.users, not in the public profiles table
-- This prevents any possibility of email harvesting through friend relationships

-- Drop the email column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update the handle_new_user trigger to stop inserting email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username,
    full_name, 
    avatar_url, 
    gender,
    age,
    marital_status
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    '/placeholder.svg',
    NEW.raw_user_meta_data->>'gender',
    CASE 
      WHEN NEW.raw_user_meta_data->>'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'age')::integer 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'marital_status'
  );
  RETURN NEW;
END;
$function$;

-- Drop and recreate functions to remove email from return types
DROP FUNCTION IF EXISTS public.get_safe_profiles_list(uuid[]);
CREATE FUNCTION public.get_safe_profiles_list(profile_ids uuid[] DEFAULT NULL::uuid[])
RETURNS TABLE(
  id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  age integer, 
  partner_id uuid, 
  partners uuid[], 
  private_partner_id uuid, 
  private_partners uuid[], 
  is_banned boolean, 
  banned_until timestamp with time zone, 
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
  banned_reason text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    END as banned_reason
  FROM public.profiles p
  WHERE (profile_ids IS NULL OR p.id = ANY(profile_ids))
    AND (
      auth.uid() = p.id 
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
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
$function$;

DROP FUNCTION IF EXISTS public.get_safe_profile(uuid);
CREATE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  age integer, 
  partner_id uuid, 
  partners uuid[], 
  private_partner_id uuid, 
  private_partners uuid[], 
  is_banned boolean, 
  banned_until timestamp with time zone, 
  banned_by uuid, 
  username text, 
  full_name text, 
  avatar_url text, 
  cover_photo_url text, 
  bio text, 
  location text, 
  gender text, 
  sexual_orientation text, 
  expression text, 
  libido text, 
  marital_status text, 
  private_marital_status text, 
  looking_for text[], 
  banned_reason text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    p.cover_photo_url,
    p.bio,
    p.location,
    p.gender,
    p.sexual_orientation,
    p.expression,
    p.libido,
    p.marital_status,
    p.private_marital_status,
    p.looking_for,
    CASE 
      WHEN auth.uid() = p.id OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role) THEN p.banned_reason
      ELSE NULL
    END as banned_reason
  FROM public.profiles p
  WHERE p.id = profile_id
    AND (
      auth.uid() = p.id 
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
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
$function$;

DROP FUNCTION IF EXISTS public.get_admin_profile_data(uuid);
CREATE FUNCTION public.get_admin_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
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
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.created_at,
    p.updated_at,
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

-- Create a new admin-only function to get user emails from auth.users
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT email
  FROM auth.users
  WHERE id = user_id
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR auth.uid() = user_id
    );
$function$;