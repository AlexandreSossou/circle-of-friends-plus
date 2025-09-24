-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;
DROP POLICY IF EXISTS "Users can view public groups with restricted data" ON public.groups;
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;
DROP POLICY IF EXISTS "Public can view public group basic membership" ON public.group_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_user_group_member_safe(user_uuid uuid, group_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.user_id = user_uuid AND gm.group_id = group_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_group_memberships(user_uuid uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gm.group_id FROM group_members gm WHERE gm.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_group_public(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_public FROM groups WHERE id = group_uuid;
$$;

-- Recreate groups policies with security definer functions
CREATE POLICY "Users can view groups they're members of"
ON public.groups
FOR SELECT
USING (id IN (SELECT group_id FROM public.get_user_group_memberships(auth.uid())));

CREATE POLICY "Users can view public groups with restricted data"
ON public.groups
FOR SELECT
USING (
  (is_public = true AND auth.uid() IS NOT NULL) OR 
  (created_by = auth.uid()) OR 
  (id IN (SELECT group_id FROM public.get_user_group_memberships(auth.uid())))
);

-- Recreate group_members policies with security definer functions
CREATE POLICY "Group members can view other members"
ON public.group_members
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) AND 
  public.is_user_group_member_safe(auth.uid(), group_id)
);

CREATE POLICY "Public can view public group basic membership"
ON public.group_members
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) AND 
  public.is_group_public(group_id)
);

-- Update the existing is_user_group_member function to use the safe version
DROP FUNCTION IF EXISTS public.is_user_group_member(uuid, uuid);
CREATE OR REPLACE FUNCTION public.is_user_group_member(user_uuid uuid, group_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_user_group_member_safe(user_uuid, group_uuid);
$$;