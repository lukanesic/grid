-- =====================================================
-- FOLLOWERS SYSTEM SQL SETUP
-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- This implements the follow/following system with privacy controls

-- =====================================================
-- 1. CREATE FOLLOWERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (follower_id, following_id),
    
    -- Prevent self-following
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON public.followers(created_at DESC);

-- =====================================================
-- 2. ADD FOLLOWER COUNTS TO PROFILES TABLE
-- =====================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Update existing counts (if there are any existing followers)
UPDATE public.profiles
SET followers_count = (
    SELECT COUNT(*) FROM public.followers WHERE following_id = profiles.id
),
following_count = (
    SELECT COUNT(*) FROM public.followers WHERE follower_id = profiles.id
);

-- =====================================================
-- 3. TRIGGER FUNCTION TO UPDATE FOLLOWER COUNTS
-- =====================================================

CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment following_count for the follower
        UPDATE public.profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        -- Increment followers_count for the user being followed
        UPDATE public.profiles 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement following_count for the follower
        UPDATE public.profiles 
        SET following_count = GREATEST(following_count - 1, 0)
        WHERE id = OLD.follower_id;
        
        -- Decrement followers_count for the user being unfollowed
        UPDATE public.profiles 
        SET followers_count = GREATEST(followers_count - 1, 0)
        WHERE id = OLD.following_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_follower_count ON public.followers;
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON public.followers
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Anyone can view followers (unless profile is private)
CREATE POLICY "Anyone can view followers"
    ON public.followers FOR SELECT
    USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
    ON public.followers FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
    ON public.followers FOR DELETE
    USING (auth.uid() = follower_id);

-- =====================================================
-- 5. RPC FUNCTION: FOLLOW USER
-- =====================================================

CREATE OR REPLACE FUNCTION follow_user(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    target_profile RECORD;
    result JSONB;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Check if trying to follow self
    IF current_user_id = target_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot follow yourself'
        );
    END IF;
    
    -- Check if target user exists
    SELECT * INTO target_profile FROM public.profiles WHERE id = target_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Check if already following
    IF EXISTS (
        SELECT 1 FROM public.followers 
        WHERE follower_id = current_user_id AND following_id = target_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Already following this user'
        );
    END IF;
    
    -- Insert follow relationship
    INSERT INTO public.followers (follower_id, following_id)
    VALUES (current_user_id, target_user_id);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully followed user'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. RPC FUNCTION: UNFOLLOW USER
-- =====================================================

CREATE OR REPLACE FUNCTION unfollow_user(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    result JSONB;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Delete follow relationship
    DELETE FROM public.followers
    WHERE follower_id = current_user_id AND following_id = target_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'You are not following this user'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully unfollowed user'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RPC FUNCTION: GET FOLLOWERS LIST
-- =====================================================

CREATE OR REPLACE FUNCTION get_followers_list(
    target_user_id UUID,
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    is_following BOOLEAN,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        p.followers_count,
        p.following_count,
        EXISTS (
            SELECT 1 FROM public.followers 
            WHERE follower_id = current_user_id AND following_id = p.id
        ) as is_following,
        f.created_at as followed_at
    FROM public.followers f
    INNER JOIN public.profiles p ON f.follower_id = p.id
    WHERE f.following_id = target_user_id
    ORDER BY f.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RPC FUNCTION: GET FOLLOWING LIST
-- =====================================================

CREATE OR REPLACE FUNCTION get_following_list(
    target_user_id UUID,
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    is_following BOOLEAN,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.full_name,
        p.avatar_url,
        p.followers_count,
        p.following_count,
        EXISTS (
            SELECT 1 FROM public.followers 
            WHERE follower_id = current_user_id AND following_id = p.id
        ) as is_following,
        f.created_at as followed_at
    FROM public.followers f
    INNER JOIN public.profiles p ON f.following_id = p.id
    WHERE f.follower_id = target_user_id
    ORDER BY f.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. RPC FUNCTION: CHECK FOLLOW STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION check_follow_status(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    is_following BOOLEAN;
    is_followed_by BOOLEAN;
    target_profile RECORD;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'authenticated', false,
            'is_following', false,
            'is_followed_by', false,
            'is_own_profile', false
        );
    END IF;
    
    -- Get target profile info
    SELECT is_private, followers_count, following_count 
    INTO target_profile
    FROM public.profiles 
    WHERE id = target_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'error', 'User not found'
        );
    END IF;
    
    -- Check if own profile
    IF current_user_id = target_user_id THEN
        RETURN jsonb_build_object(
            'authenticated', true,
            'is_own_profile', true,
            'is_following', false,
            'is_followed_by', false,
            'is_private', target_profile.is_private,
            'can_view_profile', true,
            'followers_count', target_profile.followers_count,
            'following_count', target_profile.following_count
        );
    END IF;
    
    -- Check if current user is following target
    is_following := EXISTS (
        SELECT 1 FROM public.followers 
        WHERE follower_id = current_user_id AND following_id = target_user_id
    );
    
    -- Check if target is following current user
    is_followed_by := EXISTS (
        SELECT 1 FROM public.followers 
        WHERE follower_id = target_user_id AND following_id = current_user_id
    );
    
    RETURN jsonb_build_object(
        'authenticated', true,
        'is_own_profile', false,
        'is_following', is_following,
        'is_followed_by', is_followed_by,
        'is_private', target_profile.is_private,
        'can_view_profile', NOT target_profile.is_private OR is_following,
        'followers_count', target_profile.followers_count,
        'following_count', target_profile.following_count
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, DELETE ON public.followers TO authenticated;
GRANT EXECUTE ON FUNCTION follow_user TO authenticated;
GRANT EXECUTE ON FUNCTION unfollow_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_followers_list TO authenticated;
GRANT EXECUTE ON FUNCTION get_following_list TO authenticated;
GRANT EXECUTE ON FUNCTION check_follow_status TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Execute this SQL in Supabase SQL Editor
-- 2. Create TypeScript types for followers
-- 3. Implement FollowButton component
-- 4. Update playerProfile.tsx with follow logic
-- 5. Create followers/following list screens
