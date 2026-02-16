-- =====================================================
-- SEED DATA: CLUBS, COURTS & OPERATING HOURS
-- =====================================================
-- This will create realistic clubs with courts in Belgrade
-- Execute this AFTER running COURTS_SETUP.sql

-- =====================================================
-- 1. DELETE ALL EXISTING DATA (CAREFUL!)
-- =====================================================

-- Delete all clubs (CASCADE will delete related courts, operating hours, reservations)
DELETE FROM public.clubs;

-- Reset sequences if needed
-- ALTER SEQUENCE IF EXISTS clubs_id_seq RESTART WITH 1;

-- =====================================================
-- 2. INSERT CLUBS
-- =====================================================

INSERT INTO public.clubs (id, name, image, price, distance, location, address, rating, reviews, description, courts, amenities, opening_hours) VALUES
-- TC Ušće
('11111111-1111-1111-1111-111111111111', 
 'TC Ušće', 
 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
 '1500',
 '2.5 km',
 'Novi Beograd',
 'Bulevar Nikole Tesle 3, Novi Beograd',
 4.7,
 423,
 'Moderni teniski centar sa 8 terena, uključujući 3 zatvorena terena za igru tokom cele godine.',
 8,
 '["Parking", "Kafić", "Garderobe", "Tuš kabine", "Trenerska škola", "Iznajmljivanje opreme"]',
 'Pon-Ned: 08:00-23:00'),

-- TC Košutnjak  
('22222222-2222-2222-2222-222222222222',
 'TC Košutnjak',
 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800',
 '1200',
 '4.1 km',
 'Čukarica',
 'Kneza Višeslava 88, Košutnjak',
 4.5,
 312,
 'Teniski klub u zelenilu Košutnjaka. 6 clay terena, idealno za ljubitelje tradicionalnog tenisa.',
 6,
 '["Parking", "Restoran", "Garderobe", "Iznajmljivanje opreme"]',
 'Pon-Ned: 09:00-22:00'),

-- TC Pioneer
('33333333-3333-3333-3333-333333333333',
 'TC Pioneer',
 'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800',
 '1800',
 '1.8 km',
 'Palilula',
 'Makenzijeva 31, Palilula',
 4.8,
 567,
 'Premium teniski centar sa 5 hard terena i profesionalnim osvetljenjem. Domaćin mnogih turnira.',
 5,
 '["VIP parking", "Restoran", "Spa & Sauna", "Fitness", "Pro shop", "Trenersko osoblje"]',
 'Pon-Ned: 07:00-00:00'),

-- TC Dorćol
('44444444-4444-4444-4444-444444444444',
 'TC Dorćol',
 'https://images.unsplash.com/photo-1617883861744-5ce1f75bbe7b?w=800',
 '1000',
 '3.2 km',
 'Stari Grad',
 'Tadeuša Košćuška 63, Dorćol',
 4.3,
 198,
 'Opuštena atmosfera sa 4 terena. Odličan izbor za rekreativce.',
 4,
 '["Parking", "Kafić", "Garderobe"]',
 'Pon-Ned: 10:00-22:00'),

-- TC Tašmajdan
('55555555-5555-5555-5555-555555555555',
 'TC Tašmajdan',
 'https://images.unsplash.com/photo-1606425961733-da2eee6dee4f?w=800',
 '1600',
 '2.0 km',
 'Palilula',
 'Ilije Garašanina 1, Tašmajdan',
 4.6,
 445,
 'Istorijski teniski klub u srcu grada. 6 terena sa dugom tradicijom.',
 6,
 '["Parking", "Restoran", "Garderobe", "Trenerska škola", "Biblioteka kluba"]',
 'Pon-Ned: 08:00-23:00'),

-- TC Ada Ciganlija
('66666666-6666-6666-6666-666666666666',
 'TC Ada Ciganlija',
 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
 '1300',
 '5.5 km',
 'Čukarica',
 'Ada Ciganlija bb, Čukarica',
 4.4,
 289,
 'Tereni na Adi sa pogledom na jezero. Savršeno za letnji tenis.',
 7,
 '["Veliki parking", "Plaža", "Splav restoran", "Garderobe", "Iznajmljivanje bicikala"]',
 'Pon-Ned: 09:00-21:00');

-- =====================================================
-- 3. INSERT COURTS FOR EACH CLUB
-- =====================================================

