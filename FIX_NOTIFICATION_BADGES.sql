-- Fixes for notification badges and real-time updates
-- This setup resolves the notification badge and real-time update issues

-- =====================================================
-- 1. ENABLE REALTIME FOR NOTIFICATIONS TABLE (SKIP IF EXISTS)
-- =====================================================

-- Check if notifications table is already in realtime publication
-- Enable realtime for notifications table only if not already enabled
DO $$
BEGIN
  -- Try to add table to realtime publication, ignore if it already exists
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    RAISE NOTICE 'Added notifications table to realtime publication';
  EXCEPTION 
    WHEN others THEN
      RAISE NOTICE 'Notifications table already in realtime publication - skipping';
  END;
END $$;

-- =====================================================
-- 2. CREATE RPC FUNCTION: get_unread_notifications_count
-- =====================================================

-- Function to get unread notifications count for current user
CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  unread_count INTEGER;
BEGIN
  -- Get count of unread notifications for current user
  SELECT COUNT(*)
  INTO unread_count
  FROM public.notifications 
  WHERE user_id = auth.uid() 
  AND is_read = false;
  
  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_notifications_count() TO authenticated;

-- =====================================================
-- 3. CREATE RPC FUNCTION: mark_all_notifications_read
-- =====================================================

-- Function to mark all notifications as read for current user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, read_at = NOW()
  WHERE user_id = auth.uid() 
  AND is_read = false;
END;
$$;

-- Grant execute permission to authenticated users  
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;

-- =====================================================
-- 4. CREATE TRIGGER: update_notification_updated_at
-- =====================================================

-- Auto-update updated_at column when notification is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column if it doesn't exist
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger for notifications table
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. VERIFICATION QUERIES 
-- =====================================================

-- Test the functions (run these after setup to verify)
-- SELECT get_unread_notifications_count(); -- Should return current user's unread count
-- SELECT mark_all_notifications_read(); -- Should mark all as read

-- Test realtime is active
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

COMMENT ON FUNCTION get_unread_notifications_count() IS 'Returns unread notification count for current authenticated user';
COMMENT ON FUNCTION mark_all_notifications_read() IS 'Marks all notifications as read for current authenticated user';