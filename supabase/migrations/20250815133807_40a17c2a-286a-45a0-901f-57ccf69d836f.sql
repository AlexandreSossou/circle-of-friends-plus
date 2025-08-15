-- Insert some sample announcements for testing
INSERT INTO public.announcements (user_id, title, description, location, category, visibility) VALUES
-- Get the first user ID from profiles table for testing
((SELECT id FROM public.profiles LIMIT 1), 'Looking for Tennis Partner', 'Hey! Looking for someone to play tennis with on weekends. I play at intermediate level.', 'New York, NY', 'sports', 'public'),
((SELECT id FROM public.profiles LIMIT 1), 'Football Group Needed', 'Starting a weekend football group in Central Park. All skill levels welcome!', 'New York', 'sports', 'public'),
((SELECT id FROM public.profiles LIMIT 1), 'Book Club Starting Soon', 'Anyone interested in joining a monthly book club? We meet at local cafes.', 'NYC', 'social', 'public');