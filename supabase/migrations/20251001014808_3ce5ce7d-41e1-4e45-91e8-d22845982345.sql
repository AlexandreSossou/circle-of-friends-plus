-- Create albums table
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  allowed_users UUID[] DEFAULT '{}',
  is_photo_safe BOOLEAN NOT NULL DEFAULT false,
  visible_on_public_profile BOOLEAN NOT NULL DEFAULT true,
  visible_on_private_profile BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.photo_albums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_albums
CREATE POLICY "Users can view their own albums"
  ON public.photo_albums FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public albums of others"
  ON public.photo_albums FOR SELECT
  USING (
    is_private = false 
    AND NOT is_photo_safe
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view private albums they have access to"
  ON public.photo_albums FOR SELECT
  USING (
    is_private = true 
    AND NOT is_photo_safe
    AND auth.uid() = ANY(allowed_users)
  );

CREATE POLICY "Users can create their own albums"
  ON public.photo_albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
  ON public.photo_albums FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
  ON public.photo_albums FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for photos
CREATE POLICY "Users can view their own photos"
  ON public.photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view photos from accessible albums"
  ON public.photos FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM public.photo_albums
      WHERE (
        -- Own albums
        user_id = auth.uid()
        -- Public albums
        OR (is_private = false AND NOT is_photo_safe)
        -- Private albums with access
        OR (is_private = true AND NOT is_photo_safe AND auth.uid() = ANY(allowed_users))
      )
    )
  );

CREATE POLICY "Users can create photos in their own albums"
  ON public.photos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND album_id IN (SELECT id FROM public.photo_albums WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own photos"
  ON public.photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON public.photos FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for photo_albums
CREATE TRIGGER update_photo_albums_updated_at
  BEFORE UPDATE ON public.photo_albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for photos
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default "Photo Safe" album for existing users
INSERT INTO public.photo_albums (user_id, name, is_private, is_photo_safe, visible_on_public_profile, visible_on_private_profile)
SELECT id, 'Photo Safe', true, true, false, false
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.photo_albums WHERE is_photo_safe = true)
ON CONFLICT DO NOTHING;