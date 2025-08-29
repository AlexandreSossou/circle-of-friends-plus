-- Delete sample groups and their memberships
DELETE FROM public.group_members WHERE group_id IN (
  SELECT id FROM public.groups WHERE created_by = '33899022-0e0a-42cb-ba3f-747616a210ed'
);

DELETE FROM public.groups WHERE created_by = '33899022-0e0a-42cb-ba3f-747616a210ed';