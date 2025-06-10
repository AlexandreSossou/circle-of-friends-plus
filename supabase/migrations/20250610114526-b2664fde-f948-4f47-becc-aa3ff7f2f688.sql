
-- Create a table to store post limit configurations
CREATE TABLE public.post_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_limit integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default configuration
INSERT INTO public.post_limits (daily_limit, is_active) VALUES (1, true);

-- Enable RLS on post_limits table
ALTER TABLE public.post_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for reading post limits (everyone can read)
CREATE POLICY "Anyone can view post limits" 
  ON public.post_limits 
  FOR SELECT 
  USING (true);

-- Create policy for updating post limits (only admins - we'll implement admin check later)
CREATE POLICY "Only admins can update post limits" 
  ON public.post_limits 
  FOR UPDATE 
  USING (true);

-- Create an index on posts table for efficient daily post counting
CREATE INDEX idx_posts_user_created_date ON public.posts (user_id, created_at);
