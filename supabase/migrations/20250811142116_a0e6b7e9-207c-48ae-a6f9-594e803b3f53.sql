-- Fix the audit_role_changes function to handle null admin_id during signup
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only log if this is not a system/signup operation (when auth.uid() is null)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.admin_activities (
      admin_id,
      action,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'role_assigned'
        WHEN TG_OP = 'UPDATE' THEN 'role_updated'
        WHEN TG_OP = 'DELETE' THEN 'role_removed'
      END,
      'user_role',
      COALESCE(NEW.user_id, OLD.user_id),
      jsonb_build_object(
        'old_role', CASE WHEN TG_OP != 'INSERT' THEN OLD.role ELSE NULL END,
        'new_role', CASE WHEN TG_OP != 'DELETE' THEN NEW.role ELSE NULL END,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;