-- Create table for storing post tags
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  tagged_user_id UUID NOT NULL,
  tagged_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tagged_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for post tags
CREATE POLICY "Users can view all post tags" 
ON public.post_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create post tags when creating posts" 
ON public.post_tags 
FOR INSERT 
WITH CHECK (auth.uid() = tagged_by_user_id);

CREATE POLICY "Users can delete tags from their own posts" 
ON public.post_tags 
FOR DELETE 
USING (auth.uid() = tagged_by_user_id);