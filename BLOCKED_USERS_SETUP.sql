-- =====================================================
-- BLOCKED USERS SYSTEM SQL SETUP
-- =====================================================
-- 
-- This creates a system for blocking/unblocking users
-- 
-- Execute this SQL in Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE BLOCKED_USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate blocks
    CONSTRAINT blocked_users_unique UNIQUE (blocker_id, blocked_id),
    -- Prevent self-blocking
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- Enable Realtime (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_users;

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can view who they blocked
CREATE POLICY "Users can view their own blocks"
    ON public.blocked_users FOR SELECT
    USING (auth.uid() = blocker_id);

-- Users can block others
CREATE POLICY "Users can block others"
    ON public.blocked_users FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock others
CREATE POLICY "Users can unblock others"
    ON public.blocked_users FOR DELETE
    USING (auth.uid() = blocker_id);

-- =====================================================
-- 3. RPC FUNCTION: BLOCK USER
-- =====================================================

CREATE OR REPLACE FUNCTION block_user(
    target_user_id UUID,
    block_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Check if trying to block self
    IF current_user_id = target_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot block yourself'
        );
    END IF;
    
    -- Check if already blocked
    IF EXISTS (
        SELECT 1 FROM public.blocked_users 
        WHERE blocker_id = current_user_id AND blocked_id = target_user_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is already blocked'
        );
    END IF;
    
    -- Insert block
    INSERT INTO public.blocked_users (blocker_id, blocked_id, reason)
    VALUES (current_user_id, target_user_id, block_reason);
    
    -- Optionally remove follow relationships
    DELETE FROM public.followers 
    WHERE (follower_id = current_user_id AND following_id = target_user_id)
       OR (follower_id = target_user_id AND following_id = current_user_id);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User blocked successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. RPC FUNCTION: UNBLOCK USER
-- =====================================================

CREATE OR REPLACE FUNCTION unblock_user(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    rows_deleted INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Delete block
    DELETE FROM public.blocked_users
    WHERE blocker_id = current_user_id AND blocked_id = target_user_id;
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    
    IF rows_deleted = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User was not blocked'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User unblocked successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. RPC FUNCTION: GET BLOCKED USERS LIST
-- =====================================================

CREATE OR REPLACE FUNCTION get_blocked_users()
RETURNS TABLE (
    id UUID,
    blocked_user_id UUID,
    blocked_user_name TEXT,
    blocked_user_avatar TEXT,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        b.id,
        b.blocked_id as blocked_user_id,
        p.full_name as blocked_user_name,
        p.avatar_url as blocked_user_avatar,
        b.reason,
        b.created_at as blocked_at
    FROM public.blocked_users b
    LEFT JOIN public.profiles p ON b.blocked_id = p.id
    WHERE b.blocker_id = current_user_id
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. RPC FUNCTION: CHECK IF USER IS BLOCKED
-- =====================================================

CREATE OR REPLACE FUNCTION is_user_blocked(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    is_blocked BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT EXISTS (
        SELECT 1 FROM public.blocked_users
        WHERE blocker_id = current_user_id AND blocked_id = target_user_id
    ) INTO is_blocked;
    
    RETURN is_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION block_user TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_blocked_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_blocked TO authenticated;
