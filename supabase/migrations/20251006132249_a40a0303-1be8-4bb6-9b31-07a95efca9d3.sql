-- Fix circular dependency between posts and post_tags policies
-- Drop the problematic policy on posts table
DROP POLICY IF EXISTS "Users can view approved posts they are tagged in" ON public.posts;

-- Recreate the policy using the security definer function we already have
CREATE POLICY "Users can view approved posts they are tagged in"
ON public.posts
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) 
  AND (moderation_status = 'approved')
  AND public.is_user_tagged_in_post(auth.uid(), id)
);