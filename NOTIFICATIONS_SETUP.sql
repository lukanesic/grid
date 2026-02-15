-- =====================================================
-- NOTIFICATIONS SYSTEM SQL SETUP
-- =====================================================
-- 
-- IMPORTANT: Follow these steps to activate the notifications system:
-- 
-- 1. Copy this entire SQL file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and execute this SQL
-- 4. Go to Database → Replication
-- 5. Find "notifications" table and ensure it's checked for Realtime
-- 
-- After setup, the app will:
-- ✓ Create notifications automatically when someone follows you
-- ✓ Update the badge count in real-time (instantly!)
-- ✓ Show notifications instantly without refresh
-- =====================================================

-- =====================================================
-- 1. CREATE NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('follow', 'unfollow', 'match_invite', 'match_accepted', 'match_declined', 'message')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT notifications_user_actor_unique UNIQUE (user_id, actor_id, type, created_at)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Enable Realtime for notifications table (CRITICAL for instant updates!)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- System can create notifications (via functions)
CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. FUNCTION: CREATE FOLLOW NOTIFICATION
-- =====================================================

CREATE OR REPLACE FUNCTION create_follow_notification(
    p_target_user_id UUID,
    p_actor_id UUID,
    p_actor_name TEXT
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.notifications (user_id, actor_id, type, message)
    VALUES (
        p_target_user_id,
        p_actor_id,
        'follow',
        p_actor_name || ' je počeo/la da te prati'
    )
    ON CONFLICT (user_id, actor_id, type, created_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. UPDATE follow_user FUNCTION TO CREATE NOTIFICATION
-- =====================================================

CREATE OR REPLACE FUNCTION follow_user(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    target_profile RECORD;
    current_user_profile RECORD;
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
    
    -- Get current user profile for notification
    SELECT * INTO current_user_profile FROM public.profiles WHERE id = current_user_id;
    
    -- Insert follow relationship
    INSERT INTO public.followers (follower_id, following_id)
    VALUES (current_user_id, target_user_id);
    
    -- Create notification
    PERFORM create_follow_notification(
        target_user_id,
        current_user_id,
        COALESCE(current_user_profile.full_name, 'Neko')
    );
    
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
-- 5. RPC FUNCTION: GET UNREAD NOTIFICATIONS COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
DECLARE
    current_user_id UUID;
    unread_count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*)::INTEGER INTO unread_count
    FROM public.notifications
    WHERE user_id = current_user_id AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. RPC FUNCTION: GET NOTIFICATIONS WITH PROFILES
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_notifications(
    page_limit INTEGER DEFAULT 50,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    message TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    actor_id UUID,
    actor_name TEXT,
    actor_avatar TEXT
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
        n.id,
        n.type,
        n.message,
        n.is_read,
        n.created_at,
        n.actor_id,
        p.full_name as actor_name,
        p.avatar_url as actor_avatar
    FROM public.notifications n
    LEFT JOIN public.profiles p ON n.actor_id = p.id
    WHERE n.user_id = current_user_id
    ORDER BY n.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RPC FUNCTION: MARK NOTIFICATION AS READ
-- =====================================================

CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
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
    
    UPDATE public.notifications
    SET is_read = true
    WHERE id = notification_id AND user_id = current_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Notification not found'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Notification marked as read'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RPC FUNCTION: MARK ALL NOTIFICATIONS AS READ
-- =====================================================

CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    updated_count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    UPDATE public.notifications
    SET is_read = true
    WHERE user_id = current_user_id AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'All notifications marked as read',
        'count', updated_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_follow_notification TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
