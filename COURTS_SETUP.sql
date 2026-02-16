-- =====================================================
-- COURTS & RESERVATIONS SYSTEM SQL SETUP
-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- This implements the court reservation system with real-time availability

-- =====================================================
-- 1. CREATE COURTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  court_number INT,
  surface_type TEXT NOT NULL CHECK (surface_type IN ('hard', 'clay', 'grass', 'carpet', 'indoor_hard')),
  is_indoor BOOLEAN NOT NULL DEFAULT false,
  has_lights BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'RSD',
  description TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courts_club ON public.courts(club_id);
CREATE INDEX IF NOT EXISTS idx_courts_surface ON public.courts(surface_type);
CREATE INDEX IF NOT EXISTS idx_courts_available ON public.courts(is_available);

-- =====================================================
-- 2. CREATE COURT OPERATING HOURS TABLE
-- =====================================================
-- Defines when each court is operational (can vary by day of week)

CREATE TABLE IF NOT EXISTS public.court_operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(court_id, day_of_week)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_court_hours_court ON public.court_operating_hours(court_id);
CREATE INDEX IF NOT EXISTS idx_court_hours_day ON public.court_operating_hours(day_of_week);

-- =====================================================
-- 3. CREATE COURT RESERVATIONS TABLE
-- =====================================================
-- NOTE: match_id column is included but without foreign key constraint
-- If you want to link reservations to matches, first run MATCHES_SETUP.sql
-- which will create the matches table and add the foreign key automatically

CREATE TABLE IF NOT EXISTS public.court_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID, -- Will be linked to matches table when it's created

  -- Date and time information
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,

  -- Payment
  total_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'RSD',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),

  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Notes
  notes TEXT,
  invited_players TEXT[], -- Array of player IDs invited to the match

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent overlapping reservations
  CONSTRAINT unique_court_time UNIQUE (court_id, reservation_date, start_time, end_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_court_reservations_court ON public.court_reservations(court_id);
CREATE INDEX IF NOT EXISTS idx_court_reservations_user ON public.court_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_court_reservations_match ON public.court_reservations(match_id);
CREATE INDEX IF NOT EXISTS idx_court_reservations_date ON public.court_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_court_reservations_status ON public.court_reservations(status);
CREATE INDEX IF NOT EXISTS idx_court_reservations_date_time ON public.court_reservations(court_id, reservation_date, start_time);

-- =====================================================
-- 4. ENABLE RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_reservations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES FOR COURTS
-- =====================================================

-- Anyone can view all courts
CREATE POLICY "Anyone can view courts"
  ON public.courts FOR SELECT
  USING (true);

-- Club admins can manage courts
CREATE POLICY "Club admins can manage courts"
  ON public.courts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs c
      WHERE c.id = courts.club_id
      AND c.managed_by = auth.uid()
    )
  );

-- =====================================================
-- 6. CREATE RLS POLICIES FOR OPERATING HOURS
-- =====================================================

-- Anyone can view operating hours
CREATE POLICY "Anyone can view court operating hours"
  ON public.court_operating_hours FOR SELECT
  USING (true);

-- Club admins can manage operating hours
CREATE POLICY "Club admins can manage operating hours"
  ON public.court_operating_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courts co
      JOIN public.clubs cl ON cl.id = co.club_id
      WHERE co.id = court_operating_hours.court_id
      AND cl.managed_by = auth.uid()
    )
  );

-- =====================================================
-- 7. CREATE RLS POLICIES FOR RESERVATIONS
-- =====================================================

-- Anyone can view confirmed reservations (to see what's taken)
CREATE POLICY "Anyone can view confirmed reservations"
  ON public.court_reservations FOR SELECT
  USING (status IN ('confirmed', 'completed') OR auth.uid() = user_id);

-- Authenticated users can create reservations
CREATE POLICY "Authenticated users can create reservations"
  ON public.court_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can update their own reservations
CREATE POLICY "Users can update their reservations"
  ON public.court_reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can cancel their reservations
CREATE POLICY "Users can cancel their reservations"
  ON public.court_reservations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. CREATE FUNCTION TO CHECK COURT AVAILABILITY
-- =====================================================

CREATE OR REPLACE FUNCTION check_court_availability(
  p_court_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  reservation_count INT;
BEGIN
  -- Check if there are any overlapping reservations
  SELECT COUNT(*) INTO reservation_count
  FROM public.court_reservations
  WHERE court_id = p_court_id
    AND reservation_date = p_date
    AND status IN ('confirmed', 'pending')
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );
  
  -- Return true if no overlapping reservations found
  RETURN reservation_count = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CREATE FUNCTION TO GET AVAILABLE TIME SLOTS
-- =====================================================

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

-- =====================================================
-- 10. CREATE TRIGGER TO UPDATE updated_at TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courts_updated_at
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_reservations_updated_at
  BEFORE UPDATE ON public.court_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. INSERT SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert sample courts for each club
-- Note: Replace club IDs with actual IDs from your clubs table
/*
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency) VALUES
  ((SELECT id FROM public.clubs LIMIT 1), 'Teren 1', 1, 'hard', false, true, 1500, 'RSD'),
  ((SELECT id FROM public.clubs LIMIT 1), 'Teren 2', 2, 'clay', false, true, 1800, 'RSD'),
  ((SELECT id FROM public.clubs LIMIT 1), 'Teren 3', 3, 'hard', true, true, 2000, 'RSD'),
  ((SELECT id FROM public.clubs LIMIT 1), 'Teren 4', 4, 'carpet', true, true, 2200, 'RSD');

-- Insert operating hours (Monday-Sunday, 10:00-22:00)
DO $$
DECLARE
  court_record RECORD;
  day INT;
BEGIN
  FOR court_record IN SELECT id FROM public.courts LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '10:00'::TIME, '22:00'::TIME)
      ON CONFLICT (court_id, day_of_week) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- You can now:
-- 1. View courts with: SELECT * FROM courts;
-- 2. Check availability: SELECT * FROM get_available_time_slots('court-uuid', '2026-02-20', 60);
-- 3. Create reservations through the app
