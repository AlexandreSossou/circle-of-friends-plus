-- Check if triggers exist and create them if they don't
DO $$
BEGIN
    -- Create trigger for profile creation if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created_01_profile'
    ) THEN
        CREATE TRIGGER on_auth_user_created_01_profile
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;

    -- Create trigger for role assignment if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created_02_role'
    ) THEN
        CREATE TRIGGER on_auth_user_created_02_role
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
    END IF;
END $$;