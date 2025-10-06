-- Security Fix: Remove email exposure vulnerability
-- Drop the overly permissive "Minimal public discovery" policy that allows 
-- direct table access to profiles without field-level restrictions

DROP POLICY IF EXISTS "Minimal public discovery - username and avatar only" ON public.profiles;

-- The application should use secure RPC functions like:
-- - get_safe_profile: Returns full profile only to authorized users (self, admin, moderator, friends)
-- - get_safe_profiles_list: Returns safe profile data to authorized users
-- - get_public_profile_discovery: Returns only id, username, avatar_url, age, gender for discovery
-- - get_friend_profile_data: Returns extended info for friends only
-- - get_admin_profile_data: Full access for admins/moderators only

-- These RPC functions implement proper field-level security by explicitly
-- selecting only safe fields and conditionally including sensitive fields like
-- email only for authorized users (self or admin)

-- Add explicit comment documenting the security approach
COMMENT ON TABLE public.profiles IS 'User profiles table. Direct SELECT access is restricted by RLS. Use secure RPC functions (get_safe_profile, get_safe_profiles_list, get_public_profile_discovery) which implement field-level security to prevent exposure of sensitive data like email addresses.';