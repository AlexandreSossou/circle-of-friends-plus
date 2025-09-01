-- Fix remaining function search path security issue

-- Check and fix all existing functions that need secure search path
CREATE OR REPLACE FUNCTION public.validate_content_input(content_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Basic input validation
  IF content_text IS NULL OR LENGTH(TRIM(content_text)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for excessively long content
  IF LENGTH(content_text) > 10000 THEN
    RETURN FALSE;
  END IF;
  
  -- Add more validation rules as needed
  RETURN TRUE;
END;
$$;