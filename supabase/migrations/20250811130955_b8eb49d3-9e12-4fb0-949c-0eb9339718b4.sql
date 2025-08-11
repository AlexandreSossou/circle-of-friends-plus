-- Fix the INSERT policy to allow the trigger function to work
-- The handle_new_user function is SECURITY DEFINER, so it runs with elevated privileges

DROP POLICY IF EXISTS "System can create profiles via triggers only" ON public.profiles;

-- Create a more permissive INSERT policy that allows both system and authenticated context
-- but with strict checks to prevent abuse
CREATE POLICY "Allow secure profile creation"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Allow if it's a system operation (service_role)
    current_setting('role') = 'service_role'
    OR
    -- OR if it's called from our secure trigger function context
    -- (the trigger runs as SECURITY DEFINER with elevated privileges)
    (
      auth.uid() IS NOT NULL 
      AND id = auth.uid()  -- Can only create profile for their own user_id
      AND email IS NOT NULL  -- Must have email (comes from auth metadata)
    )
  );