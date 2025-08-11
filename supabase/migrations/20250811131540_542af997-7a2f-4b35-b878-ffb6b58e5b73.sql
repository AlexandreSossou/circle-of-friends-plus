-- Simplify the INSERT policy to debug the issue
-- The current policy might be too complex

DROP POLICY IF EXISTS "Allow secure profile creation" ON public.profiles;

-- Create a more straightforward INSERT policy
CREATE POLICY "Allow profile creation during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Allow system operations
    current_setting('role') = 'service_role'
    OR
    -- Allow authenticated users to create their own profile only
    (auth.uid() IS NOT NULL AND id = auth.uid())
  );