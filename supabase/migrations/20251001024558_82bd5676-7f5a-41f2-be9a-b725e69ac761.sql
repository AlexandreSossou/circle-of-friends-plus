-- Drop the restrictive delete policy and create a better one that allows both users to leave and admins to remove members
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Create a new delete policy that allows users to leave AND admins to remove members
CREATE POLICY "Users can leave groups or admins can remove members"
ON public.group_members
FOR DELETE
USING (
  auth.uid() = user_id 
  OR is_group_admin(group_id)
);