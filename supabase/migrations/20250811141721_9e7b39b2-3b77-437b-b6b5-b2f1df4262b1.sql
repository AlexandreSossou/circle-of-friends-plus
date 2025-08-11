-- Fix the prevent_admin_self_modification function
CREATE OR REPLACE FUNCTION public.prevent_admin_self_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Prevent admins from modifying their own roles
  IF NEW.user_id = auth.uid() AND OLD.role = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'Administrators cannot modify their own role';
  END IF;
  
  -- Prevent non-admins from modifying admin roles
  IF NEW.role = 'admin'::public.app_role AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only administrators can assign admin roles';
  END IF;
  
  RETURN NEW;
END;
$$;