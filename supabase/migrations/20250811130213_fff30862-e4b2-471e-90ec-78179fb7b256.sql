-- Add INSERT policy for profiles table to allow user creation via trigger
CREATE POLICY "Allow profile creation via system triggers"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);