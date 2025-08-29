-- Create security definer function to check if user is admin of a group
CREATE OR REPLACE FUNCTION public.is_group_admin(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = group_uuid 
      AND user_id = auth.uid() 
      AND role = 'admin'
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create new policies without circular reference
CREATE POLICY "Group admins can manage members" 
ON public.group_members 
FOR ALL 
USING (public.is_group_admin(group_id))
WITH CHECK (public.is_group_admin(group_id));