-- Add foreign key constraint from group_join_requests.user_id to profiles.id
ALTER TABLE public.group_join_requests
ADD CONSTRAINT group_join_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;