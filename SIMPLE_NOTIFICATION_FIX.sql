-- Simple notification badge fix - only RPC functions
-- Since realtime is already enabled, just add the missing RPC functions

-- =====================================================
-- 1. CREATE RPC FUNCTION: get_unread_notifications_count
-- =====================================================

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS get_unread_notifications_count();

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
-- 2. CREATE RPC FUNCTION: mark_all_notifications_read
-- =====================================================

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS mark_all_notifications_read();

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
-- 3. TEST - Run these to verify everything works
-- =====================================================

-- Test the functions (should work after running above)
-- SELECT get_unread_notifications_count(); -- Should return your unread count
-- SELECT mark_all_notifications_read(); -- Should mark all as read