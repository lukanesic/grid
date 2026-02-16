-- Add new notification types for court reservations
-- This adds support for match_joined, match_left, and match_cancelled notifications

-- Drop the existing check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new check constraint with additional types
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'follow', 
  'unfollow', 
  'match_invite', 
  'match_accepted', 
  'match_declined', 
  'match_joined',
  'match_left', 
  'match_cancelled',
  'message'
));