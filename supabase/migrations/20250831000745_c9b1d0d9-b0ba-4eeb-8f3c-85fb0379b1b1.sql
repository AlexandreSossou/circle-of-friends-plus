-- Add RLS policies to allow users to view events based on visibility
-- Allow users to view public events
CREATE POLICY "Users can view public events" 
ON public.events 
FOR SELECT 
USING (visibility = 'public');

-- Allow users to view friends' events (for friends visibility)
CREATE POLICY "Users can view friends events" 
ON public.events 
FOR SELECT 
USING (
  visibility = 'friends' 
  AND user_id IN (
    SELECT
      CASE
        WHEN f.user_id = auth.uid() THEN f.friend_id
        WHEN f.friend_id = auth.uid() THEN f.user_id
        ELSE NULL::uuid
      END AS friend_id
    FROM friends f
    WHERE f.status = 'accepted'
      AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
  )
);

-- Create event_attendees table to track who's attending events
CREATE TABLE public.event_attendees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'pending', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_attendees
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_attendees
CREATE POLICY "Users can view event attendees for public events"
ON public.event_attendees 
FOR SELECT 
USING (
  event_id IN (
    SELECT id FROM public.events WHERE visibility = 'public'
  )
);

CREATE POLICY "Users can view attendees for events they can see"
ON public.event_attendees 
FOR SELECT 
USING (
  event_id IN (
    SELECT id FROM public.events 
    WHERE auth.uid() = user_id 
       OR visibility = 'public'
       OR (visibility = 'friends' AND user_id IN (
         SELECT
           CASE
             WHEN f.user_id = auth.uid() THEN f.friend_id
             WHEN f.friend_id = auth.uid() THEN f.user_id
             ELSE NULL::uuid
           END AS friend_id
         FROM friends f
         WHERE f.status = 'accepted'
           AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
       ))
  )
);

CREATE POLICY "Users can manage their own event attendance"
ON public.event_attendees 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_event_attendees_updated_at
BEFORE UPDATE ON public.event_attendees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();