-- =====================================================
-- Add reservation_id to notifications table for match navigation
-- =====================================================

-- 1. Add reservation_id column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN reservation_id UUID REFERENCES public.court_reservations(id) ON DELETE CASCADE;

-- 2. Update the CHECK constraint to include all match notification types
ALTER TABLE public.notifications 
DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'follow', 'unfollow', 'match_invite', 'match_accepted', 'match_declined', 
  'match_joined', 'match_left', 'match_cancelled', 'message'
));

-- 3. Add index for reservation_id for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_reservation_id 
ON public.notifications(reservation_id);

-- 4. Update RLS policies to allow reading reservation_id
-- (Existing policies should already cover this, but just in case)

COMMENT ON COLUMN public.notifications.reservation_id IS 'Reference to court_reservations for match-related notifications';