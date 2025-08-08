-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Update the handle_new_user function to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    '/placeholder.svg',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with email from auth.users
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id
AND profiles.email IS NULL;