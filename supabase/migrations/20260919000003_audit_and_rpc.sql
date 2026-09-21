-- ==============================================================================
-- MUSCLE WEAPON AUDIT & RPC FUNCTIONS
-- Migration: 20260919000003_audit_and_rpc.sql
-- Provides atomic transactions, audit triggers, and race-condition prevention
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRIGGER: Auto-create profile when a user is created in auth.users
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'admin'::user_role),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (if permissions allow in Supabase)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT OR UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. FUNCTION: Atomic Verification Code Consumption (Race-condition Safe)
-- Locks the code row with SELECT ... FOR UPDATE to prevent double-consumption
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_scratch_code_atomic(
  p_code_hash TEXT,
  p_submitted_fingerprint TEXT,
  p_mobile_hash TEXT,
  p_mobile_masked TEXT,
  p_location_status TEXT,
  p_location_lat NUMERIC,
  p_location_lng NUMERIC,
  p_device_ua TEXT,
  p_device_browser TEXT,
  p_device_os TEXT,
  p_device_type TEXT,
  p_ip_hash TEXT,
  p_correlation_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_code_record RECORD;
  v_already_verified BOOLEAN;
  v_outcome verification_outcome;
  v_event_id UUID;
BEGIN
  -- 1. Query and lock the code record if it exists
  SELECT * INTO v_code_record
  FROM verification_codes
  WHERE code_hash = p_code_hash
  FOR UPDATE;

  -- 2. Code not found in database
  IF v_code_record IS NULL THEN
    v_outcome := 'invalid';

    INSERT INTO verification_events (
      code_id,
      submitted_code_fingerprint,
      outcome,
      mobile_hash,
      mobile_masked,
      location_status,
      location_lat,
      location_lng,
      device_ua,
      device_browser,
      device_os,
      device_type,
      ip_hash,
      request_correlation_id
    ) VALUES (
      NULL,
      p_submitted_fingerprint,
      v_outcome,
      p_mobile_hash,
      p_mobile_masked,
      p_location_status,
      p_location_lat,
      p_location_lng,
      p_device_ua,
      p_device_browser,
      p_device_os,
      p_device_type,
      p_ip_hash,
      p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'invalid',
      'event_id', v_event_id,
      'message', 'The submitted verification code is invalid.'
    );
  END IF;

  -- 3. Code is disabled
  IF v_code_record.status = 'disabled' THEN
    v_outcome := 'disabled';

    INSERT INTO verification_events (
      code_id,
      submitted_code_fingerprint,
      outcome,
      mobile_hash,
      mobile_masked,
      location_status,
      device_ua,
      request_correlation_id
    ) VALUES (
      v_code_record.id,
      p_submitted_fingerprint,
      v_outcome,
      p_mobile_hash,
      p_mobile_masked,
      p_location_status,
      p_device_ua,
      p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'disabled',
      'event_id', v_event_id,
      'message', 'This verification code is currently disabled. Please contact customer support.'
    );
  END IF;

  -- 4. Code is revoked
  IF v_code_record.status = 'revoked' THEN
    v_outcome := 'disabled';

    INSERT INTO verification_events (
      code_id,
      submitted_code_fingerprint,
      outcome,
      mobile_hash,
      mobile_masked,
      location_status,
      device_ua,
      request_correlation_id
    ) VALUES (
      v_code_record.id,
      p_submitted_fingerprint,
      v_outcome,
      p_mobile_hash,
      p_mobile_masked,
      p_location_status,
      p_device_ua,
      p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'disabled',
      'event_id', v_event_id,
      'message', 'This verification code has been revoked.'
    );
  END IF;

  -- 5. Check if already consumed/verified previously
  SELECT EXISTS(
    SELECT 1 FROM verification_events
    WHERE code_id = v_code_record.id AND outcome = 'verified'
  ) INTO v_already_verified;

  IF v_already_verified THEN
    v_outcome := 'already_verified';

    INSERT INTO verification_events (
      code_id,
      submitted_code_fingerprint,
      outcome,
      mobile_hash,
      mobile_masked,
      location_status,
      device_ua,
      request_correlation_id
    ) VALUES (
      v_code_record.id,
      p_submitted_fingerprint,
      v_outcome,
      p_mobile_hash,
      p_mobile_masked,
      p_location_status,
      p_device_ua,
      p_correlation_id
    ) RETURNING id INTO v_event_id;

    RETURN jsonb_build_object(
      'success', FALSE,
      'outcome', 'already_verified',
      'event_id', v_event_id,
      'message', 'This code has already been verified previously.'
    );
  END IF;

  -- 6. Successful authentic first-time verification
  v_outcome := 'verified';

  INSERT INTO verification_events (
    code_id,
    submitted_code_fingerprint,
    outcome,
    mobile_hash,
    mobile_masked,
    location_status,
    location_lat,
    location_lng,
    device_ua,
    device_browser,
    device_os,
    device_type,
    ip_hash,
    request_correlation_id
  ) VALUES (
    v_code_record.id,
    p_submitted_fingerprint,
    v_outcome,
    p_mobile_hash,
    p_mobile_masked,
    p_location_status,
    p_location_lat,
    p_location_lng,
    p_device_ua,
    p_device_browser,
    p_device_os,
    p_device_type,
    p_ip_hash,
    p_correlation_id
  ) RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'outcome', 'verified',
    'event_id', v_event_id,
    'message', 'Product is 100% genuine and verified authentic.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
