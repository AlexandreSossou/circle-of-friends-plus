-- Add foreign key constraint from group_posts.user_id to profiles.id
ALTER TABLE public.group_posts
ADD CONSTRAINT group_posts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;