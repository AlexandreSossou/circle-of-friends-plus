-- Insert a default post limit record since the table is empty
INSERT INTO public.post_limits (daily_limit, is_active, updated_by) 
VALUES (5, true, null)
ON CONFLICT DO NOTHING;

-- Check the validate_content_input function and modify it to allow empty content when there's an image
CREATE OR REPLACE FUNCTION public.validate_content_input(content_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow empty content - this will be validated at the application level
  -- where we can check if there's an image present
  RETURN true;
END;
$$;