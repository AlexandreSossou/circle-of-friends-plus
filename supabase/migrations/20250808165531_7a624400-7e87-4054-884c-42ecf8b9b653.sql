-- CRITICAL SECURITY FIXES

-- 1. Fix function search paths for security
ALTER FUNCTION public.update_news_articles_updated_at() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.get_user_role(_user_id uuid) SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.handle_new_user_role() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = '';

-- 2. Fix overly permissive RLS policies - Replace "true" with proper user validation

-- Fix chat_moderation table - only allow system and admin/moderator access
DROP POLICY IF EXISTS "System can insert moderation records" ON public.chat_moderation;
CREATE POLICY "System and moderators can insert moderation records"
ON public.chat_moderation
FOR INSERT
WITH CHECK (
  -- Allow system service role OR admin/moderator role
  (current_setting('role') = 'service_role') OR 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
);

-- Fix moderation_notifications - restrict system inserts to authenticated context
DROP POLICY IF EXISTS "System can insert moderation notifications" ON public.moderation_notifications;
CREATE POLICY "Authorized system can insert moderation notifications"
ON public.moderation_notifications
FOR INSERT
WITH CHECK (
  -- Allow only when there's a valid auth context or service role
  (current_setting('role') = 'service_role') OR 
  (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)))
);

-- Fix user_warnings - restrict system inserts
DROP POLICY IF EXISTS "System can insert user warnings" ON public.user_warnings;
CREATE POLICY "Authorized system can insert user warnings"
ON public.user_warnings
FOR INSERT
WITH CHECK (
  -- Allow only service role or admin/moderator
  (current_setting('role') = 'service_role') OR 
  (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)))
);

-- 3. Restrict profile access - remove overly permissive read access
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;

-- Create more restrictive profile access policies
CREATE POLICY "Users can view public profile data"
ON public.profiles
FOR SELECT
USING (
  -- Allow viewing own profile
  (auth.uid() = id) OR 
  -- Allow admins/moderators to view all profiles
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)) OR
  -- Allow viewing basic info for friend connections
  (id IN (
    SELECT CASE 
      WHEN user_id = auth.uid() THEN friend_id 
      WHEN friend_id = auth.uid() THEN user_id 
    END
    FROM public.friends 
    WHERE status = 'accepted' AND (user_id = auth.uid() OR friend_id = auth.uid())
  ))
);

-- 4. Add admin self-modification prevention function
CREATE OR REPLACE FUNCTION public.prevent_admin_self_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent admins from modifying their own roles
  IF NEW.user_id = auth.uid() AND OLD.role = 'admin'::app_role THEN
    RAISE EXCEPTION 'Administrators cannot modify their own role';
  END IF;
  
  -- Prevent non-admins from modifying admin roles
  IF NEW.role = 'admin'::app_role AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can assign admin roles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger to prevent admin self-modification
DROP TRIGGER IF EXISTS prevent_admin_self_modification_trigger ON public.user_roles;
CREATE TRIGGER prevent_admin_self_modification_trigger
  BEFORE UPDATE OR INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_self_modification();

-- 5. Add input validation function for content moderation
CREATE OR REPLACE FUNCTION public.validate_content_input(content_text TEXT)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. Add constraint to posts table for content validation
ALTER TABLE public.posts ADD CONSTRAINT posts_content_valid 
CHECK (public.validate_content_input(content));

-- 7. Add constraint to comments table for content validation  
ALTER TABLE public.comments ADD CONSTRAINT comments_content_valid 
CHECK (public.validate_content_input(content));

-- 8. Create audit function for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role change in admin_activities
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
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create audit trigger for role changes
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();