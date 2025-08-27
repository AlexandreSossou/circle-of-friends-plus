-- Add expiration time to announcements table
ALTER TABLE public.announcements 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '12 hours');

-- Create index for efficient cleanup queries
CREATE INDEX idx_announcements_expires_at ON public.announcements(expires_at);

-- Add check constraint to ensure expires_at is reasonable (max 12 hours from creation)
ALTER TABLE public.announcements 
ADD CONSTRAINT check_expires_at_max_12_hours 
CHECK (expires_at <= created_at + interval '12 hours');

-- Add check constraint to ensure expires_at is at least 30 minutes from creation
ALTER TABLE public.announcements 
ADD CONSTRAINT check_expires_at_min_30_minutes 
CHECK (expires_at >= created_at + interval '30 minutes');