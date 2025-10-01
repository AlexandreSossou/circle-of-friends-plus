-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;

-- Create a secure policy that restricts comment visibility based on post visibility
CREATE POLICY "Users can view comments on accessible posts"
ON public.comments
FOR SELECT
USING (
  post_id IN (
    SELECT id FROM public.posts
    WHERE 
      -- User owns the post
      user_id = auth.uid()
      -- Or it's an approved global post
      OR (is_global = true AND moderation_status = 'approved')
      -- Or it's an approved post from a friend
      OR (
        moderation_status = 'approved' 
        AND user_id IN (
          SELECT CASE
            WHEN f.user_id = auth.uid() THEN f.friend_id
            WHEN f.friend_id = auth.uid() THEN f.user_id
            ELSE NULL::uuid
          END AS friend_id
          FROM public.friends f
          WHERE f.status = 'accepted'
            AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
        )
      )
      -- Or it's an approved post where user is tagged
      OR (
        moderation_status = 'approved'
        AND id IN (
          SELECT post_id FROM public.post_tags
          WHERE tagged_user_id = auth.uid()
        )
      )
      -- Or user is admin/moderator
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
);