-- Fix Infinite Recursion in Group Members Policies

-- Drop problematic policies first
DROP POLICY IF EXISTS "Users can view group memberships for accessible groups" ON group_members;
DROP POLICY IF EXISTS "Public can view limited group membership data" ON group_members;
DROP POLICY IF EXISTS "Restrict detailed group member information" ON group_members;
DROP POLICY IF EXISTS "Block anonymous access to group members" ON group_members;

-- Create a security definer function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_user_group_member(user_uuid uuid, group_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.user_id = user_uuid AND gm.group_id = group_uuid
  );
$$;

-- Create safe group membership policies
CREATE POLICY "Users can view own group memberships"
ON group_members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Group members can view other members"
ON group_members
FOR SELECT  
USING (
  auth.uid() IS NOT NULL 
  AND public.is_user_group_member(auth.uid(), group_id)
);

CREATE POLICY "Public can view public group basic membership"
ON group_members
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND group_id IN (SELECT id FROM groups WHERE is_public = true)
);

-- Block anonymous access
CREATE POLICY "Block anonymous group member access"
ON group_members
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);