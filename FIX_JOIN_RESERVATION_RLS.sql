-- Fix RLS policy to allow users to join reservations
-- This migration fixes the issue where users cannot join matches via joinReservation()

-- Drop the old restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update their reservations" ON court_reservations;

-- Create a more permissive UPDATE policy that allows:
-- 1. Owners to update their reservations (all fields)
-- 2. Any authenticated user to join by updating invited_players
CREATE POLICY "Users can update reservations"
  ON court_reservations FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      -- Owner can update their reservation
      auth.uid() = user_id 
      OR
      -- Any user can join confirmed reservations
      (status = 'confirmed' AND auth.uid() != user_id)
    )
  );

-- Add comment explaining the fix
COMMENT ON TABLE court_reservations IS 'Court reservations with RLS policy allowing owner updates and user self-joining';