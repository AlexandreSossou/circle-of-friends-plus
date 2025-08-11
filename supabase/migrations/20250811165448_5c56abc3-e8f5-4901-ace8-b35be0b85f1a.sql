-- Add missing private profile columns to support private/public profile separation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS private_username TEXT,
ADD COLUMN IF NOT EXISTS private_bio TEXT,
ADD COLUMN IF NOT EXISTS private_avatar_url TEXT;