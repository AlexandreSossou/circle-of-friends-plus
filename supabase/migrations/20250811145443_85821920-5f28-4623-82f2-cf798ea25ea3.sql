-- Temporarily modify the prevent_admin_self_modification function to allow initial admin setup
CREATE OR REPLACE FUNCTION public.prevent_admin_self_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Now assign the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'alexandresossou@moderering.com';