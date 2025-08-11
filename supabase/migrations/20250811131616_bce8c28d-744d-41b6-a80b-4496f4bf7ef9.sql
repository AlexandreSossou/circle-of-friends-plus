-- Let's check if both triggers are working correctly by ordering them
-- Sometimes the order of trigger execution matters

-- Drop and recreate triggers in a specific order
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Recreate triggers with proper naming to ensure correct execution order
-- Profile creation should happen first, then role assignment
CREATE TRIGGER on_auth_user_created_01_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_02_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();