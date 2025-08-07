-- Add policy to allow admins and moderators to delete any post
CREATE POLICY "Admins and moderators can delete any post"
ON public.posts
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);