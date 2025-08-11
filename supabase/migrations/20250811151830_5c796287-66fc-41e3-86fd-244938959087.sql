-- Add sexual orientation field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN sexual_orientation text;