-- Add RLS policy for event creators to manage attendees
CREATE POLICY "Event creators can manage event attendees"
ON public.event_attendees
FOR UPDATE
USING (
  event_id IN (
    SELECT id FROM public.events WHERE user_id = auth.uid()
  )
);

-- Add RLS policy for event creators to view all attendees (including pending)
CREATE POLICY "Event creators can view all event attendees"
ON public.event_attendees
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM public.events WHERE user_id = auth.uid()
  )
);