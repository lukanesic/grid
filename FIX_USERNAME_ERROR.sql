-- =====================================================
-- QUICK FIX: Remove username column requirement
-- =====================================================
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- This will update the RPC functions to not require username column

-- 1. Update get_followers_list function
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

-- 2. Update get_following_list function
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

-- Done! Function returns user_id, full_name, avatar_url (no username)
