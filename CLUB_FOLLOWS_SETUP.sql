-- =====================================================
-- CLUB FOLLOWS SYSTEM SQL SETUP
-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- This implements the club follow system with mutual follows
-- Clubs can follow users (popular players) and users can follow clubs

-- =====================================================
-- 0. ADD ACCOUNT TYPE TO PROFILES TABLE
-- =====================================================

-- Add account_type column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'user' 
CHECK (account_type IN ('user', 'club'));

-- Create index for account_type
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);

-- =====================================================
-- 1. CREATE CLUBS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    managed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image TEXT,
    price TEXT,
    distance TEXT,
    location TEXT,
    address TEXT,
    rating DECIMAL(2,1),
    reviews INTEGER DEFAULT 0,
    description TEXT,
    courts INTEGER DEFAULT 0,
    amenities JSONB DEFAULT '[]'::jsonb,
    opening_hours TEXT,
    time_slots JSONB DEFAULT '[]'::jsonb,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_clubs_name ON public.clubs(name);
CREATE INDEX IF NOT EXISTS idx_clubs_location ON public.clubs(location);
CREATE INDEX IF NOT EXISTS idx_clubs_managed_by ON public.clubs(managed_by);

-- =====================================================
-- 2. CREATE CLUB_FOLLOWS TABLE (Mutual Follows)
-- =====================================================
-- Users can follow clubs AND clubs can follow users (popular players)
-- Note: club_id column contains club UUID when follower_type='user'
--       and user UUID when follower_type='club' (polymorphic)