-- TC Ušće - 8 courts (3 indoor, 5 outdoor)
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Teren 1', 1, 'hard', false, true, 1500, 'RSD', 'Glavni teren sa tribinama'),
('11111111-1111-1111-1111-111111111111', 'Teren 2', 2, 'hard', false, true, 1500, 'RSD', 'Outdoor hard court'),
('11111111-1111-1111-1111-111111111111', 'Teren 3', 3, 'hard', false, true, 1500, 'RSD', 'Outdoor hard court'),
('11111111-1111-1111-1111-111111111111', 'Teren 4', 4, 'indoor_hard', true, true, 2000, 'RSD', 'Zatvoreni teren - zima'),
('11111111-1111-1111-1111-111111111111', 'Teren 5', 5, 'indoor_hard', true, true, 2000, 'RSD', 'Zatvoreni teren - zima'),
('11111111-1111-1111-1111-111111111111', 'Teren 6', 6, 'indoor_hard', true, true, 2000, 'RSD', 'Zatvoreni teren - zima'),
('11111111-1111-1111-1111-111111111111', 'Teren 7', 7, 'hard', false, true, 1400, 'RSD', 'Outdoor hard court'),
('11111111-1111-1111-1111-111111111111', 'Teren 8', 8, 'hard', false, true, 1400, 'RSD', 'Outdoor hard court');

-- TC Košutnjak - 6 clay courts
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency, description) VALUES
('22222222-2222-2222-2222-222222222222', 'Teren 1', 1, 'clay', false, true, 1200, 'RSD', 'Glavni clay teren'),
('22222222-2222-2222-2222-222222222222', 'Teren 2', 2, 'clay', false, true, 1200, 'RSD', 'Clay court'),
('22222222-2222-2222-2222-222222222222', 'Teren 3', 3, 'clay', false, true, 1200, 'RSD', 'Clay court'),
('22222222-2222-2222-2222-222222222222', 'Teren 4', 4, 'clay', false, true, 1000, 'RSD', 'Clay court'),
('22222222-2222-2222-2222-222222222222', 'Teren 5', 5, 'clay', false, true, 1000, 'RSD', 'Clay court'),
('22222222-2222-2222-2222-222222222222', 'Teren 6', 6, 'clay', false, false, 900, 'RSD', 'Clay court bez osvetljenja');

-- TC Pioneer - 5 premium hard courts
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency, description) VALUES
('33333333-3333-3333-3333-333333333333', 'Centralni teren', 1, 'hard', false, true, 2000, 'RSD', 'VIP teren sa tribinama'),
('33333333-3333-3333-3333-333333333333', 'Teren 2', 2, 'hard', false, true, 1800, 'RSD', 'Premium hard court'),
('33333333-3333-3333-3333-333333333333', 'Teren 3', 3, 'hard', false, true, 1800, 'RSD', 'Premium hard court'),
('33333333-3333-3333-3333-333333333333', 'Teren 4', 4, 'hard', false, true, 1800, 'RSD', 'Premium hard court'),
('33333333-3333-3333-3333-333333333333', 'Teren 5', 5, 'hard', false, true, 1800, 'RSD', 'Premium hard court');

-- TC Dorćol - 4 courts
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency, description) VALUES
('44444444-4444-4444-4444-444444444444', 'Teren 1', 1, 'hard', false, true, 1000, 'RSD', 'Hard court'),
('44444444-4444-4444-4444-444444444444', 'Teren 2', 2, 'hard', false, true, 1000, 'RSD', 'Hard court'),
('44444444-4444-4444-4444-444444444444', 'Teren 3', 3, 'clay', false, true, 900, 'RSD', 'Clay court'),
('44444444-4444-4444-4444-444444444444', 'Teren 4', 4, 'clay', false, false, 800, 'RSD', 'Clay court bez osvetljenja');

-- TC Tašmajdan - 6 courts
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency, description) VALUES
('55555555-5555-5555-5555-555555555555', 'Teren 1', 1, 'hard', false, true, 1600, 'RSD', 'Glavni teren'),
('55555555-5555-5555-5555-555555555555', 'Teren 2', 2, 'hard', false, true, 1600, 'RSD', 'Hard court'),
('55555555-5555-5555-5555-555555555555', 'Teren 3', 3, 'hard', false, true, 1600, 'RSD', 'Hard court'),
('55555555-5555-5555-5555-555555555555', 'Teren 4', 4, 'clay', false, true, 1400, 'RSD', 'Clay court'),
('55555555-5555-5555-5555-555555555555', 'Teren 5', 5, 'clay', false, true, 1400, 'RSD', 'Clay court'),
('55555555-5555-5555-5555-555555555555', 'Teren 6', 6, 'clay', false, false, 1200, 'RSD', 'Clay court');

-- TC Ada Ciganlija - 7 courts
INSERT INTO public.courts (club_id, name, court_number, surface_type, is_indoor, has_lights, hourly_rate, currency, description) VALUES
('66666666-6666-6666-6666-666666666666', 'Teren 1', 1, 'hard', false, true, 1300, 'RSD', 'Hard court sa pogledom na jezero'),
('66666666-6666-6666-6666-666666666666', 'Teren 2', 2, 'hard', false, true, 1300, 'RSD', 'Hard court'),
('66666666-6666-6666-6666-666666666666', 'Teren 3', 3, 'hard', false, true, 1300, 'RSD', 'Hard court'),
('66666666-6666-6666-6666-666666666666', 'Teren 4', 4, 'clay', false, true, 1200, 'RSD', 'Clay court'),
('66666666-6666-6666-6666-666666666666', 'Teren 5', 5, 'clay', false, true, 1200, 'RSD', 'Clay court'),
('66666666-6666-6666-6666-666666666666', 'Teren 6', 6, 'grass', false, true, 1500, 'RSD', 'Travnati teren (retko!)'),
('66666666-6666-6666-6666-666666666666', 'Teren 7', 7, 'hard', false, true, 1100, 'RSD', 'Hard court');

