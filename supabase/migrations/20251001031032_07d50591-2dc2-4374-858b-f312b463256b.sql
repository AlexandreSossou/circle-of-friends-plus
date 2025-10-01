-- Drop the overly permissive likes SELECT policy
DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;

-- Create a secure policy that only shows likes on posts the user can see
CREATE POLICY "Users can view likes on accessible posts"
ON public.likes
FOR SELECT
USING (
  post_id IN (
    SELECT id FROM public.posts
    WHERE 
      -- User's own posts
      user_id = auth.uid()
      -- Approved global posts
      OR (is_global = true AND moderation_status = 'approved')
      -- Approved posts from friends
      OR (
        moderation_status = 'approved' 
        AND user_id IN (
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
      -- Posts user is tagged in
      OR (
        moderation_status = 'approved'
        AND id IN (
          SELECT post_id FROM public.post_tags 
          WHERE tagged_user_id = auth.uid()
        )
      )
      -- Admins and moderators can see all
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
);