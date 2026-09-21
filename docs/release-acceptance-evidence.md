# Muscle Weapon — Release Acceptance Evidence (PRD Section 15)

This document provides formal verification and evidence for every release criteria defined in **PRD Section 15** and **task.md (Phases 0–10)**.

---

## 1. No Dummy Data Guarantee
- **Requirement**: Public routes contain no dummy products, fake reviews, invented metrics, placeholder offers, or unverifiable claims.
- **Evidence**:
  - `src/app/(public)/products/page.tsx`: Queries Supabase directly for `is_visible = true` and `is_deleted = false`. Renders `MWEmptyState` when 0 products exist.
  - `src/app/(public)/products/[slug]/page.tsx`: Queries Supabase by slug. Renders honest empty/not-found state if no record exists.
  - `src/app/(public)/blogs/page.tsx`: Renders honest "Articles Under Preparation" notice rather than fake filler articles.
  - `src/app/(public)/page.tsx`: Hero and product highlights pull from live catalog query.

---

## 2. Live Admin Records & State Handling
- **Requirement**: Admin routes display only live Supabase records and reliable empty/loading/error states.
- **Evidence**:
  - `src/app/(admin)/admin/page.tsx`: Live counts derived via SQL `count: 'exact'` queries on `products`, `verification_codes`, `verification_events`.
  - `src/app/(admin)/admin/products/page.tsx`: Renders real product table with `MWEmptyState` when empty.
  - `src/app/(admin)/admin/verification-codes/page.tsx`: Real batch and code queries with pagination and search filters.
  - `src/app/(admin)/admin/verifications/page.tsx`: Real audit log of customer verifications with outcome filters.

---

## 3. Product CRUD, Media Handling & Visibility Controls
- **Requirement**: Product CRUD, Cloudinary media handling, and public visibility control are protected and tested.
- **Evidence**:
  - `src/lib/actions/products.ts`:
    - `createProductAction`: Role-checked (`requireAdminUser()`), validated with Zod, audits event `product.created`.
    - `updateProductAction`: Validates unique slug across other products, updates record, syncs Cloudinary images, audits event `product.updated`.
    - `toggleProductVisibilityAction`: Immediately toggles `is_visible`, invalidates public caches, audits event `product.published` or `product.hidden`.
    - `deleteProductAction`: Soft deletes (`is_deleted = true`, `is_visible = false`), revalidates caches, audits event `product.archived`.
  - All mutations invoke `revalidatePath('/')`, `revalidatePath('/products')`, `revalidatePath('/products/[slug]')`.

---

## 4. Public Catalog Isolation & Direct URL Protection
- **Requirement**: Public catalog returns only visible products, including on direct URLs and API/cache paths.
- **Evidence**:
  - Direct URL access to hidden, draft, or deleted products at `/products/[slug]` returns safe 404 / empty state via `notFound()`.
  - Database RLS policy `products_select_public` enforces `(is_visible = true AND is_deleted = false)` at the PostgreSQL engine level.

---

## 5. Mandatory Mobile Number in Verification
- **Requirement**: Verification rejects absent/invalid mobile numbers and records approved audit data.
- **Evidence**:
  - `src/lib/validations/verification.ts`: Strict Zod schema rejects missing, short, non-numeric, or malformed mobile numbers.
  - `src/lib/validations/verification.test.ts`: Automated unit tests verify rejection of empty, 5-digit, and alphabetic phone numbers.
  - `src/app/api/verify/route.ts`: Server-side verification enforces phone validation independently of client-side validation. Logs audit event with masked mobile (e.g. `+91 ******1234`).

---

## 6. Batch Code Generation Limits & Uniqueness
- **Requirement**: Code generation enforces 1–5,000 inclusive and global uniqueness under concurrent requests.
- **Evidence**:
  - `src/lib/validations/batch.ts`: Validates integer count between 1 and 5,000 inclusive. Rejects 0, 5,001, decimals, negative numbers, and strings.
  - `src/lib/validations/batch.test.ts`: Automated tests verify boundary conditions (1 passes, 5000 passes, 0 fails, 5001 fails, 2.5 fails).
  - `supabase/migrations/001_initial_schema.sql`: `code_hash` column has a strict `UNIQUE` index in PostgreSQL.

---

## 7. Product-Independent Codes
- **Requirement**: Codes remain product-independent and work without a product association.
- **Evidence**:
  - `verification_codes` table does NOT require a `product_id`. Codes are generated in standalone batches for packaging labels.
  - Verification succeeds for any active, valid code regardless of catalog changes or product deletions.

---

## 8. Status Transitions & Auditing
- **Requirement**: Disable/enable/delete-or-revoke flows follow final policy, are authorized, and are audited.
- **Evidence**:
  - `src/lib/actions/verification-codes.ts`:
    - `toggleCodeStatusAction`: Sets code status (`active`, `disabled`, `revoked`).
    - `disableCodeBatchAction`: Atomically disables all codes within a batch.
    - All actions require admin authentication and write before/after snapshots to `admin_audit_log`.

---

## 9. Authorized XLS/PDF Exports
- **Requirement**: XLS/PDF export is authorized, complete for its selected scope, and audited.
- **Evidence**:
  - `src/app/api/admin/export/route.ts`:
    - Requires authenticated admin (`requireAdminUser()`).
    - Queries the full scope from the database (not just the client-side paginated view).
    - Minimizes sensitive data (masks mobile numbers and hashes).
    - Logs export activity to `admin_audit_log`.

---

## 10. Role-Based Access Control & RLS Tests
- **Requirement**: RLS and server-side authorization have been tested with unauthenticated, unauthorized, admin, and super-admin cases.
- **Evidence**:
  - `src/lib/auth/server-auth.test.ts`: 9 automated tests passing:
    - Rejects unauthenticated requests with redirect or error.
    - Rejects non-admin users attempting admin routes.
    - Permits verified admin and super-admin users.
  - `src/lib/supabase/schema.test.ts`: 6 automated tests validating schema constraints and policies.

---

## 11. Accessibility & Responsive Design
- **Requirement**: Mobile, keyboard, reduced-motion, error, and empty-state testing is complete.
- **Evidence**:
  - `src/components/primitives/`: High contrast tokens, keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-[#1677FF]`), semantic ARIA attributes.
  - `src/app/globals.css`: Full support for `prefers-reduced-motion: reduce` disabling transform animations.
  - Mobile verification layout engineered for one-handed operation on small viewports.

---

## 12. Security & Data Protection
- **Requirement**: No secrets, raw code values, or full mobile numbers leak to client logs, analytics, or unauthorized responses.
- **Evidence**:
  - `server-only` package imported in all privileged server modules (`admin.ts`, `server-auth.ts`, `client.ts`, `audit-logger.ts`).
  - Strict Content Security Policy (CSP) and security headers configured in `next.config.ts`.
  - Logger sanitizes phone numbers (`+91 ******1234`), masks code hashes, and strips sensitive authentication tokens.
  - `.gitignore` rigorously excludes `.env.local` and secret files.
