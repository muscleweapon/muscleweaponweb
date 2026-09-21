-- ==============================================================================
-- MUSCLE WEAPON CONSOLIDATED DATABASE SETUP SCRIPT
-- Executes all Phase 2 migrations in order:
-- 1. Tables, Enums, Constraints & Indexes
-- 2. Row Level Security (RLS) Policies
-- 3. Triggers & Atomic RPC Functions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: EXTENSIONS & ENUMS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM (
    'Protein',
    'Mass gainer',
    'Multivitamins',
    'Calcium',
    'Omega gold fish oil',
    'Creatine',
    'Pre-workout'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE code_status AS ENUM ('active', 'disabled', 'revoked');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_outcome AS ENUM (
    'verified',
    'invalid',
    'disabled',
    'already_verified',
    'rate_limited'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE batch_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE export_format AS ENUM ('xls', 'pdf');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- PART 2: TABLES & CONSTRAINTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'admin',
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
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

CREATE TABLE IF NOT EXISTS product_images (
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

CREATE TABLE IF NOT EXISTS verification_code_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_count INTEGER NOT NULL CHECK (requested_count >= 1 AND requested_count <= 5000),
  generated_count INTEGER NOT NULL DEFAULT 0 CHECK (generated_count >= 0),
  code_scheme TEXT NOT NULL DEFAULT 'MW-12CHAR-ALPHANUMERIC',
  status batch_status NOT NULL DEFAULT 'pending',
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_codes (
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

CREATE TABLE IF NOT EXISTS verification_events (
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

CREATE TABLE IF NOT EXISTS admin_audit_log (
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

CREATE TABLE IF NOT EXISTS export_jobs (
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
-- PART 3: INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_public_visible ON products (is_visible, is_deleted, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_verification_codes_hash ON verification_codes (code_hash);
CREATE INDEX IF NOT EXISTS idx_verification_codes_batch ON verification_codes (batch_id, status);
CREATE INDEX IF NOT EXISTS idx_verification_events_audit ON verification_events (created_at DESC, outcome);
CREATE INDEX IF NOT EXISTS idx_verification_events_code ON verification_events (code_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor ON admin_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_jobs_requester ON export_jobs (requester_id, status);

-- ------------------------------------------------------------------------------
-- PART 4: ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_current_user_role() IN ('admin', 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT get_current_user_role() = 'super_admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_code_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_super_admin())
  WITH CHECK (
    CASE 
      WHEN is_super_admin() THEN TRUE
      WHEN id = auth.uid() THEN (role = (SELECT role FROM profiles WHERE id = auth.uid()))
      ELSE FALSE
    END
  );

DROP POLICY IF EXISTS "profiles_insert_super_admin" ON profiles;
CREATE POLICY "profiles_insert_super_admin" ON profiles FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "profiles_delete_super_admin" ON profiles;
CREATE POLICY "profiles_delete_super_admin" ON profiles FOR DELETE TO authenticated
  USING (is_super_admin());

-- Products Policies
DROP POLICY IF EXISTS "products_public_select" ON products;
CREATE POLICY "products_public_select" ON products FOR SELECT TO anon, authenticated
  USING ((is_visible = TRUE AND is_deleted = FALSE) OR is_admin());

DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert" ON products FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update" ON products FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete" ON products FOR DELETE TO authenticated
  USING (is_admin());

-- Product Images Policies
DROP POLICY IF EXISTS "product_images_public_select" ON product_images;
CREATE POLICY "product_images_public_select" ON product_images FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.is_visible = TRUE
        AND products.is_deleted = FALSE
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS "product_images_admin_insert" ON product_images;
CREATE POLICY "product_images_admin_insert" ON product_images FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "product_images_admin_update" ON product_images;
CREATE POLICY "product_images_admin_update" ON product_images FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "product_images_admin_delete" ON product_images;
CREATE POLICY "product_images_admin_delete" ON product_images FOR DELETE TO authenticated
  USING (is_admin());

-- Code Batches Policies
DROP POLICY IF EXISTS "verification_code_batches_admin_select" ON verification_code_batches;
CREATE POLICY "verification_code_batches_admin_select" ON verification_code_batches FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "verification_code_batches_admin_insert" ON verification_code_batches;
CREATE POLICY "verification_code_batches_admin_insert" ON verification_code_batches FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "verification_code_batches_admin_update" ON verification_code_batches;
CREATE POLICY "verification_code_batches_admin_update" ON verification_code_batches FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Verification Codes Policies
DROP POLICY IF EXISTS "verification_codes_admin_select" ON verification_codes;
CREATE POLICY "verification_codes_admin_select" ON verification_codes FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "verification_codes_admin_insert" ON verification_codes;
CREATE POLICY "verification_codes_admin_insert" ON verification_codes FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "verification_codes_admin_update" ON verification_codes;
CREATE POLICY "verification_codes_admin_update" ON verification_codes FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "verification_codes_super_admin_delete" ON verification_codes;
CREATE POLICY "verification_codes_super_admin_delete" ON verification_codes FOR DELETE TO authenticated
  USING (is_super_admin());

-- Verification Events Policies
DROP POLICY IF EXISTS "verification_events_admin_select" ON verification_events;
CREATE POLICY "verification_events_admin_select" ON verification_events FOR SELECT TO authenticated
  USING (is_admin());

-- Admin Audit Log Policies
DROP POLICY IF EXISTS "admin_audit_log_admin_select" ON admin_audit_log;
CREATE POLICY "admin_audit_log_admin_select" ON admin_audit_log FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_audit_log_admin_insert" ON admin_audit_log;
CREATE POLICY "admin_audit_log_admin_insert" ON admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- Export Jobs Policies
DROP POLICY IF EXISTS "export_jobs_admin_select" ON export_jobs;
CREATE POLICY "export_jobs_admin_select" ON export_jobs FOR SELECT TO authenticated
  USING (is_admin() AND (requester_id = auth.uid() OR is_super_admin()));

DROP POLICY IF EXISTS "export_jobs_admin_insert" ON export_jobs;
CREATE POLICY "export_jobs_admin_insert" ON export_jobs FOR INSERT TO authenticated
  WITH CHECK (is_admin() AND requester_id = auth.uid());

DROP POLICY IF EXISTS "export_jobs_admin_update" ON export_jobs;
CREATE POLICY "export_jobs_admin_update" ON export_jobs FOR UPDATE TO authenticated
  USING (is_admin() AND (requester_id = auth.uid() OR is_super_admin()))
  WITH CHECK (is_admin() AND (requester_id = auth.uid() OR is_super_admin()));

-- ------------------------------------------------------------------------------
-- PART 5: TRIGGERS & RPC FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'admin'::public.user_role),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_scratch_code_atomic(
  p_code_hash TEXT,
  p_submitted_fingerprint TEXT,
  p_mobile_hash TEXT,
  p_mobile_masked TEXT,
  p_location_status TEXT,
  p_location_lat NUMERIC DEFAULT NULL,
  p_location_lng NUMERIC DEFAULT NULL,
  p_device_ua TEXT DEFAULT NULL,
  p_device_browser TEXT DEFAULT NULL,
  p_device_os TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_correlation_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_code_record RECORD;
  v_already_verified BOOLEAN;
  v_outcome verification_outcome;
  v_event_id UUID;
BEGIN
  SELECT * INTO v_code_record
  FROM verification_codes
  WHERE code_hash = p_code_hash
  FOR UPDATE;

  IF v_code_record IS NULL THEN
    v_outcome := 'invalid';

    INSERT INTO verification_events (
      code_id, submitted_code_fingerprint, outcome, mobile_hash, mobile_masked,
      location_status, location_lat, location_lng, device_ua, device_browser,
      device_os, device_type, ip_hash, request_correlation_id
    ) VALUES (
      NULL, p_submitted_fingerprint, v_outcome, p_mobile_hash, p_mobile_masked,
      p_location_status, p_location_lat, p_location_lng, p_device_ua, p_device_browser,
      p_device_os, p_device_type, p_ip_hash, p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'invalid',
      'event_id', v_event_id,
      'message', 'The submitted verification code is invalid.'
    );
  END IF;

  IF v_code_record.status = 'disabled' OR v_code_record.status = 'revoked' THEN
    v_outcome := 'disabled';

    INSERT INTO verification_events (
      code_id, submitted_code_fingerprint, outcome, mobile_hash, mobile_masked,
      location_status, device_ua, request_correlation_id
    ) VALUES (
      v_code_record.id, p_submitted_fingerprint, v_outcome, p_mobile_hash, p_mobile_masked,
      p_location_status, p_device_ua, p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'disabled',
      'event_id', v_event_id,
      'message', 'This verification code is currently disabled or revoked. Please contact support.'
    );
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM verification_events
    WHERE code_id = v_code_record.id AND outcome = 'verified'
  ) INTO v_already_verified;

  IF v_already_verified THEN
    v_outcome := 'already_verified';

    INSERT INTO verification_events (
      code_id, submitted_code_fingerprint, outcome, mobile_hash, mobile_masked,
      location_status, device_ua, request_correlation_id
    ) VALUES (
      v_code_record.id, p_submitted_fingerprint, v_outcome, p_mobile_hash, p_mobile_masked,
      p_location_status, p_device_ua, p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'already_verified',
      'event_id', v_event_id,
      'message', 'This code has already been verified previously.'
    );
  END IF;

  v_outcome := 'verified';

  INSERT INTO verification_events (
    code_id, submitted_code_fingerprint, outcome, mobile_hash, mobile_masked,
    location_status, location_lat, location_lng, device_ua, device_browser,
    device_os, device_type, ip_hash, request_correlation_id
  ) VALUES (
    v_code_record.id, p_submitted_fingerprint, v_outcome, p_mobile_hash, p_mobile_masked,
    p_location_status, p_location_lat, p_location_lng, p_device_ua, p_device_browser,
    p_device_os, p_device_type, p_ip_hash, p_correlation_id
  ) RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'outcome', 'verified',
    'event_id', v_event_id,
    'message', 'Product is 100% genuine and verified authentic.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
