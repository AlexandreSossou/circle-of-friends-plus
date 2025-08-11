-- Fix email privacy vulnerability by restricting email field access
-- Create a security definer function to safely expose profile data without emails for non-owners

-- Create a view that excludes sensitive data for non-owners
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  created_at,
  updated_at,
  age,
  partner_id,
  partners,
  private_partner_id,
  private_partners,
  CASE 
    -- Only show ban status to admins/moderators or the user themselves
    WHEN auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) THEN is_banned
    ELSE false
  END as is_banned,
  CASE 
    WHEN auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) THEN banned_until
    ELSE NULL
  END as banned_until,
  CASE 
    WHEN auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) THEN banned_by
    ELSE NULL
  END as banned_by,
  username,
  full_name,
  avatar_url,
  bio,
  location,
  gender,
  marital_status,
  private_marital_status,
  looking_for,
  CASE 
    WHEN auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) THEN banned_reason
    ELSE NULL
  END as banned_reason,
  -- Email is only visible to the profile owner and admins
  CASE 
    WHEN auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role) THEN email
    ELSE NULL
  END as email
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.safe_profiles SET (security_invoker = true);

-- Update the profiles table RLS policy to be more restrictive
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view public profile data" ON public.profiles;

-- Create new restrictive policy that only allows admins full access
CREATE POLICY "Admins can view all profile data"
  ON public.profiles 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to view their own full profile
CREATE POLICY "Users can view their own full profile"
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create a new policy for the safe_profiles view
CREATE POLICY "Users can view safe profile data"
  ON public.profiles 
  FOR SELECT 
  USING (
    -- Allow access for the safe_profiles view by checking if user is friend or moderator
    id IN (
      SELECT 
        CASE
          WHEN friends.user_id = auth.uid() THEN friends.friend_id
          WHEN friends.friend_id = auth.uid() THEN friends.user_id
          ELSE NULL::uuid
        END AS friend_id
      FROM public.friends
      WHERE friends.status = 'accepted'
        AND (friends.user_id = auth.uid() OR friends.friend_id = auth.uid())
    )
    OR has_role(auth.uid(), 'moderator'::app_role)
  );

-- Grant access to the safe_profiles view
GRANT SELECT ON public.safe_profiles TO authenticated;