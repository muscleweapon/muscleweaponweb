-- ==============================================================================
-- MUSCLE WEAPON ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20260919000002_rls_policies.sql
-- Enforces defense-in-depth authorization across all tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS FOR ROLE-BASED ACCESS
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

-- ------------------------------------------------------------------------------
-- 2. ENABLE RLS ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_code_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. POLICIES: profiles
-- ------------------------------------------------------------------------------
-- Users can view their own profile; admins can view all profiles
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

-- Users can update non-role fields of their own profile; super_admins can update any
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_super_admin())
  WITH CHECK (
    CASE 
      WHEN is_super_admin() THEN TRUE
      WHEN id = auth.uid() THEN (role = (SELECT role FROM profiles WHERE id = auth.uid()))
      ELSE FALSE
    END
  );

-- Super admin can insert or delete profiles
CREATE POLICY "profiles_insert_super_admin"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "profiles_delete_super_admin"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- ------------------------------------------------------------------------------
-- 4. POLICIES: products
-- ------------------------------------------------------------------------------
-- Public can only view visible and non-deleted products
CREATE POLICY "products_public_select"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (
    (is_visible = TRUE AND is_deleted = FALSE)
    OR is_admin()
  );

-- Only admins can create, update, or soft-delete products
CREATE POLICY "products_admin_insert"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "products_admin_update"
  ON products
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "products_admin_delete"
  ON products
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ------------------------------------------------------------------------------
-- 5. POLICIES: product_images
-- ------------------------------------------------------------------------------
-- Public can view images for visible, non-deleted products only
CREATE POLICY "product_images_public_select"
  ON product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.is_visible = TRUE
        AND products.is_deleted = FALSE
    )
    OR is_admin()
  );

-- Only admins can manage product images
CREATE POLICY "product_images_admin_insert"
  ON product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "product_images_admin_update"
  ON product_images
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "product_images_admin_delete"
  ON product_images
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ------------------------------------------------------------------------------
-- 6. POLICIES: verification_code_batches
-- Private to authenticated administrators only
-- ------------------------------------------------------------------------------
CREATE POLICY "verification_code_batches_admin_select"
  ON verification_code_batches
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "verification_code_batches_admin_insert"
  ON verification_code_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "verification_code_batches_admin_update"
  ON verification_code_batches
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ------------------------------------------------------------------------------
-- 7. POLICIES: verification_codes
-- Strictly private. Public has zero direct read or write access.
-- ------------------------------------------------------------------------------
CREATE POLICY "verification_codes_admin_select"
  ON verification_codes
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "verification_codes_admin_insert"
  ON verification_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "verification_codes_admin_update"
  ON verification_codes
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "verification_codes_super_admin_delete"
  ON verification_codes
  FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- ------------------------------------------------------------------------------
-- 8. POLICIES: verification_events
-- Read-only to admins. Inserts handled via server service role.
-- ------------------------------------------------------------------------------
CREATE POLICY "verification_events_admin_select"
  ON verification_events
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ------------------------------------------------------------------------------
-- 9. POLICIES: admin_audit_log
-- Append-only. Visible to admins. No updates or deletes permitted.
-- ------------------------------------------------------------------------------
CREATE POLICY "admin_audit_log_admin_select"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "admin_audit_log_admin_insert"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ------------------------------------------------------------------------------
-- 10. POLICIES: export_jobs
-- Admins can view and create their own export jobs; super_admins can view all
-- ------------------------------------------------------------------------------
CREATE POLICY "export_jobs_admin_select"
  ON export_jobs
  FOR SELECT
  TO authenticated
  USING (is_admin() AND (requester_id = auth.uid() OR is_super_admin()));

CREATE POLICY "export_jobs_admin_insert"
  ON export_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() AND requester_id = auth.uid());

CREATE POLICY "export_jobs_admin_update"
  ON export_jobs
  FOR UPDATE
  TO authenticated
  USING (is_admin() AND (requester_id = auth.uid() OR is_super_admin()))
  WITH CHECK (is_admin() AND (requester_id = auth.uid() OR is_super_admin()));
