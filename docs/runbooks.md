# Muscle Weapon — Operational Runbooks

These runbooks provide step-by-step operational procedures for engineers, site administrators, and support staff managing the Muscle Weapon production platform.

---

## Runbook 1: Code Incident Response

### Trigger Conditions
- Reports of duplicate scratch codes circulating in the market.
- Verification failure spike alert (>10% invalid scans within 1 hour).
- Suspected unauthorized code batch generation in audit logs.

### Immediate Action (P0)
1. **Identify the Scope**:
   - Query `admin_audit_log` for the most recent `verification_batch.created` actions.
   - Cross-reference with the reported scratch codes:
     ```sql
     SELECT id, batch_id, status, generated_at 
     FROM verification_codes 
     WHERE code_hash = encode(sha256('<reported-code>'::bytea), 'hex');
     ```
2. **Disable the Affected Batch or Code**:
   - If a specific batch is compromised, navigate to **Admin > Verification Codes**.
   - Filter by Batch ID and click **Disable Batch** (or run `disableCodeBatchAction(batchId)`).
   - This atomically prevents any further successful verifications for all codes in that batch without deleting verification history.
3. **Notify Product & Supply Chain Teams**:
   - Supply chain lead must identify the packaging manufacturing lot corresponding to the batch.
   - Flag whether physical cartons have left the warehouse or are in retail distribution.
4. **Audit Trail Review**:
   - Verify actor ID in `admin_audit_log` who authorized the generation.
   - If actor is compromised, initiate **Runbook 7: Access Revocation**.

---

## Runbook 2: Verification Abuse & Rate Limiting

### Trigger Conditions
- More than 50 invalid verification attempts from the same IP address or phone number within 15 minutes.
- Automated brute-force scraping attempts detected on `/api/verify`.

### Immediate Action (P1)
1. **Confirm Rate Limiter is Active**:
   - `/api/verify` enforces rate limits per IP and phone number.
   - Responses return `HTTP 429 Too Many Requests` with a retry delay.
2. **Block Offending IP Range (Edge/WAF Level)**:
   - In your reverse proxy / Vercel / Cloudflare WAF, add an IP block rule for repeated 429 abusers.
3. **Database Audit of Failed Scans**:
   ```sql
   SELECT ip_address, count(*) as attempts 
   FROM verification_events 
   WHERE outcome = 'invalid' AND created_at > now() - interval '1 hour'
   GROUP BY ip_address 
   ORDER BY attempts DESC 
   LIMIT 20;
   ```
4. **Customer Reassurance**:
   - Inform customer service that legitimate users with genuine scratch codes will not have their codes invalidated by brute-force attacks because codes require exact matches and mobile numbers.

---

## Runbook 3: Disabled and Revoked Codes

### Trigger Conditions
- Defective product packaging batch recalled from market.
- Fraudulent returns where scratch panels were exposed prior to sale.

### Procedure
1. **Revoke/Disable in Admin Console**:
   - Go to **Admin > Verification Codes**.
   - Search for the code or select the entire batch.
   - Click **Revoke Code** (sets status to `revoked`).
2. **Customer Experience for Revoked Codes**:
   - When a consumer scans/inputs a revoked code at `/verify`:
     - The UI displays an amber status notice: `"This verification code has been deactivated or recalled. Please contact support@muscleweapon.in"`.
     - The verification event is logged with outcome `revoked`.
     - No raw code inventory or batch details are revealed to the consumer.

---

## Runbook 4: Export Failure and Recovery

### Trigger Conditions
- Export job returns an error or times out during large batch downloads (e.g., 5,000 codes).
- Export download link is corrupted or missing data.

### Procedure
1. **Check Server Logs**:
   - Inspect `/api/admin/export` server logs for timeout or memory limits.
2. **Scope Down Export Range**:
   - Instead of exporting all verification events across all time, filter by Batch ID or Date Range.
3. **Format Selection**:
   - If PDF generation exceeds memory limits for >2,000 codes, use CSV/XLS format which streams lightweight tabular records.
4. **Audit Log Verification**:
   - Ensure the export action was logged in `admin_audit_log` under `export.downloaded` with record count and scope.

---

## Runbook 5: Cloudinary Media Failure

### Trigger Conditions
- Product image uploads failing in Admin panel.
- Product images failing to render on public catalog or product detail pages.

### Procedure
1. **Verify Cloudinary API Credentials**:
   - Run `node src/scripts/test-connections.mjs` to test Cloudinary ping.
   - Check Cloudinary account dashboard for bandwidth or storage quota limits.
2. **Check Signed Upload Endpoint**:
   - Verify `/api/cloudinary/sign` returns valid signature and timestamp for authenticated admin users.
   - Unauthenticated requests must receive `401 Unauthorized`.
3. **Public Fallback Behavior**:
   - The application is engineered with robust fallbacks: if an image fails to load or is missing, `ProductGallery` renders a styled neutral brand card with the Muscle Weapon emblem and product name.
   - Product purchasing/outbound marketplace links and nutrition specifications remain fully functional.

---

## Runbook 6: Rollback Procedures

### Application Rollback
1. **Deployment Rollback**:
   - In Vercel / hosting platform, roll back to the previous stable deployment hash.
   - Security headers and environment variables remain intact.

### Database Migration Rollback
1. **Inspect Migration Version**:
   - Check `supabase/migrations/` for the applied migration file.
2. **Reversible Changes**:
   - If a new column or table caused a regression, apply a down migration in the Supabase SQL editor or run `ALTER TABLE ... DROP COLUMN ...`.
   - Never run `DROP TABLE` or `TRUNCATE` on `verification_codes`, `verification_events`, or `admin_audit_log` in production without backup confirmation.

---

## Runbook 7: Access Revocation & Admin Onboarding

### Admin Offboarding / Revocation
1. **Revoke User in Supabase Auth**:
   - In Supabase Dashboard > Authentication > Users, locate the user.
   - Click **Ban User** or **Delete User**.
2. **Downgrade Profile Role in Database**:
   ```sql
   UPDATE profiles 
   SET role = 'customer', updated_at = now() 
   WHERE id = '<user-id>';
   ```
3. **Session Invalidation**:
   - Supabase automatically invalidates JWTs upon user ban/deletion.
   - Next.js middleware and `requireAdminUser()` will instantly reject any subsequent requests with redirect to `/admin/login`.
4. **Audit Confirmation**:
   - Check `admin_audit_log` for any final actions taken by the departing administrator.
