-- Create news_articles table
CREATE TABLE public.news_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  image_url text,
  source text NOT NULL DEFAULT 'Admin',
  source_url text,
  category text DEFAULT 'general',
  author_id uuid NOT NULL,
  author_name text,
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published news articles" 
ON public.news_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins and moderators can create news articles" 
ON public.news_articles 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Admins and moderators can update news articles" 
ON public.news_articles 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Admins and moderators can delete news articles" 
ON public.news_articles 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_news_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_news_articles_updated_at();