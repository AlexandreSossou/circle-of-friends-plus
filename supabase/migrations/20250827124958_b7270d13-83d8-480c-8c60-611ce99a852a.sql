-- Add expiration time to announcements table (without constraints first)
ALTER TABLE public.announcements 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing announcements to expire 12 hours from their creation time
UPDATE public.announcements 
SET expires_at = created_at + interval '12 hours'
WHERE expires_at IS NULL;

-- Now make the column NOT NULL with a default
ALTER TABLE public.announcements 
ALTER COLUMN expires_at SET NOT NULL,
ALTER COLUMN expires_at SET DEFAULT (now() + interval '12 hours');

-- Create index for efficient cleanup queries
CREATE INDEX idx_announcements_expires_at ON public.announcements(expires_at);