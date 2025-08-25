-- Fix remaining function search path issues
-- Update all functions to have immutable search paths

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    email,
    gender,
    age,
    marital_status
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    '/placeholder.svg',
    NEW.email,
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
$$;

-- Fix handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role);
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix update_news_articles_updated_at function  
CREATE OR REPLACE FUNCTION public.update_news_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix validate_content_input function
CREATE OR REPLACE FUNCTION public.validate_content_input(content_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Basic input validation
  IF content_text IS NULL OR LENGTH(TRIM(content_text)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for excessively long content
  IF LENGTH(content_text) > 10000 THEN
    RETURN FALSE;
  END IF;
  
  -- Add more validation rules as needed
  RETURN TRUE;
END;
$$;

-- Fix get_safe_profile function 
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE(
  id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, age integer, partner_id uuid, partners uuid[], private_partner_id uuid, private_partners uuid[], is_banned boolean, banned_until timestamp with time zone, banned_by uuid, username text, full_name text, avatar_url text, bio text, location text, gender text, sexual_orientation text, libido text, marital_status text, private_marital_status text, looking_for text[], banned_reason text, email text
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
    p.sexual_orientation,
    p.libido,
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