-- Add gender restrictions to groups table
ALTER TABLE public.groups 
ADD COLUMN allowed_genders text[] DEFAULT NULL;

COMMENT ON COLUMN public.groups.allowed_genders IS 'Array of allowed genders for this group. NULL means no restrictions.';

-- Update existing groups to have no gender restrictions
UPDATE public.groups SET allowed_genders = NULL WHERE allowed_genders IS NULL;