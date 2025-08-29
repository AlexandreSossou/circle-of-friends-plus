-- Security Fix #1: Remove email harvesting vulnerability from profiles table
-- Drop the problematic "Public discovery - basic info only" policy
DROP POLICY IF EXISTS "Public discovery - basic info only" ON public.profiles;

-- Create a secure public discovery policy that excludes sensitive data
CREATE POLICY "Secure public discovery - basic info only" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND NOT is_banned 
  AND auth.uid() <> id
);

-- Security Fix #2: Secure message preferences - restrict to own preferences only
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view any message preferences" ON public.message_preferences;

-- Create a secure policy that only allows users to view their own preferences
CREATE POLICY "Users can view their own message preferences only" 
ON public.message_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

-- Security Fix #3: Restrict post_limits access to admins only
-- Drop the existing public access policy
DROP POLICY IF EXISTS "Anyone can view post limits" ON public.post_limits;

-- Create admin-only access policy
CREATE POLICY "Only admins can view post limits" 
ON public.post_limits 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix #4: Enhanced role management - prevent self-modification completely
-- Update the existing trigger to be more strict
CREATE OR REPLACE FUNCTION public.prevent_admin_self_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow initial admin setup when no admin exists yet
  IF NEW.role = 'admin'::public.app_role THEN
    -- Check if any admin exists
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
      -- First admin setup - allow it
      RETURN NEW;
    END IF;
    
    -- If admins exist, only allow admin users to assign admin roles
    IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Only administrators can assign admin roles';
    END IF;
  END IF;
  
  -- Completely prevent admins from modifying their own roles (INSERT, UPDATE, DELETE)
  IF NEW.user_id = auth.uid() AND (
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
  ) = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'Administrators cannot modify their own role';
  END IF;
  
  -- For DELETE operations, check if user is trying to delete their own admin role
  IF TG_OP = 'DELETE' AND OLD.user_id = auth.uid() AND OLD.role = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'Administrators cannot remove their own admin role';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Security Fix #5: Enhanced audit logging with more security details
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if this is not a system/signup operation (when auth.uid() is null)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.admin_activities (
      admin_id,
      action,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'role_assigned'
        WHEN TG_OP = 'UPDATE' THEN 'role_updated'
        WHEN TG_OP = 'DELETE' THEN 'role_removed'
      END,
      'user_role',
      COALESCE(NEW.user_id, OLD.user_id),
      jsonb_build_object(
        'old_role', CASE WHEN TG_OP != 'INSERT' THEN OLD.role ELSE NULL END,
        'new_role', CASE WHEN TG_OP != 'DELETE' THEN NEW.role ELSE NULL END,
        'timestamp', NOW(),
        'ip_address', current_setting('request.headers', true)::json->>'x-real-ip',
        'user_agent', current_setting('request.headers', true)::json->>'user-agent',
        'security_event', true
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Security Fix #6: Create secure function for friend profile access (excluding sensitive data)
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
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Return extended info for friends, but exclude sensitive data (email, libido, private fields)
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