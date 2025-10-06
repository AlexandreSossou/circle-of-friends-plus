-- Fix infinite recursion in post_tags policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view post tags on accessible posts" ON public.post_tags;

-- Create a security definer function to check if a user is tagged in a post
-- This bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_user_tagged_in_post(user_uuid uuid, post_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.post_tags
    WHERE post_id = post_uuid
      AND tagged_user_id = user_uuid
  );
$function$;

-- Create new policy without circular dependency
CREATE POLICY "Users can view post tags on accessible posts"
ON public.post_tags
FOR SELECT
USING (
  post_id IN (
    SELECT p.id
    FROM public.posts p
    WHERE 
      -- User can see their own posts
      p.user_id = auth.uid()
      -- User can see approved global posts
      OR (p.is_global = true AND p.moderation_status = 'approved')
      -- User can see approved posts from friends
      OR (
        p.moderation_status = 'approved' 
        AND p.user_id IN (
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
      )
      -- User can see approved posts they are tagged in (using security definer function)
      OR (p.moderation_status = 'approved' AND public.is_user_tagged_in_post(auth.uid(), p.id))
      -- Admins and moderators can see all posts
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
);