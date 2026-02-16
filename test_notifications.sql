-- Test notifications directly in SQL
-- Replace 'your-user-id' and 'target-user-id' with real user IDs

INSERT INTO public.notifications (
  user_id, 
  actor_id, 
  type, 
  message
) VALUES (
  'target-user-id-here',  -- Ko prima notifikaciju
  'your-user-id-here',    -- Ko je pokrenuo akciju
  'match_joined',
  'Test notifikacija za priključivanje meču'
);

-- Proveri da li je kreirana
SELECT * FROM public.notifications 
WHERE type = 'match_joined' 
ORDER BY created_at DESC 
LIMIT 5;