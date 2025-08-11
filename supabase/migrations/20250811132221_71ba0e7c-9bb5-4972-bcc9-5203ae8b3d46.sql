-- Ensure the triggers exist for user signup
-- The CASCADE drop might have removed them

-- Drop any existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created_01_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_02_role ON auth.users;

-- Recreate the triggers
CREATE TRIGGER on_auth_user_created_01_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_02_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();