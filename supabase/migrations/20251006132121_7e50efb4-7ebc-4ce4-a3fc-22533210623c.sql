-- Fix infinite recursion by removing circular dependency
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view post tags on accessible posts" ON public.post_tags;

-- Create new policy WITHOUT the circular tagged check
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
      -- Admins and moderators can see all posts
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
  -- OR user is tagged in the post (check directly without recursion)
  OR tagged_user_id = auth.uid()
);