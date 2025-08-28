-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  avatar_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN NOT NULL DEFAULT true
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- member, admin, moderator
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add foreign key constraints
ALTER TABLE public.groups 
ADD CONSTRAINT fk_groups_created_by 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.group_members 
ADD CONSTRAINT fk_group_members_group_id 
FOREIGN KEY (group_id) 
REFERENCES groups(id) 
ON DELETE CASCADE;

ALTER TABLE public.group_members 
ADD CONSTRAINT fk_group_members_user_id 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Anyone can view public groups" 
ON public.groups 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view groups they're members of" 
ON public.groups 
FOR SELECT 
USING (id IN (
  SELECT group_id 
  FROM public.group_members 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" 
ON public.groups 
FOR UPDATE 
USING (id IN (
  SELECT group_id 
  FROM public.group_members 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Group admins can delete groups" 
ON public.groups 
FOR DELETE 
USING (id IN (
  SELECT group_id 
  FROM public.group_members 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for group_members
CREATE POLICY "Anyone can view group memberships" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join public groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_id AND is_public = true
  )
);

CREATE POLICY "Users can leave groups" 
ON public.group_members 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Group admins can manage members" 
ON public.group_members 
FOR ALL 
USING (group_id IN (
  SELECT group_id 
  FROM public.group_members 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add trigger for updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample groups
INSERT INTO public.groups (name, description, category, created_by, is_public) VALUES
('Tech Enthusiasts', 'A group for technology lovers to share and discuss the latest trends', 'Technology', (SELECT id FROM profiles LIMIT 1), true),
('Travel Bugs', 'Share your travel experiences and discover new destinations', 'Travel', (SELECT id FROM profiles LIMIT 1), true),
('Book Readers', 'A community of book lovers discussing their favorite reads', 'Books', (SELECT id FROM profiles LIMIT 1), true),
('Photography Club', 'Share your photography and learn new techniques', 'Photography', (SELECT id FROM profiles LIMIT 1), true);