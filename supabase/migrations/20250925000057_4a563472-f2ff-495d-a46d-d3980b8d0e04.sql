-- First, let's check what check constraints exist on the posts table
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.posts'::regclass 
AND contype = 'c';