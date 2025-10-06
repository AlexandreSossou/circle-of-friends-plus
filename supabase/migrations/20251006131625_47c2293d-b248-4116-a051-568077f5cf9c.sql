-- Security Fix: Restrict post_tags visibility to authorized users only
-- Drop the overly permissive policy that allows anyone to see all tags
DROP POLICY IF EXISTS "Users can view all post tags" ON public.post_tags;

-- Create a new secure policy that only shows tags on posts the user can view
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
      -- User can see approved posts they are tagged in
      OR (
        p.moderation_status = 'approved' 
        AND p.id IN (
          SELECT pt.post_id
          FROM public.post_tags pt
          WHERE pt.tagged_user_id = auth.uid()
        )
      )
      -- Admins and moderators can see all posts
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
);

-- Add comment documenting the security approach
COMMENT ON TABLE public.post_tags IS 'Post tagging table. Tags are only visible to users who have permission to view the associated post, preventing exposure of social connections to unauthorized users.';