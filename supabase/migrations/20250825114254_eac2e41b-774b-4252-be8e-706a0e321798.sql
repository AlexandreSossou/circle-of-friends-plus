-- CRITICAL SECURITY FIXES - Phase 1

-- 1. Fix Role Management Privilege Escalation
-- Add function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_admin_self_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow initial admin setup when no admin exists yet
  IF NEW.role = 'admin'::public.app_role THEN
    -- Check if any admin exists
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role) THEN
      -- First admin setup - allow it
      RETURN NEW;
    END IF;
    
    -- If admins exist, only allow admin users to assign admin roles
    IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Only administrators can assign admin roles';
    END IF;
  END IF;
  
  -- Prevent admins from modifying their own roles
  IF NEW.user_id = auth.uid() AND OLD.role = 'admin'::public.app_role THEN
    RAISE EXCEPTION 'Administrators cannot modify their own role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger to prevent privilege escalation
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.user_roles;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_self_modification();

-- Add audit trail function for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create audit trigger for role changes
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.user_roles;
CREATE TRIGGER audit_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 2. Secure Chat Moderation Table
-- Add RLS policies for chat_moderation table

-- Policy for admins and moderators to view moderation records
CREATE POLICY "Admins and moderators can view chat moderation"
ON public.chat_moderation
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_role(auth.uid(), 'moderator'::public.app_role)
);

-- Policy for system to insert moderation records (via edge functions)
CREATE POLICY "System can insert chat moderation records"
ON public.chat_moderation
FOR INSERT
WITH CHECK (true); -- Edge functions run with service role

-- Policy for moderators to update moderation records
CREATE POLICY "Moderators can update chat moderation"
ON public.chat_moderation
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_role(auth.uid(), 'moderator'::public.app_role)
);

-- Policy for admins to delete moderation records
CREATE POLICY "Admins can delete chat moderation"
ON public.chat_moderation
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. Fix Moderation Notifications Access
-- Add SELECT policy for moderation_notifications

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own moderation notifications"
ON public.moderation_notifications
FOR SELECT
USING (auth.uid() = recipient_id);

-- Policy for admins and moderators to view all notifications
CREATE POLICY "Admins and moderators can view all notifications"
ON public.moderation_notifications
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_role(auth.uid(), 'moderator'::public.app_role)
);

-- Policy for system to insert notifications (via edge functions)
CREATE POLICY "System can insert moderation notifications"
ON public.moderation_notifications
FOR INSERT
WITH CHECK (true); -- Edge functions run with service role