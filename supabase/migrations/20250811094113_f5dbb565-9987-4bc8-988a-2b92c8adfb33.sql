-- Strengthen message security by explicitly blocking anonymous access
-- Current policies only apply to 'authenticated' role, but we should explicitly deny anonymous access

-- Add explicit policy to deny all anonymous access to messages
CREATE POLICY "Block anonymous access to messages"
  ON public.messages 
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Add explicit policy to deny public role access to messages
CREATE POLICY "Block public role access to messages"
  ON public.messages 
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Ensure our existing policies are correctly restrictive
-- Verify that all message access requires authentication and proper sender/recipient verification

-- The existing policies are:
-- 1. "Users can insert their own messages" - INSERT with auth.uid() = sender_id
-- 2. "Users can view messages they sent or received" - SELECT with auth.uid() = sender_id OR recipient_id

-- These are secure but let's make them even more explicit about authentication requirements

-- Drop and recreate the SELECT policy with stronger authentication checks
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;

CREATE POLICY "Authenticated users can view their own messages only"
  ON public.messages 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IS NOT NULL 
    AND (auth.uid() = sender_id OR auth.uid() = recipient_id)
  );

-- Drop and recreate the INSERT policy with stronger authentication checks  
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

CREATE POLICY "Authenticated users can send messages as themselves only"
  ON public.messages 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = sender_id
  );

-- Add explicit UPDATE/DELETE restrictions (currently users can't update/delete messages)
-- This ensures messages remain immutable for security

CREATE POLICY "Block message updates"
  ON public.messages 
  FOR UPDATE 
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block message deletions"
  ON public.messages 
  FOR DELETE 
  TO authenticated
  USING (false);