
-- Add columns to profiles table for private profile relationship management
ALTER TABLE public.profiles 
ADD COLUMN private_partner_id uuid,
ADD COLUMN private_partners uuid[] DEFAULT '{}',
ADD COLUMN private_marital_status text,
ADD COLUMN looking_for text[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_private_partner_id ON public.profiles(private_partner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_private_partners ON public.profiles USING GIN(private_partners);

-- Add a table for relationship preferences/looking for options
CREATE TABLE IF NOT EXISTS relationship_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert common relationship preferences
INSERT INTO relationship_preferences (name, description) VALUES
('Swingers', 'Couples looking for other couples or singles for adult activities'),
('Open Relationship', 'Looking for additional romantic or physical connections'),
('Polyamorous', 'Seeking multiple loving relationships'),
('Casual Dating', 'Looking for casual, non-committed relationships'),
('Friends with Benefits', 'Seeking friendship with physical intimacy'),
('Social Events', 'Looking for people to attend adult social events'),
('Adventure Partners', 'Seeking partners for new experiences and adventures'),
('Networking', 'Professional or social networking in adult communities')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on the new table
ALTER TABLE relationship_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for relationship preferences (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view relationship preferences"
  ON relationship_preferences
  FOR SELECT
  TO authenticated
  USING (true);
