-- Create image consent table to track consent status for tagged users in images
CREATE TABLE public.image_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  tagged_user_id UUID NOT NULL,
  tagged_by_user_id UUID NOT NULL,
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tagged_user_id)
);

-- Enable RLS
ALTER TABLE public.image_consent ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view consent requests involving them"
ON public.image_consent
FOR SELECT
USING (auth.uid() = tagged_user_id OR auth.uid() = tagged_by_user_id);

CREATE POLICY "Users can create consent requests when posting"
ON public.image_consent
FOR INSERT
WITH CHECK (auth.uid() = tagged_by_user_id);

CREATE POLICY "Tagged users can update their own consent"
ON public.image_consent
FOR UPDATE
USING (auth.uid() = tagged_user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_image_consent_updated_at
BEFORE UPDATE ON public.image_consent
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notifications table for image consent
CREATE TABLE public.image_consent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consent_id UUID NOT NULL REFERENCES public.image_consent(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_consent_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own consent notifications"
ON public.image_consent_notifications
FOR SELECT
USING (auth.uid() = recipient_id);

CREATE POLICY "Users can create consent notifications"
ON public.image_consent_notifications
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own notifications"
ON public.image_consent_notifications
FOR UPDATE
USING (auth.uid() = recipient_id);