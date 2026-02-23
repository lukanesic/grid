-- Add match_type column to court_reservations table
ALTER TABLE court_reservations 
ADD COLUMN IF NOT EXISTS match_type VARCHAR(20) DEFAULT 'friendly';

-- Add constraint to ensure only valid values
ALTER TABLE court_reservations 
ADD CONSTRAINT check_match_type 
CHECK (match_type IN ('competitive', 'friendly', 'training'));

-- Add comment
COMMENT ON COLUMN court_reservations.match_type IS 'Type of match: competitive (ranked), friendly (casual), or training (practice)';

-- Update existing records to have a default value
UPDATE court_reservations 
SET match_type = 'friendly' 
WHERE match_type IS NULL;
