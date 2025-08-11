-- Fix the user_roles table to have proper default
-- The issue might be that the role column doesn't have a proper default

ALTER TABLE public.user_roles 
ALTER COLUMN role SET DEFAULT 'user'::public.app_role;