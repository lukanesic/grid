-- =====================================================
-- MATCHES SYSTEM SQL SETUP
-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- This creates the matches table and related structures
-- NOTE: This should be executed AFTER COURTS_SETUP.sql if you want to link reservations to matches

-- =====================================================
-- 1. CREATE MATCHES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_type TEXT NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  match_format TEXT NOT NULL CHECK (match_format IN ('friendly', 'competitive', 'tournament', 'league')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  -- Location
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  location_name TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INT,

  -- Scoring
  scoring_type TEXT NOT NULL DEFAULT 'standard' CHECK (scoring_type IN ('standard', 'no_ad', 'tiebreak')),
  sets_to_win INT NOT NULL DEFAULT 2 CHECK (sets_to_win IN (1, 2, 3)),

  -- Teams (for doubles)
  team1_name TEXT,
  team2_name TEXT,

  -- Winner
  winning_team INT CHECK (winning_team IN (1, 2)),

  -- Stats
  is_public BOOLEAN NOT NULL DEFAULT true,
  view_count INT NOT NULL DEFAULT 0,

  -- Meta
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON public.matches(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_club ON public.matches(club_id);
CREATE INDEX IF NOT EXISTS idx_matches_court ON public.matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_by ON public.matches(created_by);
CREATE INDEX IF NOT EXISTS idx_matches_type_format ON public.matches(match_type, match_format);

-- =====================================================
-- 2. CREATE MATCH PARTICIPANTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.match_participants (
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team INT NOT NULL CHECK (team IN (1, 2)),
  position INT CHECK (position IN (1, 2)), -- For doubles: 1=server side, 2=returner side
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (match_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_match_participants_match ON public.match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user ON public.match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_status ON public.match_participants(status);

-- =====================================================
-- 3. ENABLE RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES FOR MATCHES
-- =====================================================

-- Anyone can view public matches
CREATE POLICY "Anyone can view public matches"
  ON public.matches FOR SELECT
  USING (is_public = true OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.match_participants mp
    WHERE mp.match_id = matches.id AND mp.user_id = auth.uid()
  ));

-- Authenticated users can create matches
CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Match creators and participants can update
CREATE POLICY "Match creators and participants can update"
  ON public.matches FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.match_participants mp
    WHERE mp.match_id = matches.id AND mp.user_id = auth.uid()
  ));

-- =====================================================
-- 5. CREATE RLS POLICIES FOR MATCH PARTICIPANTS
-- =====================================================

-- Anyone can view match participants
CREATE POLICY "Anyone can view match participants"
  ON public.match_participants FOR SELECT
  USING (true);

-- Match creators can add participants
CREATE POLICY "Match creators can add participants"
  ON public.match_participants FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = match_participants.match_id AND m.created_by = auth.uid()
  ));

-- Participants can update their own status
CREATE POLICY "Participants can update their own status"
  ON public.match_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. ADD FOREIGN KEY TO COURT_RESERVATIONS (If already created)
-- =====================================================

-- If you've already created court_reservations table without the foreign key,
-- run this to add it now:

DO $$
BEGIN
  -- Check if the foreign key doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'court_reservations_match_id_fkey'
    AND table_name = 'court_reservations'
  ) THEN
    -- Add foreign key constraint
    ALTER TABLE public.court_reservations
    ADD CONSTRAINT court_reservations_match_id_fkey
    FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- 7. CREATE TRIGGER TO UPDATE updated_at TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- You can now:
-- 1. Create matches with: INSERT INTO matches (match_type, match_format, scheduled_at, created_by) VALUES ...
-- 2. Link reservations to matches by setting reservation.match_id = match.id
-- 3. Add participants to matches via match_participants table
