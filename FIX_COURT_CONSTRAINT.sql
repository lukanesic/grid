-- Fix unique constraint to allow creating reservations on cancelled time slots
-- This resolves the "unique_court_time" violation when trying to recreate reservations

-- Drop the old constraint that blocks all reservations regardless of status
ALTER TABLE court_reservations DROP CONSTRAINT IF EXISTS unique_court_time;

-- Drop existing no_overlap constraint if it exists  
ALTER TABLE court_reservations DROP CONSTRAINT IF EXISTS no_overlap;

-- Create a simpler unique constraint that ignores cancelled reservations
-- Using reservation_date, start_time, end_time as separate columns
CREATE UNIQUE INDEX court_active_reservations_unique 
ON court_reservations (court_id, reservation_date, start_time, end_time)
WHERE (status != 'cancelled');

-- Create additional performance index
CREATE INDEX IF NOT EXISTS idx_court_reservations_active_time 
ON court_reservations(court_id, reservation_date, start_time, end_time) 
WHERE status != 'cancelled';