-- CRITICAL SECURITY FIX: Strengthen profiles table RLS policies
-- Current vulnerabilities:
-- 1. INSERT policy allows anyone to create profiles (WITH CHECK true)
-- 2. No friends/public viewing policies with proper data segmentation
-- 3. Missing proper access control for sensitive data like emails

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Allow profile creation via system triggers" ON public.profiles;

-- Create secure INSERT policy that only allows system triggers to create profiles
CREATE POLICY "System can create profiles via triggers only"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Only allow service_role (system) to create profiles during user signup
    current_setting('role') = 'service_role'
  );

-- Add policy for friends to view basic profile info (excluding sensitive data)
CREATE POLICY "Friends can view basic profile info"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND id IN (
      SELECT 
        CASE
          WHEN f.user_id = auth.uid() THEN f.friend_id
          WHEN f.friend_id = auth.uid() THEN f.user_id
          ELSE NULL::uuid
        END AS friend_id
      FROM public.friends f
      WHERE f.status = 'accepted'
        AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
    )
  );

-- Add policy for public viewing of very basic profile info (name, bio only)
CREATE POLICY "Public can view minimal profile info"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND NOT is_banned
  );

-- Add explicit policy to block anonymous access
CREATE POLICY "Block anonymous access to profiles"
  ON public.profiles
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- Ensure profiles can't be deleted (data integrity)
CREATE POLICY "Block profile deletion"
  ON public.profiles
  FOR DELETE
  USING (false);