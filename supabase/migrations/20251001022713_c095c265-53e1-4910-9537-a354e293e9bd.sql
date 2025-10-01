-- Drop and recreate the update policy with proper WITH CHECK
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;

CREATE POLICY "Group admins can update groups"
ON public.groups
FOR UPDATE
USING (
  id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);