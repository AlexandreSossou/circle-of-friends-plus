-- Recreate the missing app_role enum type
-- This is needed for the RLS policies and functions to work

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');