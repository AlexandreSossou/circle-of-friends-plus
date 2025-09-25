-- Add RLS policy to allow tagged users to view posts they're tagged in
CREATE POLICY "Users can view posts they are tagged in" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT post_id 
    FROM post_tags 
    WHERE tagged_user_id = auth.uid()
  )
);