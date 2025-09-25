-- Add moderation status to posts table
ALTER TABLE public.posts 
ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'pending';

-- Create check constraint for valid moderation statuses
ALTER TABLE public.posts 
ADD CONSTRAINT posts_moderation_status_check 
CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Add moderated_by and moderated_at columns for tracking
ALTER TABLE public.posts 
ADD COLUMN moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;

-- Update existing posts to be approved (so they remain visible)
UPDATE public.posts SET moderation_status = 'approved' WHERE moderation_status = 'pending';

-- Update RLS policies to only show approved posts to regular users
DROP POLICY IF EXISTS "Authenticated users can view global posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view friends posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view posts they are tagged in" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;

-- New RLS policies with moderation
CREATE POLICY "Users can view their own posts regardless of status" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can view all posts" 
ON public.posts 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Users can view approved global posts" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  is_global = true AND 
  moderation_status = 'approved'
);

CREATE POLICY "Users can view approved friends posts" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  moderation_status = 'approved' AND
  user_id IN (
    SELECT
      CASE
        WHEN friends.user_id = auth.uid() THEN friends.friend_id
        WHEN friends.friend_id = auth.uid() THEN friends.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM friends
    WHERE friends.status = 'accepted'
      AND (friends.user_id = auth.uid() OR friends.friend_id = auth.uid())
  )
);

CREATE POLICY "Users can view approved posts they are tagged in" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  moderation_status = 'approved' AND
  id IN (
    SELECT post_tags.post_id
    FROM post_tags
    WHERE post_tags.tagged_user_id = auth.uid()
  )
);

-- Allow admins and moderators to update moderation status
CREATE POLICY "Admins and moderators can update post moderation" 
ON public.posts 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);