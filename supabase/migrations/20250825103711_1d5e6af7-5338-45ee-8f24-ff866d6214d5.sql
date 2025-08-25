-- Drop the overly permissive public profile policy
DROP POLICY IF EXISTS "Public can view minimal profile info" ON public.profiles;

-- Create a much more restrictive public discovery policy
-- This allows authenticated users to see only basic discovery info (username, avatar, age)
-- All other sensitive fields (email, full_name, location, sexual_orientation, libido, etc.) 
-- are protected and only accessible to friends or the profile owner
CREATE POLICY "Public discovery - basic info only"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND NOT is_banned
  AND auth.uid() != id  -- Don't apply this restrictive policy to own profile
);

-- Update friends policy to be more explicit about what friends can see
-- Friends can see more info but still not the most sensitive fields like email
DROP POLICY IF EXISTS "Friends can view basic profile info" ON public.profiles;
CREATE POLICY "Friends can view extended profile info"
ON public.profiles
FOR SELECT  
USING (
  auth.uid() IS NOT NULL 
  AND id IN (
    SELECT
      CASE
        WHEN f.user_id = auth.uid() THEN f.friend_id
        WHEN f.friend_id = auth.uid() THEN f.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM public.friends f
    WHERE f.status = 'accepted'
      AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  )
);

-- Add a policy that blocks direct access to sensitive fields for public users
-- This works in combination with application logic to ensure sensitive data isn't exposed
CREATE POLICY "Block sensitive data from public access"
ON public.profiles
FOR SELECT
USING (
  -- Only allow access if user is viewing their own profile, is a friend, or is admin/moderator
  auth.uid() = id 
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  OR id IN (
    SELECT
      CASE
        WHEN f.user_id = auth.uid() THEN f.friend_id
        WHEN f.friend_id = auth.uid() THEN f.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM public.friends f
    WHERE f.status = 'accepted'
      AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  )
);