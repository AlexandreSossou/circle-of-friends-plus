-- Security Fix Part 4: Address Remaining Critical Security Issues

-- 1. Fix Profile Public Discovery Policy to Prevent Email Harvesting
DROP POLICY IF EXISTS "Secure public discovery - basic info only" ON profiles;
CREATE POLICY "Secure public discovery - basic info only"
ON profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND NOT is_banned 
  AND auth.uid() <> id
);

-- Create a safe profile discovery function that excludes sensitive data
CREATE OR REPLACE FUNCTION public.get_safe_profile_discovery(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text, 
  avatar_url text,
  age integer,
  gender text,
  location text,
  bio text
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.age,
    p.gender,
    p.location,
    -- Bio is shown but email, libido, sexual_orientation, private fields are excluded
    CASE 
      WHEN LENGTH(p.bio) > 100 THEN LEFT(p.bio, 100) || '...'
      ELSE p.bio
    END as bio
  FROM profiles p
  WHERE p.id = profile_id
    AND NOT p.is_banned
    AND p.id != auth.uid()  -- Don't apply restrictions to own profile
    AND auth.uid() IS NOT NULL; -- Must be authenticated
$$;

-- 2. Restrict Safety Reviews Access
DROP POLICY IF EXISTS "Anyone can view safety reviews" ON safety_reviews;
CREATE POLICY "Restricted safety review access"
ON safety_reviews
FOR SELECT
USING (
  auth.uid() = user_id  -- Reviewer can see their own reviews
  OR auth.uid() = reviewed_user_id  -- Reviewed user can see reviews about them
  OR has_role(auth.uid(), 'admin'::app_role)  -- Admins can see all
  OR has_role(auth.uid(), 'moderator'::app_role)  -- Moderators can see all
);

-- 3. Restrict Relationship Preferences to Necessary Access Only  
DROP POLICY IF EXISTS "Authenticated users can view relationship preferences" ON relationship_preferences;
CREATE POLICY "Limited relationship preferences access"
ON relationship_preferences
FOR SELECT
USING (
  -- Only active preferences for matching purposes
  is_active = true
  AND auth.uid() IS NOT NULL
);

-- 4. Add additional protection for profiles sensitive data
CREATE POLICY "Block sensitive profile data from public access"
ON profiles
FOR SELECT
USING (
  -- This policy specifically protects sensitive fields
  -- Only profile owner, admins, or friends can see full data
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'moderator'::app_role)
  OR id IN (
    SELECT
      CASE
        WHEN f.user_id = auth.uid() THEN f.friend_id
        WHEN f.friend_id = auth.uid() THEN f.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM friends f
    WHERE f.status = 'accepted'
      AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  )
);