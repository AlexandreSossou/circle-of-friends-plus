-- Add debugging to understand what's happening
-- Let's create a simple test to see if our functions work

-- Test function to check if the trigger functions are working
CREATE OR REPLACE FUNCTION public.test_user_creation()
RETURNS TABLE(
  profiles_count bigint,
  user_roles_count bigint,
  trigger_exists boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    (SELECT COUNT(*) FROM public.user_roles) as user_roles_count,
    (SELECT EXISTS(
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    )) as trigger_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;