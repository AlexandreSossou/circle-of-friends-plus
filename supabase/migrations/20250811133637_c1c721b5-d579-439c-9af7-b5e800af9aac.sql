-- Fix the test function to check for correct trigger names
CREATE OR REPLACE FUNCTION public.test_user_creation()
RETURNS TABLE(profiles_count bigint, user_roles_count bigint, trigger_exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    (SELECT COUNT(*) FROM public.user_roles) as user_roles_count,
    (SELECT EXISTS(
      SELECT 1 FROM pg_trigger 
      WHERE tgname IN ('on_auth_user_created_01_profile', 'on_auth_user_created_02_role')
    )) as trigger_exists;
END;
$$;