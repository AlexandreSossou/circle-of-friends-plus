-- Fix function search path security issues
-- Update all functions to have immutable search paths

-- Fix prevent_admin_self_modification function
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
  
  -- Prevent admins from modifying their own roles
  IF NEW.user_id = auth.uid() AND OLD.role = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'Administrators cannot modify their own role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- Fix audit_role_changes function
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
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fix get_user_role function 
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin'::public.app_role THEN 1
      WHEN 'moderator'::public.app_role THEN 2
      WHEN 'user'::public.app_role THEN 3
    END
  LIMIT 1
$$;