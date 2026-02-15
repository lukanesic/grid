-- =====================================================
-- ADD USERNAME COLUMN TO PROFILES TABLE
-- =====================================================
-- This script adds the username column to the profiles table if it doesn't exist
-- Run this in Supabase SQL Editor before using the followers system

-- 1. Add username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN username TEXT UNIQUE;
        
        -- Create index for faster username lookups
        CREATE INDEX idx_profiles_username ON public.profiles(username);
        
        RAISE NOTICE 'Username column added successfully';
    ELSE
        RAISE NOTICE 'Username column already exists';
    END IF;
END $$;

-- 2. Optional: Populate username from email if null
-- Uncomment if you want to auto-generate usernames from email addresses
/*
UPDATE public.profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;
*/

-- 3. Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'username';