-- =====================================================
-- 4. INSERT OPERATING HOURS FOR ALL COURTS
-- =====================================================
-- This creates operating hours for Monday-Sunday (0=Sunday, 6=Saturday)
-- Based on each club's opening hours

DO $$
DECLARE
  court_record RECORD;
BEGIN
  -- TC Ušće: 08:00-23:00 (all days)
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = '11111111-1111-1111-1111-111111111111'
  LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '08:00'::TIME, '23:00'::TIME);
    END LOOP;
  END LOOP;

  -- TC Košutnjak: 09:00-22:00
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = '22222222-2222-2222-2222-222222222222'
  LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '09:00'::TIME, '22:00'::TIME);
    END LOOP;
  END LOOP;

  -- TC Pioneer: 07:00-00:00 (midnight)
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = '33333333-3333-3333-3333-333333333333'
  LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '07:00'::TIME, '23:59'::TIME);
    END LOOP;
  END LOOP;

  -- TC Dorćol: 10:00-22:00
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = '44444444-4444-4444-4444-444444444444'
  LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '10:00'::TIME, '22:00'::TIME);
    END LOOP;
  END LOOP;

  -- TC Tašmajdan: 08:00-23:00
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = '55555555-5555-5555-5555-555555555555'
  LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '08:00'::TIME, '23:00'::TIME);
    END LOOP;
  END LOOP;

  -- TC Ada Ciganlija: 09:00-21:00
  FOR court_record IN 
    SELECT id FROM public.courts WHERE club_id = '66666666-6666-6666-6666-666666666666'
  LOOP
    FOR day IN 0..6 LOOP
      INSERT INTO public.court_operating_hours (court_id, day_of_week, open_time, close_time)
      VALUES (court_record.id, day, '09:00'::TIME, '21:00'::TIME);
    END LOOP;
  END LOOP;

END $$;

-- =====================================================
-- 5. INSERT SAMPLE RESERVATIONS (OPTIONAL - FOR TESTING)
-- =====================================================
-- This creates some test reservations to show occupied slots
-- Note: Replace 'YOUR-USER-ID' with an actual user ID from profiles table

/*
-- Example: Reserve some slots for testing
INSERT INTO public.court_reservations 
  (court_id, user_id, reservation_date, start_time, end_time, duration_minutes, total_price, status)
VALUES
  -- Today at TC Ušće, Teren 1
  (
    (SELECT id FROM public.courts WHERE club_id = '11111111-1111-1111-1111-111111111111' AND court_number = 1),
    'YOUR-USER-ID',
    CURRENT_DATE,
    '14:00'::TIME,
    '16:00'::TIME,
    120,
    3000,
    'confirmed'
  ),
  -- Tomorrow at TC Pioneer, Centralni teren
  (
    (SELECT id FROM public.courts WHERE club_id = '33333333-3333-3333-3333-333333333333' AND court_number = 1),
    'YOUR-USER-ID',
    CURRENT_DATE + INTERVAL '1 day',
    '18:00'::TIME,
    '20:00'::TIME,
    120,
    4000,
    'confirmed'
  );
*/

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Verify the data:
SELECT 
  c.name as club_name, 
  COUNT(DISTINCT co.id) as total_courts,
  COUNT(DISTINCT coh.id) as operating_hours_configured
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
LEFT JOIN public.court_operating_hours coh ON coh.court_id = co.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Show court counts per club:
SELECT 
  c.name as club_name,
  c.location,
  COUNT(co.id) as number_of_courts,
  string_agg(DISTINCT co.surface_type, ', ') as surface_types
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
GROUP BY c.id, c.name, c.location
ORDER BY c.name;

-- =====================================================
-- HOW THE RESERVATION SYSTEM WORKS
-- =====================================================
-- 1. The app calls: get_available_time_slots('court-id', '2026-02-20', 60)
-- 2. Function generates ALL possible time slots (10:00, 11:00, 12:00...)
-- 3. Checks court_reservations table for existing bookings
-- 4. Returns slots marked as available (true) or occupied (false)
-- 5. When user books, INSERT into court_reservations with status='confirmed'
-- 6. That slot automatically becomes unavailable for others
--
-- You DON'T need to pre-populate 2 months of availability!
-- Availability is calculated on-the-fly based on:
-- - court_operating_hours (when court is open)
-- - court_reservations (what's already booked)
