-- Drop the overly restrictive update policy that blocks all updates
DROP POLICY IF EXISTS "Block message updates" ON messages;

-- Create a new policy that allows recipients to mark messages as read
CREATE POLICY "Recipients can mark messages as read"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);