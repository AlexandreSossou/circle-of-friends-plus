-- Add access_type field to events table
ALTER TABLE public.events 
ADD COLUMN access_type text NOT NULL DEFAULT 'open'::text;

-- Add constraint to ensure only valid access types
ALTER TABLE public.events 
ADD CONSTRAINT events_access_type_check 
CHECK (access_type IN ('open', 'request'));

-- Update the existing events to have 'open' access type (already set by default)
COMMENT ON COLUMN public.events.access_type IS 'Event access control: open (anyone can attend) or request (requires approval)';