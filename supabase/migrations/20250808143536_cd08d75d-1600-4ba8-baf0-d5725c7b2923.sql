-- Create a table for chat moderation
CREATE TABLE public.chat_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  flagged_content TEXT NOT NULL,
  violation_type TEXT NOT NULL, -- 'abusive_language', 'dangerous_content', 'spam', etc.
  severity_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00 confidence score from AI
  moderator_reviewed BOOLEAN DEFAULT FALSE,
  moderator_id UUID,
  moderator_action TEXT, -- 'approved', 'removed', 'warned', 'banned'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for moderators
CREATE TABLE public.moderation_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderation_id UUID REFERENCES public.chat_moderation(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user warnings table
CREATE TABLE public.user_warnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moderation_id UUID REFERENCES public.chat_moderation(id) ON DELETE CASCADE,
  warning_message TEXT NOT NULL,
  warning_type TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_moderation
CREATE POLICY "Admins and moderators can view all moderation records"
ON public.chat_moderation
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "System can insert moderation records"
ON public.chat_moderation
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins and moderators can update moderation records"
ON public.chat_moderation
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- RLS Policies for moderation_notifications
CREATE POLICY "Users can view their own moderation notifications"
ON public.moderation_notifications
FOR SELECT
USING (auth.uid() = recipient_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "System can insert moderation notifications"
ON public.moderation_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.moderation_notifications
FOR UPDATE
USING (auth.uid() = recipient_id);

-- RLS Policies for user_warnings
CREATE POLICY "Users can view their own warnings"
ON public.user_warnings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user warnings"
ON public.user_warnings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can acknowledge their warnings"
ON public.user_warnings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_chat_moderation_user_id ON public.chat_moderation(user_id);
CREATE INDEX idx_chat_moderation_created_at ON public.chat_moderation(created_at);
CREATE INDEX idx_moderation_notifications_recipient ON public.moderation_notifications(recipient_id);
CREATE INDEX idx_user_warnings_user_id ON public.user_warnings(user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat_moderation
CREATE TRIGGER update_chat_moderation_updated_at
    BEFORE UPDATE ON public.chat_moderation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();