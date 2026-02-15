-- =====================================================
-- REAL-TIME CHAT SYSTEM SQL SETUP
-- =====================================================
-- 
-- This creates a complete real-time chat system similar
-- to Messenger/WhatsApp with badge notifications
-- 
-- Execute this SQL in Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE CHATS TABLE (CONVERSATIONS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate chats between same users
    CONSTRAINT chats_unique UNIQUE (user1_id, user2_id),
    -- Prevent self-chat
    CONSTRAINT no_self_chat CHECK (user1_id != user2_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_user1 ON public.chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2 ON public.chats(user2_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON public.chats(last_message_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- =====================================================
-- 2. CREATE MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(chat_id, is_read) WHERE is_read = FALSE;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- CHATS POLICIES
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats"
    ON public.chats FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
    ON public.chats FOR INSERT
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own chats"
    ON public.chats FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- MESSAGES POLICIES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND (chats.user1_id = auth.uid() OR chats.user2_id = auth.uid())
        )
    );

-- =====================================================
-- 4. RPC FUNCTION: GET OR CREATE CHAT
-- =====================================================

CREATE OR REPLACE FUNCTION get_or_create_chat(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    chat_id UUID;
    smaller_id UUID;
    larger_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    IF current_user_id = other_user_id THEN
        RAISE EXCEPTION 'Cannot chat with yourself';
    END IF;
    
    -- Ensure consistent ordering (smaller UUID is always user1)
    IF current_user_id < other_user_id THEN
        smaller_id := current_user_id;
        larger_id := other_user_id;
    ELSE
        smaller_id := other_user_id;
        larger_id := current_user_id;
    END IF;
    
    -- Try to find existing chat
    SELECT id INTO chat_id
    FROM public.chats
    WHERE (user1_id = smaller_id AND user2_id = larger_id)
       OR (user1_id = larger_id AND user2_id = smaller_id)
    LIMIT 1;
    
    -- If not found, create new chat
    IF chat_id IS NULL THEN
        INSERT INTO public.chats (user1_id, user2_id)
        VALUES (smaller_id, larger_id)
        RETURNING id INTO chat_id;
    END IF;
    
    RETURN chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. RPC FUNCTION: GET USER CHATS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_chats()
RETURNS TABLE (
    chat_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_avatar TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER
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
        c.id as chat_id,
        CASE 
            WHEN c.user1_id = current_user_id THEN c.user2_id
            ELSE c.user1_id
        END as other_user_id,
        CASE 
            WHEN c.user1_id = current_user_id THEN p2.full_name
            ELSE p1.full_name
        END as other_user_name,
        CASE 
            WHEN c.user1_id = current_user_id THEN p2.avatar_url
            ELSE p1.avatar_url
        END as other_user_avatar,
        c.last_message,
        c.last_message_at,
        (
            SELECT COUNT(*)::INTEGER
            FROM public.messages m
            WHERE m.chat_id = c.id
              AND m.sender_id != current_user_id
              AND m.is_read = FALSE
        ) as unread_count
    FROM public.chats c
    LEFT JOIN public.profiles p1 ON c.user1_id = p1.id
    LEFT JOIN public.profiles p2 ON c.user2_id = p2.id
    WHERE c.user1_id = current_user_id OR c.user2_id = current_user_id
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. RPC FUNCTION: GET CHAT MESSAGES
-- =====================================================

CREATE OR REPLACE FUNCTION get_chat_messages(p_chat_id UUID, page_limit INTEGER DEFAULT 50, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    message_id UUID,
    sender_id UUID,
    sender_name TEXT,
    sender_avatar TEXT,
    content TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Verify user has access to this chat
    IF NOT EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = p_chat_id
        AND (user1_id = current_user_id OR user2_id = current_user_id)
    ) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.sender_id,
        p.full_name as sender_name,
        p.avatar_url as sender_avatar,
        m.content,
        m.is_read,
        m.created_at
    FROM public.messages m
    LEFT JOIN public.profiles p ON m.sender_id = p.id
    WHERE m.chat_id = p_chat_id
    ORDER BY m.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RPC FUNCTION: SEND MESSAGE
-- =====================================================

CREATE OR REPLACE FUNCTION send_message(p_chat_id UUID, p_content TEXT)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    new_message_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Verify user has access to this chat
    IF NOT EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = p_chat_id
        AND (user1_id = current_user_id OR user2_id = current_user_id)
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Chat not found or access denied'
        );
    END IF;
    
    -- Insert message
    INSERT INTO public.messages (chat_id, sender_id, content)
    VALUES (p_chat_id, current_user_id, p_content)
    RETURNING id INTO new_message_id;
    
    -- Update chat's last_message
    UPDATE public.chats
    SET last_message = p_content,
        last_message_at = NOW()
    WHERE id = p_chat_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message_id', new_message_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RPC FUNCTION: MARK CHAT AS READ
-- =====================================================

CREATE OR REPLACE FUNCTION mark_chat_as_read(p_chat_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    rows_updated INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Mark all messages in this chat as read (except those sent by current user)
    UPDATE public.messages
    SET is_read = TRUE
    WHERE chat_id = p_chat_id
      AND sender_id != current_user_id
      AND is_read = FALSE;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'messages_marked', rows_updated
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. RPC FUNCTION: GET UNREAD MESSAGES COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_messages_count()
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
    FROM public.messages m
    INNER JOIN public.chats c ON m.chat_id = c.id
    WHERE (c.user1_id = current_user_id OR c.user2_id = current_user_id)
      AND m.sender_id != current_user_id
      AND m.is_read = FALSE;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_or_create_chat TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_chats TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION send_message TO authenticated;
GRANT EXECUTE ON FUNCTION mark_chat_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_messages_count TO authenticated;

-- =====================================================
-- 11. VERIFICATION QUERIES (OPTIONAL)
-- =====================================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('chats', 'messages');

-- Test get_or_create_chat (replace with real UUID)
-- SELECT get_or_create_chat('target-user-uuid-here');

-- Test get_user_chats
-- SELECT * FROM get_user_chats();

-- Test get_unread_messages_count
-- SELECT get_unread_messages_count();
