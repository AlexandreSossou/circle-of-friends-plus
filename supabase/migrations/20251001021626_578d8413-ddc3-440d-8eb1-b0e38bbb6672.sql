-- Create group_posts table for forum-style posts in groups
CREATE TABLE public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_post_id UUID REFERENCES public.group_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- Enable RLS
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

-- Members can view posts in groups they belong to
CREATE POLICY "Members can view group posts"
ON public.group_posts
FOR SELECT
USING (
  group_id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid()
  )
);

-- Members can create posts in groups they belong to
CREATE POLICY "Members can create group posts"
ON public.group_posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND group_id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid()
  )
);

-- Users can update their own posts
CREATE POLICY "Users can update their own group posts"
ON public.group_posts
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own group posts"
ON public.group_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Group admins can delete any post in their groups
CREATE POLICY "Group admins can delete group posts"
ON public.group_posts
FOR DELETE
USING (
  group_id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_group_posts_updated_at
BEFORE UPDATE ON public.group_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_group_posts_group_id ON public.group_posts(group_id);
CREATE INDEX idx_group_posts_parent_post_id ON public.group_posts(parent_post_id);
CREATE INDEX idx_group_posts_user_id ON public.group_posts(user_id);