-- Update the handle_new_user function to extract additional fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    email,
    gender,
    age,
    marital_status
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    '/placeholder.svg',
    NEW.email,
    NEW.raw_user_meta_data->>'gender',
    CASE 
      WHEN NEW.raw_user_meta_data->>'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'age')::integer 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'marital_status'
  );
  RETURN NEW;
END;
$$;