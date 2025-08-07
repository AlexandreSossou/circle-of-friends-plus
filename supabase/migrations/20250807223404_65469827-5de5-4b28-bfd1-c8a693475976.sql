
-- Add traveling_with_partner column to travels table
ALTER TABLE public.travels 
ADD COLUMN traveling_with_partner boolean NOT NULL DEFAULT false;
