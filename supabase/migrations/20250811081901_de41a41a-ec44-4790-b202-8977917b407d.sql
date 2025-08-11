-- Fix critical travel data exposure vulnerability
-- Currently "Users can view all travels" policy allows ANYONE to see all travel plans
-- This is extremely dangerous for user safety

-- Drop the dangerously permissive policy
DROP POLICY IF EXISTS "Users can view all travels" ON public.travels;

-- Create secure policies that protect travel data
-- Only allow users to see their own travel plans
CREATE POLICY "Users can view their own travel plans"
  ON public.travels 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow friends to see each other's travel plans
CREATE POLICY "Friends can view each other's travel plans"
  ON public.travels 
  FOR SELECT 
  USING (
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
  );

-- Allow admins and moderators to view travel plans for moderation
CREATE POLICY "Admins and moderators can view travel plans for moderation"
  ON public.travels 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'moderator'::app_role)
  );