-- Migration: Add structured location columns to verification_events
-- Supports Vercel request geo metadata and optional precise browser locations
ALTER TABLE verification_events
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_region TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT,
  ADD COLUMN IF NOT EXISTS location_source TEXT DEFAULT 'unavailable';
