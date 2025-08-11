-- Fix unique constraint and update user role
DELETE FROM public.user_roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alexandresossou@moderering.com');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'alexandresossou@moderering.com';