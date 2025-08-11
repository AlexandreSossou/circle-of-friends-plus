-- Update alexandresossou@moderering.com to have admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'alexandresossou@moderering.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- If user already has a different role, update it
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alexandresossou@moderering.com');