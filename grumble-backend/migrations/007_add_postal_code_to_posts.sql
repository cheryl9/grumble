-- Migration 007: Add postal_code column to posts table
-- Purpose: Store the postal code used when creating the post for easy filtering/searching

ALTER TABLE posts ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6);

-- Create index for fast postal code lookups
CREATE INDEX IF NOT EXISTS idx_posts_postal_code ON posts(postal_code);

-- Add comment
COMMENT ON COLUMN posts.postal_code IS
  'Postal code entered by user when creating the post. Used for location-based filtering and reference.';
