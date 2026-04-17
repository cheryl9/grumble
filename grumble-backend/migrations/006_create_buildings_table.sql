-- Migration: Create buildings table for Singapore postcode-to-coordinate lookup
-- Source: buildings.json (1.8M+ building records)
-- Purpose: Store building locations with postal codes for fast postcode→coordinate conversion
-- Created: 2026-04-16

BEGIN TRANSACTION;

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  postal_code VARCHAR(6) NOT NULL,
  latitude DECIMAL(11, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  building_name VARCHAR(255),
  address TEXT,
  road_name VARCHAR(255),
  blk_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for fast lookups
-- Index 1: Postal code lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_buildings_postal_code ON buildings(postal_code);

-- Index 2: Spatial queries (if needed for distance calculations)
CREATE INDEX IF NOT EXISTS idx_buildings_coords ON buildings(latitude, longitude);

-- Add table and column comments
COMMENT ON TABLE buildings IS
  'Singapore buildings with postal codes and coordinates - imported from buildings.json (1.8M+ records). Used for postal code to coordinate conversion with O(log n) lookup time.';

COMMENT ON COLUMN buildings.postal_code IS
  '6-digit Singapore postal code (000001-999999). Indexed for fast lookup.';

COMMENT ON COLUMN buildings.latitude IS
  'WGS84 latitude coordinate (SRID 4326). Range: -90 to 90 degrees.';

COMMENT ON COLUMN buildings.longitude IS
  'WGS84 longitude coordinate (SRID 4326). Range: -180 to 180 degrees.';

COMMENT ON COLUMN buildings.building_name IS
  'Official building/location name from OneMap/Singapore data';

COMMENT ON COLUMN buildings.address IS
  'Full address including road name, block number, and postal code';

COMMENT ON COLUMN buildings.road_name IS
  'Road or street name';

COMMENT ON COLUMN buildings.blk_no IS
  'Block number (if applicable)';

COMMIT;
