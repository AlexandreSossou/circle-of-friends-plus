-- The app_role type is missing from the public schema
-- Let's create it properly

-- First, drop anything that might conflict
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create the enum type in the public schema
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Now we need to fix the user_roles table to use the correct type
-- First, drop the problematic column if it exists
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS role;

-- Add it back with the correct type
ALTER TABLE public.user_roles ADD COLUMN role public.app_role NOT NULL DEFAULT 'user'::public.app_role;