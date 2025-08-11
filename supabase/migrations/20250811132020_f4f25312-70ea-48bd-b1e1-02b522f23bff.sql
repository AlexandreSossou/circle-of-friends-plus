-- Now recreate the user_roles RLS policies

CREATE POLICY "Admins can assign roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());