-- Recreate the missing triggers for user signup
-- These are needed to automatically create profiles and assign roles when users sign up

-- Create trigger to automatically create profile when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to automatically assign user role when new user signs up  
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();