-- ==============================================================================
-- MUSCLE WEAPON DATABASE INITIAL SCHEMA
-- Migration: 20260919000001_initial_schema.sql
-- Conforms to PRD Section 8 and Task.md Phase 2 requirements
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------

-- Approved product categories (PRD Section 2 - exactly 7 supported categories)
CREATE TYPE product_category AS ENUM (
  'Protein',
  'Mass gainer',
  'Multivitamins',
  'Calcium',
  'Omega gold fish oil',
  'Creatine',
  'Pre-workout'
);

-- Admin authorization roles
CREATE TYPE user_role AS ENUM (
  'admin',
  'super_admin'
);

-- Verification code status lifecycle
CREATE TYPE code_status AS ENUM (
  'active',
  'disabled',
  'revoked'
);

-- Verification event outcomes
CREATE TYPE verification_outcome AS ENUM (
  'verified',
  'invalid',
  'disabled',
  'already_verified',
  'rate_limited'
);

-- Batch status
CREATE TYPE batch_status AS ENUM (
  'pending',
  'completed',
  'failed'
);

-- Export job formats
CREATE TYPE export_format AS ENUM (
  'xls',
  'pdf'
);

-- Export job lifecycle status
CREATE TYPE export_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles
-- References auth.users, stores role and metadata
-- ------------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'admin',
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: products
-- Catalog storage; only visible and non-deleted products are public
-- ------------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category product_category NOT NULL,
  price_amount INTEGER CHECK (price_amount IS NULL OR price_amount >= 0),
  price_currency TEXT NOT NULL DEFAULT 'INR',
  description TEXT,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  nutrition_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_products_slug UNIQUE (slug)
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: product_images
-- Cloudinary media references linked to products
-- ------------------------------------------------------------------------------
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  secure_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  format TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: verification_code_batches
-- Tracks batch generation of 1-5,000 unique codes
-- ------------------------------------------------------------------------------
CREATE TABLE verification_code_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_count INTEGER NOT NULL CHECK (requested_count >= 1 AND requested_count <= 5000),
  generated_count INTEGER NOT NULL DEFAULT 0 CHECK (generated_count >= 0),
  code_scheme TEXT NOT NULL DEFAULT 'MW-12CHAR-ALPHANUMERIC',
  status batch_status NOT NULL DEFAULT 'pending',
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: verification_codes
-- Globally unique scratch codes. Product-independent.
-- ------------------------------------------------------------------------------
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES verification_code_batches(id) ON DELETE RESTRICT,
  code_hash TEXT NOT NULL,
  code_encrypted TEXT,
  status code_status NOT NULL DEFAULT 'active',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status_changed_at TIMESTAMPTZ,
  status_changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT uq_verification_codes_code_hash UNIQUE (code_hash)
);

-- ------------------------------------------------------------------------------
-- 7. TABLE: verification_events
-- Immutable audit log of all scratch-code verification attempts
-- ------------------------------------------------------------------------------
CREATE TABLE verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES verification_codes(id) ON DELETE SET NULL,
  submitted_code_fingerprint TEXT NOT NULL,
  outcome verification_outcome NOT NULL,
  mobile_hash TEXT NOT NULL,
  mobile_masked TEXT NOT NULL,
  location_status TEXT NOT NULL DEFAULT 'unavailable',
  location_lat NUMERIC(9,6),
  location_lng NUMERIC(9,6),
  location_accuracy TEXT,
  device_ua TEXT,
  device_browser TEXT,
  device_os TEXT,
  device_type TEXT,
  ip_hash TEXT,
  request_correlation_id TEXT NOT NULL,
  rate_limited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. TABLE: admin_audit_log
-- Append-only system audit log for sensitive administrator actions
-- ------------------------------------------------------------------------------
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  request_correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. TABLE: export_jobs
-- Server-side XLS/PDF export job queue and status
-- ------------------------------------------------------------------------------
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scope_description TEXT NOT NULL,
  filters_applied JSONB NOT NULL DEFAULT '{}'::jsonb,
  format export_format NOT NULL,
  status export_status NOT NULL DEFAULT 'pending',
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE & INTEGRITY
-- ------------------------------------------------------------------------------
CREATE INDEX idx_products_public_visible ON products (is_visible, is_deleted, created_at DESC);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_product_images_product ON product_images (product_id, sort_order ASC);
CREATE INDEX idx_verification_codes_hash ON verification_codes (code_hash);
CREATE INDEX idx_verification_codes_batch ON verification_codes (batch_id, status);
CREATE INDEX idx_verification_events_audit ON verification_events (created_at DESC, outcome);
CREATE INDEX idx_verification_events_code ON verification_events (code_id);
CREATE INDEX idx_admin_audit_log_actor ON admin_audit_log (actor_id, created_at DESC);
CREATE INDEX idx_export_jobs_requester ON export_jobs (requester_id, status);
