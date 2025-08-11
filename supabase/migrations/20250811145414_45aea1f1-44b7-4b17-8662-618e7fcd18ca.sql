-- Temporarily bypass the admin role assignment restriction for initial setup
-- We'll use a direct update to set the admin role
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alexandresossou@moderering.com');

-- If no role exists, insert one directly
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'alexandresossou@moderering.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alexandresossou@moderering.com')
  );