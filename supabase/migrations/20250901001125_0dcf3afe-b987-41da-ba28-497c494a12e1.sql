-- Security Fix Part 3: Fix Function Search Path Issues

-- Update all functions to have secure search path
CREATE OR REPLACE FUNCTION public.get_safe_event_data()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  start_date date,
  end_date date,
  event_time text,
  location text,
  visibility text,
  access_type text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  creator_name text,
  attendee_count bigint
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e."time" as event_time,
    e.location,
    e.visibility,
    e.access_type,
    e.created_at,
    e.updated_at,
    -- Only show creator name, not ID, for public events
    p.full_name as creator_name,
    -- Count attendees without exposing who they are
    (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.status = 'attending') as attendee_count
  FROM events e
  LEFT JOIN profiles p ON e.user_id = p.id
  WHERE e.visibility = 'public'
    AND (auth.uid() IS NULL OR auth.uid() != e.user_id); -- Don't apply to own events
$$;

CREATE OR REPLACE FUNCTION public.get_safe_group_data()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  avatar_url text,
  is_public boolean,
  created_at timestamp with time zone,
  member_count bigint
)
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    g.category,
    g.avatar_url,
    g.is_public,
    g.created_at,
    -- Show member count without exposing who the members are
    (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
  FROM groups g
  WHERE g.is_public = true;
$$;

CREATE OR REPLACE FUNCTION public.get_safe_announcement_data()  
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  location text,
  category text,
  visibility text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  expires_at timestamp with time zone,
  author_name text
)
LANGUAGE SQL
SECURITY DEFINER  
STABLE
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.title,
    a.description,
    a.location,
    a.category,
    a.visibility,
    a.created_at,
    a.updated_at,
    a.expires_at,
    -- Only show author name, not ID, for public announcements
    p.full_name as author_name
  FROM announcements a
  LEFT JOIN profiles p ON a.user_id = p.id  
  WHERE a.visibility = 'public'
    AND (auth.uid() IS NULL OR auth.uid() != a.user_id); -- Don't apply to own announcements
$$;

-- Also fix the security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_access(
  table_name text,
  access_type text,
  user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This can be expanded for security monitoring
  -- For now, just ensure function exists for future use
  RETURN;
END;
$$;