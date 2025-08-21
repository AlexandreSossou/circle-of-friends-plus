-- Enable Row Level Security on admin_activities table
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin activities
CREATE POLICY "Only admins can view admin activities"
ON public.admin_activities
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can insert admin activities (defensive policy)
CREATE POLICY "Only admins can create admin activities"
ON public.admin_activities
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can update admin activities (if needed)
CREATE POLICY "Only admins can update admin activities"
ON public.admin_activities
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only admins can delete admin activities (if needed)
CREATE POLICY "Only admins can delete admin activities"
ON public.admin_activities
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));