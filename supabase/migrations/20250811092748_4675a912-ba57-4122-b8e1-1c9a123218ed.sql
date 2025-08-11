-- Fix critical posts exposure vulnerability
-- Currently "Users can view all posts" policy with "true" condition allows ANYONE including
-- anonymous users to see ALL posts without authentication - extremely dangerous!

-- Drop the dangerously permissive policy
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;

-- Create secure policies that require authentication and proper access control

-- Users can view their own posts
CREATE POLICY "Users can view their own posts"
  ON public.posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can view posts from their friends
CREATE POLICY "Users can view friends posts"
  ON public.posts 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND (
      user_id IN (
        SELECT 
          CASE
            WHEN friends.user_id = auth.uid() THEN friends.friend_id
            WHEN friends.friend_id = auth.uid() THEN friends.user_id
            ELSE NULL::uuid
          END AS friend_id
        FROM public.friends
        WHERE friends.status = 'accepted'
          AND (friends.user_id = auth.uid() OR friends.friend_id = auth.uid())
      )
    )
  );

-- Global posts can be viewed by authenticated users only
CREATE POLICY "Authenticated users can view global posts"
  ON public.posts 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND is_global = true
  );

-- Allow admins and moderators to view all posts for moderation
CREATE POLICY "Admins and moderators can view all posts for moderation"
  ON public.posts 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'moderator'::app_role)
  );