CREATE TABLE IF NOT EXISTS public.club_follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    club_id UUID NOT NULL, -- Polymorphic: club UUID or user UUID
    follower_type TEXT NOT NULL CHECK (follower_type IN ('user', 'club')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (follower_id, club_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_club_follows_follower_id ON public.club_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_club_follows_club_id ON public.club_follows(club_id);
CREATE INDEX IF NOT EXISTS idx_club_follows_follower_type ON public.club_follows(follower_type);
CREATE INDEX IF NOT EXISTS idx_club_follows_created_at ON public.club_follows(created_at DESC);

-- =====================================================
-- 3. TRIGGER FUNCTION TO UPDATE FOLLOWER/FOLLOWING COUNTS
-- =====================================================
-- Updates counts for both users and clubs depending on follower_type

CREATE OR REPLACE FUNCTION update_club_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.follower_type = 'user' THEN
            -- User following a club
            -- Increment following_count for the user (profiles table)
            UPDATE public.profiles 
            SET following_count = following_count + 1 
            WHERE id = NEW.follower_id;
            
            -- Increment followers_count for the club
            UPDATE public.clubs 
            SET followers_count = followers_count + 1 
            WHERE id = NEW.club_id;
            
        ELSIF NEW.follower_type = 'club' THEN
            -- Club following a user (popular player)
            -- Increment following_count for the club
            UPDATE public.clubs 
            SET following_count = following_count + 1 
            WHERE id = (
                SELECT id FROM public.clubs WHERE managed_by = NEW.follower_id
            );
            
            -- Increment followers_count for the user being followed
            UPDATE public.profiles 
            SET followers_count = followers_count + 1 
            WHERE id = NEW.club_id;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.follower_type = 'user' THEN
            -- User unfollowing a club
            -- Decrement following_count for the user
            UPDATE public.profiles 
            SET following_count = GREATEST(following_count - 1, 0)
            WHERE id = OLD.follower_id;
            
            -- Decrement followers_count for the club
            UPDATE public.clubs 
            SET followers_count = GREATEST(followers_count - 1, 0)
            WHERE id = OLD.club_id;
            
        ELSIF OLD.follower_type = 'club' THEN
            -- Club unfollowing a user
            -- Decrement following_count for the club
            UPDATE public.clubs 
            SET following_count = GREATEST(following_count - 1, 0)
            WHERE id = (
                SELECT id FROM public.clubs WHERE managed_by = OLD.follower_id
            );
            
            -- Decrement followers_count for the user being unfollowed
            UPDATE public.profiles 
            SET followers_count = GREATEST(followers_count - 1, 0)
            WHERE id = OLD.club_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_club_followers_count ON public.club_follows;
CREATE TRIGGER trigger_update_club_followers_count
    AFTER INSERT OR DELETE ON public.club_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_club_followers_count();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Clubs table
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Anyone can view clubs
CREATE POLICY "Anyone can view clubs"
    ON public.clubs FOR SELECT
    USING (true);

-- Club follows table
ALTER TABLE public.club_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view club follows
CREATE POLICY "Anyone can view club follows"
    ON public.club_follows FOR SELECT
    USING (true);

-- Users can follow clubs
CREATE POLICY "Users can follow clubs"
    ON public.club_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow clubs
CREATE POLICY "Users can unfollow clubs"
    ON public.club_follows FOR DELETE
    USING (auth.uid() = follower_id);

-- =====================================================
-- 5. RPC FUNCTION: FOLLOW CLUB (or User if caller is club)
-- =====================================================
-- Automatically detects if caller is user or club account

CREATE OR REPLACE FUNCTION follow_club(target_club_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    current_account_type TEXT;
    result JSONB;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not authenticated'
        );
    END IF;
    
    -- Get account type
    SELECT account_type INTO current_account_type
    FROM public.profiles
    WHERE id = current_user_id;
    
    -- Check if club exists
    IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = target_club_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Club not found'
        );
    END IF;
    
    -- Check if already following
    IF EXISTS (
        SELECT 1 FROM public.club_follows 
        WHERE follower_id = current_user_id 
        AND club_id = target_club_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Already following this club'
        );
    END IF;
    
    -- Create follow relationship
    INSERT INTO public.club_follows (follower_id, club_id, follower_type)
    VALUES (current_user_id, target_club_id, current_account_type);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully followed club'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. RPC FUNCTION: UNFOLLOW CLUB
-- =====================================================

CREATE OR REPLACE FUNCTION unfollow_club(target_club_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    result JSONB;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not authenticated'
        );
    END IF;
    
    -- Check if following
    IF NOT EXISTS (
        SELECT 1 FROM public.club_follows 
        WHERE follower_id = current_user_id 
        AND club_id = target_club_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Not following this club'
        );
    END IF;
    
    -- Remove follow relationship
    DELETE FROM public.club_follows 
    WHERE follower_id = current_user_id 
    AND club_id = target_club_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully unfollowed club'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RPC FUNCTION: CHECK CLUB FOLLOW STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION check_club_follow_status(target_club_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    is_following BOOLEAN;
    followers_cnt INTEGER;
    following_cnt INTEGER;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Get club followers and following count
    SELECT followers_count, following_count INTO followers_cnt, following_cnt
    FROM public.clubs
    WHERE id = target_club_id;
    
    -- If no club found
    IF followers_cnt IS NULL THEN
        followers_cnt := 0;
        following_cnt := 0;
    END IF;
    
    -- Check if current user is following (only if authenticated)
    IF current_user_id IS NOT NULL THEN
        is_following := EXISTS (
            SELECT 1 FROM public.club_follows 
            WHERE follower_id = current_user_id 
            AND club_id = target_club_id
        );
    ELSE
        is_following := false;
    END IF;
    
    RETURN jsonb_build_object(
        'is_following', is_following,
        'followers_count', followers_cnt,
        'following_count', following_cnt
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'is_following', false,
            'followers_count', 0,
            'following_count', 0
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RPC FUNCTION: FOLLOW USER (For Clubs via Desktop Dashboard)
-- =====================================================
-- Allows clubs to follow popular players

CREATE OR REPLACE FUNCTION follow_user_as_club(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    current_account_type TEXT;
    my_club_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not authenticated'
        );
    END IF;
    
    -- Get account type and verify it's a club
    SELECT account_type INTO current_account_type
    FROM public.profiles
    WHERE id = current_user_id;
    
    IF current_account_type != 'club' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Only club accounts can use this function'
        );
    END IF;
    
    -- Check if target user exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
    -- Get club ID managed by this account
    SELECT id INTO my_club_id
    FROM public.clubs
    WHERE managed_by = current_user_id;
    
    IF my_club_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'No club associated with this account'
        );
    END IF;
    
    -- Check if already following
    IF EXISTS (
        SELECT 1 FROM public.club_follows 
        WHERE follower_id = current_user_id 
        AND club_id = target_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Already following this user'
        );
    END IF;
    
    -- Create follow relationship (club follows user)
    -- Note: club_id here actually contains user_id when follower_type='club'
    INSERT INTO public.club_follows (follower_id, club_id, follower_type)
    VALUES (current_user_id, target_user_id, 'club');
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully followed user'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. RPC FUNCTION: UNFOLLOW USER (For Clubs)
-- =====================================================

