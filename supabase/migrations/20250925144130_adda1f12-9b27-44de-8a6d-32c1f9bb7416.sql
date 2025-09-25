-- Add is_pinned column to posts table
ALTER TABLE public.posts 
ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- Create index for better performance when fetching pinned posts
CREATE INDEX idx_posts_is_pinned ON public.posts(is_pinned, created_at DESC);

-- Update RLS policy to allow admins to pin/unpin posts
CREATE POLICY "Admins can pin/unpin posts" 
ON public.posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::public.app_role));