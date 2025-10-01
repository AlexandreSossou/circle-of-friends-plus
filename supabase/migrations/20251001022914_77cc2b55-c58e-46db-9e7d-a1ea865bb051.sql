-- Add storage policies for group avatars

-- Allow anyone to view group avatars (public bucket)
CREATE POLICY "Public can view group avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'group-avatars');

-- Allow group admins to upload group avatars
CREATE POLICY "Group admins can upload group avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'group-avatars'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow group admins to update group avatars
CREATE POLICY "Group admins can update group avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'group-avatars'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow group admins to delete group avatars
CREATE POLICY "Group admins can delete group avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'group-avatars'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);