CREATE OR REPLACE FUNCTION unfollow_user_as_club(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    current_account_type TEXT;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not authenticated'
        );
    END IF;
    
    -- Get account type and verify it's a club
    SELECT account_type INTO current_account_type
    FROM public.profiles
    WHERE id = current_user_id;
    
    IF current_account_type != 'club' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Only club accounts can use this function'
        );
    END IF;
    
    -- Check if following
    IF NOT EXISTS (
        SELECT 1 FROM public.club_follows 
        WHERE follower_id = current_user_id 
        AND club_id = target_user_id
        AND follower_type = 'club'
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Not following this user'
        );
    END IF;
    
    -- Remove follow relationship
    DELETE FROM public.club_follows 
    WHERE follower_id = current_user_id 
    AND club_id = target_user_id
    AND follower_type = 'club';
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully unfollowed user'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON public.clubs TO authenticated, anon;
GRANT UPDATE ON public.clubs TO authenticated; -- For club accounts to update their info
GRANT SELECT ON public.club_follows TO authenticated, anon;

GRANT EXECUTE ON FUNCTION follow_club TO authenticated;
GRANT EXECUTE ON FUNCTION unfollow_club TO authenticated;
GRANT EXECUTE ON FUNCTION check_club_follow_status TO authenticated, anon;
GRANT EXECUTE ON FUNCTION follow_user_as_club TO authenticated;
GRANT EXECUTE ON FUNCTION unfollow_user_as_club TO authenticated;

-- =====================================================
-- 11. RLS POLICIES FOR CLUBS
-- =====================================================

-- Update policy: only club accounts can update their own club
CREATE POLICY "Club accounts can update their own club"
    ON public.clubs FOR UPDATE
    USING (
        auth.uid() = managed_by AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND account_type = 'club'
        )
    );

-- =====================================================
-- 12. INSERT SAMPLE CLUBS (matching your existing data)
-- =====================================================
-- managed_by is NULL for now (will be assigned when club accounts are created)

