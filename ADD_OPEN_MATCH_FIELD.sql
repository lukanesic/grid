-- =====================================================
-- ADD is_open_match FIELD TO court_reservations
-- =====================================================
-- This field tracks whether a match/reservation is open for others to join
-- or closed (private match)

-- Add the new column
ALTER TABLE public.court_reservations
ADD COLUMN IF NOT EXISTS is_open_match BOOLEAN NOT NULL DEFAULT true;

-- Add index for faster queries on open matches
CREATE INDEX IF NOT EXISTS idx_court_reservations_open_match 
ON public.court_reservations(is_open_match) 
WHERE is_open_match = true AND status IN ('confirmed', 'pending');

-- Add comment to explain the field
COMMENT ON COLUMN public.court_reservations.is_open_match IS 
'Indicates if this match is open for other players to join (true) or closed/private (false)';

-- Update existing reservations to be open by default
-- (if you want them closed by default, change to false)
UPDATE public.court_reservations 
SET is_open_match = true 
WHERE is_open_match IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that the column was added:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'court_reservations' AND column_name = 'is_open_match';
