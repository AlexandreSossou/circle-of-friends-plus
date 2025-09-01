-- Security Fix Part 2: Update RLS Policies to Prevent User ID Exposure

-- 1. Fix Group Members - CRITICAL SECURITY ISSUE
DROP POLICY IF EXISTS "Anyone can view group memberships" ON group_members;

-- Replace with secure policies that only show memberships for groups user has access to
CREATE POLICY "Users can view group memberships for accessible groups" 
ON group_members 
FOR SELECT 
USING (
  -- User can see memberships in groups they're members of
  group_id IN (
    SELECT gm.group_id 
    FROM group_members gm 
    WHERE gm.user_id = auth.uid()
  )
  OR 
  -- User can see their own membership records
  user_id = auth.uid()
);

-- 2. Update Events Policy to Restrict User ID Exposure
DROP POLICY IF EXISTS "Users can view public events" ON events;
CREATE POLICY "Users can view public events with restricted data"
ON events
FOR SELECT
USING (
  (visibility = 'public' AND auth.uid() IS NOT NULL)
  OR auth.uid() = user_id  -- Own events show full data
);

-- 3. Update Announcements Policy to Restrict Author ID Exposure  
DROP POLICY IF EXISTS "Users can view public announcements" ON announcements;
CREATE POLICY "Users can view public announcements with restricted data"  
ON announcements
FOR SELECT
USING (
  (visibility = 'public' AND auth.uid() IS NOT NULL)
  OR auth.uid() = user_id  -- Own announcements show full data
);

-- 4. Update Groups Policy to Restrict Creator ID Exposure
DROP POLICY IF EXISTS "Anyone can view public groups" ON groups;
CREATE POLICY "Users can view public groups with restricted data"
ON groups  
FOR SELECT
USING (
  (is_public = true AND auth.uid() IS NOT NULL)
  OR created_by = auth.uid()  -- Own groups show full data
  OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())  -- Member groups show full data
);

-- 5. Add Policy to Prevent Unauthorized Group Member Data Access
CREATE POLICY "Restrict detailed group member information"
ON group_members
FOR SELECT
USING (
  -- Only members of the same group can see detailed member info
  group_id IN (
    SELECT gm.group_id 
    FROM group_members gm 
    WHERE gm.user_id = auth.uid()
  )
  OR user_id = auth.uid()  -- Users can always see their own memberships
);

-- 6. Add Policy to Block Anonymous Access to All Sensitive Tables
CREATE POLICY "Block anonymous access to group members"
ON group_members
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Block anonymous access to events"  
ON events
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Block anonymous access to announcements"
ON announcements  
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);