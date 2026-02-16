-- =====================================================
-- FIX: get_available_time_slots FUNCTION
-- =====================================================
-- This fixes the "ambiguous column reference" error
-- Execute this in Supabase SQL Editor to update the function

CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_court_id UUID,
  p_date DATE,
  p_slot_duration_minutes INT DEFAULT 60
)
RETURNS TABLE (
  time_slot TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_day_of_week INT;
  v_open_time TIME;
  v_close_time TIME;
  v_current_slot TIME;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Get operating hours for this court and day
  SELECT coh.open_time, coh.close_time
  INTO v_open_time, v_close_time
  FROM public.court_operating_hours coh
  WHERE coh.court_id = p_court_id
    AND coh.day_of_week = v_day_of_week
    AND coh.is_closed = false;
  
  -- If no operating hours found or court is closed, return empty
  IF v_open_time IS NULL THEN
    RETURN;
  END IF;
  
  -- Generate time slots
  v_current_slot := v_open_time;
  WHILE v_current_slot + (p_slot_duration_minutes || ' minutes')::INTERVAL <= v_close_time LOOP
    time_slot := v_current_slot;
    is_available := check_court_availability(
      p_court_id,
      p_date,
      v_current_slot,
      v_current_slot + (p_slot_duration_minutes || ' minutes')::INTERVAL
    );
    RETURN NEXT;
    
    v_current_slot := v_current_slot + (p_slot_duration_minutes || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Test the function (replace with actual court_id from your database)
-- SELECT * FROM get_available_time_slots('your-court-id', CURRENT_DATE, 60);
