-- Create announcements table for regional announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Users can view public announcements" 
ON public.announcements 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Users can view their own announcements" 
ON public.announcements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Friends can view friends-only announcements" 
ON public.announcements 
FOR SELECT 
USING (
  visibility = 'friends' AND user_id IN (
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

CREATE POLICY "Users can create their own announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcements" 
ON public.announcements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own announcements" 
ON public.announcements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();