-- Fix security definer view warning by explicitly setting SECURITY INVOKER
-- This ensures the view respects the querying user's RLS policies

DROP VIEW IF EXISTS public.friend_profiles_safe;

CREATE VIEW public.friend_profiles_safe
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.cover_photo_url,
  p.bio,
  p.location,
  p.gender,
  p.age,
  p.marital_status,
  p.created_at
FROM public.profiles p
WHERE p.id IN (
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
AND NOT p.is_banned;

GRANT SELECT ON public.friend_profiles_safe TO authenticated;

COMMENT ON VIEW public.friend_profiles_safe IS 'SECURITY: Safe view for friend profile access with SECURITY INVOKER. Only returns non-sensitive fields (excludes sexual_orientation, libido, expression, private_*, partners, looking_for). Use this view for friend data instead of direct profiles queries.';