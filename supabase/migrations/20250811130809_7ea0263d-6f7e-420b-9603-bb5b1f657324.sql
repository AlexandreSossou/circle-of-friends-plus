-- Add policy to support the get_safe_profile function for moderators
CREATE POLICY "Moderators can view profiles for moderation"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND has_role(auth.uid(), 'moderator'::app_role)
  );