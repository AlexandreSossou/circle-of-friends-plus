-- Add foreign key constraint between events.user_id and profiles.id
ALTER TABLE events 
ADD CONSTRAINT fk_events_user_id 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;