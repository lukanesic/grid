-- =====================================================
-- NOTIFICATIONS VIEWED SYSTEM UPDATE
-- =====================================================
-- 
-- This updates the notification system to use "viewed_at" 
-- instead of marking all as read when entering the screen.
-- 
-- Execute this SQL in Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADD VIEWED_AT COLUMN TO PROFILES
-- =====================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notifications_last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. RPC FUNCTION: UPDATE VIEWED TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_notifications_viewed()
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
    
    -- Update the last viewed timestamp
    UPDATE public.profiles
    SET notifications_last_viewed_at = NOW()
    WHERE id = current_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'viewed_at', NOW()
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. UPDATE UNREAD COUNT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
DECLARE
    current_user_id UUID;
    unread_count INTEGER;
    last_viewed TIMESTAMP WITH TIME ZONE;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Get last viewed timestamp
    SELECT notifications_last_viewed_at INTO last_viewed
    FROM public.profiles
    WHERE id = current_user_id;
    
    -- If never viewed, use a very old date
    IF last_viewed IS NULL THEN
        last_viewed := '1970-01-01'::TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Count notifications created after last viewed
    SELECT COUNT(*)::INTEGER INTO unread_count
    FROM public.notifications
    WHERE user_id = current_user_id
      AND created_at > last_viewed;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION update_notifications_viewed TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count TO authenticated;

-- =====================================================
-- 5. VERIFICATION QUERIES (OPTIONAL)
-- =====================================================

-- Check if column was added
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'notifications_last_viewed_at';

-- Test update function
-- SELECT update_notifications_viewed();

-- Test count function
-- SELECT get_unread_notifications_count();
