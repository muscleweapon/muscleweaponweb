import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supabase Schema & Migration Contracts', () => {
  const migrationsDir = path.resolve(__dirname, '../../../supabase/migrations');

  it('verifies all 3 required migration files exist', () => {
    const files = fs.readdirSync(migrationsDir);
    expect(files).toContain('20260919000001_initial_schema.sql');
    expect(files).toContain('20260919000002_rls_policies.sql');
    expect(files).toContain('20260919000003_audit_and_rpc.sql');
  });

  it('verifies all 8 required tables are defined in initial_schema.sql', () => {
    const sql = fs.readFileSync(
      path.join(migrationsDir, '20260919000001_initial_schema.sql'),
      'utf8'
    );

    const requiredTables = [
      'profiles',
      'products',
      'product_images',
      'verification_code_batches',
      'verification_codes',
      'verification_events',
      'admin_audit_log',
      'export_jobs',
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE ${table}`);
    }
  });

  it('verifies exact 7 approved product categories are in product_category enum', () => {
    const sql = fs.readFileSync(
      path.join(migrationsDir, '20260919000001_initial_schema.sql'),
      'utf8'
    );

    const expectedCategories = [
      "'Protein'",
      "'Mass gainer'",
      "'Multivitamins'",
      "'Calcium'",
      "'Omega gold fish oil'",
      "'Creatine'",
      "'Pre-workout'",
    ];

    for (const cat of expectedCategories) {
      expect(sql).toContain(cat);
    }
  });

  it('verifies database constraints are defined', () => {
    const sql = fs.readFileSync(
      path.join(migrationsDir, '20260919000001_initial_schema.sql'),
      'utf8'
    );

    // Price constraint
    expect(sql).toContain('price_amount >= 0');
    // Batch size constraint (1 to 5000)
    expect(sql).toContain('requested_count >= 1 AND requested_count <= 5000');
    // Uniqueness constraints
    expect(sql).toContain('uq_products_slug UNIQUE (slug)');
    expect(sql).toContain('uq_verification_codes_code_hash UNIQUE (code_hash)');
  });

  it('verifies RLS is enabled on all 8 tables in rls_policies.sql', () => {
    const sql = fs.readFileSync(
      path.join(migrationsDir, '20260919000002_rls_policies.sql'),
      'utf8'
    );

    const requiredTables = [
      'profiles',
      'products',
      'product_images',
      'verification_code_batches',
      'verification_codes',
      'verification_events',
      'admin_audit_log',
      'export_jobs',
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    }

    // Public read restricted to visible & non-deleted products
    expect(sql).toContain('is_visible = TRUE AND is_deleted = FALSE');
  });

  it('verifies atomic verification function exists in audit_and_rpc.sql', () => {
    const sql = fs.readFileSync(
      path.join(migrationsDir, '20260919000003_audit_and_rpc.sql'),
      'utf8'
    );

    expect(sql).toContain('verify_scratch_code_atomic');
    expect(sql).toContain('FOR UPDATE'); // Race-condition prevention
  });
});
