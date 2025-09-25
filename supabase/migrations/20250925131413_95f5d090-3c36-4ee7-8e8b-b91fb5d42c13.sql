-- Add RLS policies for news articles management
CREATE POLICY "Admins and moderators can insert news articles" 
ON public.news_articles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins and moderators can update news articles" 
ON public.news_articles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins and moderators can delete news articles" 
ON public.news_articles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins and moderators can view all news articles" 
ON public.news_articles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Add missing columns for video support
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'article',
ADD COLUMN IF NOT EXISTS duration integer;