INSERT INTO public.clubs (id, managed_by, name, image, price, distance, location, address, rating, reviews, description, courts, amenities, opening_hours, time_slots)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    NULL, -- Will be assigned when club account is created
    'CN Montjuïc',
    'https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg',
    '17 €',
    '3km',
    'Barcelona Barcelona',
    'Carrer de Segura, 1, 08004 Barcelona',
    4.5,
    128,
    'Klub sa tradicijom i vrhunskim terenima. Idealno mesto za padel ljubitelje svih nivoa. Moderna oprema i prijatna atmosfera.',
    8,
    '[{"icon": "car", "label": "Parking"}, {"icon": "coffee", "label": "Kafić"}, {"icon": "bath", "label": "Tuševi"}, {"icon": "wifi", "label": "WiFi"}, {"icon": "wheelchair", "label": "Pristup"}]'::jsonb,
    'Pon-Ned: 08:00 - 23:00',
    '["13:30", "14:00", "14:30", "16:00", "17:00", "18:00"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000002',
    NULL, -- Will be assigned when club account is created
    'Eurofitness Vall d''Hebron',
    'https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg',
    '11 €',
    '5km',
    'Barcelona Barcelona',
    'Passeig de la Vall d''Hebron, 171, 08035 Barcelona',
    4.3,
    95,
    'Moderan sportski centar sa odličnim terenima. Deo većeg fitness kompleksa sa svim potrebnim sadržajima.',
    6,
    '[{"icon": "car", "label": "Parking"}, {"icon": "coffee", "label": "Kafić"}, {"icon": "bath", "label": "Tuševi"}, {"icon": "dumbbell", "label": "Gym"}]'::jsonb,
    'Pon-Ned: 07:00 - 23:00',
    '["12:00", "13:00", "15:00", "17:00", "19:00"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000003',
    NULL, -- Will be assigned when club account is created
    'Club Esportiu Europa',
    'https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg',
    '15 €',
    '2km',
    'Barcelona Barcelona',
    'Carrer de Provença, 480, 08025 Barcelona',
    4.7,
    156,
    'Premium klub sa najvišim standardima. Profesionalni treneri i vrhunska oprema dostupni svim članovima.',
    10,
    '[{"icon": "car", "label": "Parking"}, {"icon": "coffee", "label": "Kafić"}, {"icon": "bath", "label": "Tuševi"}, {"icon": "wifi", "label": "WiFi"}, {"icon": "user", "label": "Treneri"}]'::jsonb,
    'Pon-Ned: 08:00 - 22:00',
    '["10:00", "11:30", "14:00", "16:30", "18:00", "20:00"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000004',
    NULL, -- Will be assigned when club account is created
    'Padel Indoor Barcelona',
    'https://images.pexels.com/photos/18084429/pexels-photo-18084429.jpeg',
    '20 €',
    '4km',
    'Barcelona Barcelona',
    'Carrer de Mallorca, 401, 08013 Barcelona',
    4.4,
    89,
    'Specijalizovani indoor padel centar sa klimatizovanim terenima. Idealno za igru tokom cele godine.',
    12,
    '[{"icon": "car", "label": "Parking"}, {"icon": "coffee", "label": "Kafić"}, {"icon": "bath", "label": "Tuševi"}, {"icon": "snowflake-o", "label": "Klima"}, {"icon": "trophy", "label": "Turniri"}]'::jsonb,
    'Pon-Ned: 09:00 - 24:00',
    '["09:00", "10:30", "12:00", "15:00", "17:30", "19:00", "21:00"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check clubs table
-- SELECT * FROM public.clubs;

-- Check club_follows table
-- SELECT * FROM public.club_follows;

-- Check account types
-- SELECT id, full_name, account_type FROM public.profiles;

-- Test follow a club (replace with your user_id and club_id)
-- SELECT * FROM follow_club('00000000-0000-0000-0000-000000000001');

-- Test check follow status
-- SELECT * FROM check_club_follow_status('00000000-0000-0000-0000-000000000001');

-- Test unfollow a club
-- SELECT * FROM unfollow_club('00000000-0000-0000-0000-000000000001');

-- =====================================================
-- FOR FUTURE: CREATING CLUB ACCOUNTS
-- =====================================================
-- When creating club accounts through desktop dashboard:
-- 
-- 1. Create a profile with account_type='club':
--    INSERT INTO public.profiles (id, account_type, full_name, email)
--    VALUES (uuid_generate_v4(), 'club', 'Club Name', 'club@example.com');
--
-- 2. Link the club to the profile:
--    UPDATE public.clubs 
--    SET managed_by = '<club_profile_id>'
--    WHERE id = '<club_id>';
--
-- 3. Club accounts can then:
--    - Update their club info (image, description, amenities, etc.)
--    - Follow popular players using follow_user_as_club()
--    - See who follows them
--    - Access analytics through desktop dashboard
--
-- =====================================================
-- MUTUAL FOLLOW SYSTEM OVERVIEW
-- =====================================================
-- Users → Clubs: Users can follow clubs to get updates
-- Clubs → Users: Clubs can follow popular players for engagement
-- 
-- The club_follows table handles both:
-- - follower_type='user': User following a club
-- - follower_type='club': Club following a user
-- 
-- Counts are automatically maintained:
-- - profiles.following_count: How many clubs/users this user follows
-- - profiles.followers_count: How many users/clubs follow this user
-- - clubs.following_count: How many users this club follows
-- - clubs.followers_count: How many users follow this club
--
-- =====================================================
