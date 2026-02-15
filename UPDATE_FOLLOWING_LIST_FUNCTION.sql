-- =====================================================
-- UPDATE get_following_list FUNCTION
-- =====================================================
-- This script updates the get_following_list function
-- Run this in Supabase SQL Editor

-- Update get_following_list function
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

-- Verify the function was updated
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_following_list';

-- Test the function
-- SELECT * FROM get_following_list(auth.uid(), 10, 0);
