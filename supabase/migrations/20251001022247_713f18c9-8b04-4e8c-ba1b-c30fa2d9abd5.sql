-- Add join_policy to groups table
ALTER TABLE public.groups 
ADD COLUMN join_policy TEXT NOT NULL DEFAULT 'open' CHECK (join_policy IN ('open', 'request'));

-- Create group_join_requests table
CREATE TABLE public.group_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  CONSTRAINT unique_user_group_request UNIQUE (group_id, user_id, status)
);

-- Enable RLS
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Group admins can view all requests for their groups
CREATE POLICY "Group admins can view join requests"
ON public.group_join_requests
FOR SELECT
USING (
  group_id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Users can view their own requests
CREATE POLICY "Users can view their own join requests"
ON public.group_join_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create join requests
CREATE POLICY "Users can create join requests"
ON public.group_join_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
);

-- Group admins can update requests (approve/reject)
CREATE POLICY "Group admins can update join requests"
ON public.group_join_requests
FOR UPDATE
USING (
  group_id IN (
    SELECT group_id 
    FROM public.group_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for better performance
CREATE INDEX idx_group_join_requests_group_id ON public.group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_user_id ON public.group_join_requests(user_id);
CREATE INDEX idx_group_join_requests_status ON public.group_join_requests(status);