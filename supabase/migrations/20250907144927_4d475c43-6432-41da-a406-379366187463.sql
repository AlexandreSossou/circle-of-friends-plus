-- Create table for configurable local alert limits
CREATE TABLE public.local_alert_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gender TEXT NOT NULL UNIQUE,
  monthly_limit INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.local_alert_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can manage local alert limits
CREATE POLICY "Only admins can view local alert limits" 
ON public.local_alert_limits 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update local alert limits" 
ON public.local_alert_limits 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert local alert limits" 
ON public.local_alert_limits 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete local alert limits" 
ON public.local_alert_limits 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default limits based on current hardcoded logic
INSERT INTO public.local_alert_limits (gender, monthly_limit, is_active) VALUES
('male', 1, true),
('man', 1, true),
('female', 0, true), -- 0 means unlimited
('woman', 0, true),
('trans man', 1, true),
('trans woman', 0, true),
('non-binary', 0, true),
('genderfluid', 0, true),
('agender', 0, true),
('genderqueer', 0, true),
('trav (male cross-dresser)', 1, true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_local_alert_limits_updated_at
BEFORE UPDATE ON public.local_alert_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();