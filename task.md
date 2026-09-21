# Muscle Weapon Website — Sequential Build Tasks for Antigravity

## Working rules (apply to every phase)

1. Build against real Supabase and Cloudinary integrations or explicit local development equivalents that use the same schema/contracts. Do **not** use dummy products, mock verification events, invented dashboard counters, fake reviews, placeholder metrics, or hard-coded production data.
2. Do not skip validation. Every user-facing validation must have matching server-side validation and database constraints where applicable.
3. Do not expose Supabase service keys, Cloudinary API secrets, raw code values, full mobile numbers, or sensitive audit data in browser bundles, logs, errors, screenshots, or source control.
4. Implement loading, empty, unauthorized, and error states with each feature—not as a final polish task.
5. Record implementation decisions that depend on the business (currency, retention, repeat scans, code format, phone-country policy) as blocking configuration/approval items. Do not silently make them up.
6. Treat accessibility, mobile behavior, performance, and security tests as release work, not optional follow-up work.

## Phase 0 — Project discovery and decision register

**Dependencies:** None.

### Tasks

- [x] Review `PRD.md` and create a decision register for the nine unresolved decisions in PRD Section 14.
- [x] Confirm the target framework, deployment environment, Supabase project, Cloudinary account/folder rules, and approved environment-variable names.
- [x] Confirm the supplied logo asset is available in a licensed project asset location and record display/alt-text rules.
- [x] Establish content ownership for product specifications, nutrition facts, pricing/currency, support wording, and privacy notice. Do not create content that has not been supplied.
- [x] Define the public/admin URL map and source-control conventions for migrations, validation schemas, and generated exports.

### Acceptance criteria

- A written decision register identifies each open policy, owner, and its effect on implementation.
- No product, pricing, compliance, or verification policy is assumed merely to unblock development.
- The project has an approved secret-management approach and no credentials are checked in.

## Phase 1 — Foundation, quality gates, and design system

**Dependencies:** Phase 0.

### Tasks

- [x] Create the application structure with public and protected-admin route boundaries.
- [x] Add TypeScript/domain schema validation, formatting/linting, unit-test runner, end-to-end-test runner, and CI quality gates appropriate to the selected stack.
- [x] Add an `.env.example` containing variable names only, plus setup documentation for Supabase and Cloudinary.
- [x] Define design tokens for black/white brand foundation, neutral surfaces, one configurable unapproved accent, typography, spacing, radius, elevation, motion, focus, and status states.
- [x] Build accessible primitives: navigation, buttons, inputs, select/combobox, table, dialog, toast/notice, skeleton, empty/error state, pagination, and form-error pattern.
- [x] Implement global responsive breakpoints and `prefers-reduced-motion` behavior.
- [x] Add baseline security headers, error boundary, request correlation, and sanitized error logging.

### Acceptance criteria

- Public and admin route boundaries are identifiable and protected routes do not render privileged content before authorization resolves.
- Core UI has keyboard focus states, semantic labels, high contrast, and mobile layouts.
- The application builds, lints, type-checks, and runs baseline tests in CI.
- No mocked dashboard or catalog data is embedded in production components.

## Phase 2 — Supabase schema, authentication, RLS, and audit core

**Dependencies:** Phase 1; decisions on roles and retention must be identified (open decisions may be configurable but cannot be ignored).

### Tasks

- [x] Configure Supabase Auth for admin sign-in and secure session handling.
- [x] Create version-controlled migrations for `profiles`, `products`, `product_images`, `verification_code_batches`, `verification_codes`, `verification_events`, `admin_audit_log`, and `export_jobs`.
- [x] Add enum/check constraints for supported categories, allowed statuses, valid monetary fields, and batch-size bounds.
- [x] Add database uniqueness for canonical verification-code storage and indexes for public product queries, code lookup, batch listing, and verification-event audit filters.
- [x] Implement RLS for every table/view/channel. Public read access is limited to explicitly public product fields; codes, audits, exports, raw customer data, and admin records are private.
- [x] Create protected server-side authorization helpers for admin and super-admin actions.
- [x] Implement append-only admin audit-log write helper, with safe before/after snapshots and request correlation.
- [x] Write RLS/adversarial tests for unauthenticated, ordinary authenticated, admin, and super-admin actors.

### Acceptance criteria

- Database migrations apply successfully to a fresh project and are reversible/managed according to team migration policy.
- An unauthenticated client cannot read or mutate products beyond public visible data, codes, verification events, exports, or audit data.
- An authenticated non-admin cannot access admin data or actions.
- Role-protected actions are enforced on the server and audit entries are created for successful sensitive admin changes.
- Schema is usable with an empty database and all UI will show empty states rather than seeded records.

## Phase 3 — Cloudinary media integration

**Dependencies:** Phases 1–2; Cloudinary policy decision.

### Tasks

- [x] Configure a server-side signed upload flow with restricted Cloudinary folder, asset type, permitted formats, maximum size, and transformation rules.
- [x] Create product-image metadata persistence in Supabase and bind image ownership to the product.
- [x] Build accessible admin image upload, ordering, preview, alt-text, replace, and remove flows.
- [x] Render responsive Cloudinary images with sensible dimensions and lazy loading; reserve layout space to avoid cumulative layout shift.
- [x] Implement explicit/orchestrated orphan-media handling based on the approved asset-retention policy.
- [x] Test unauthorized upload attempts, invalid files, oversize files, upload failures, and partial success recovery.

### Acceptance criteria

- Product images are stored in Cloudinary; Supabase stores metadata/references, not image binaries.
- Cloudinary secrets never reach browser code.
- An admin can recover from upload failure without a broken product record.
- Image rendering is responsive and has real alt text or a deliberate decorative designation.

## Phase 4 — Admin product management and visibility controls

**Dependencies:** Phases 1–3.

### Tasks

- [x] Build live admin product list with pagination, supported-category filters, visible/hidden status, empty state, loading state, error recovery, and access control.
- [x] Build create/edit product form: name, unique slug, approved category, price/currency when supplied, description, specifications, nutrition facts, images, and public visibility state.
- [x] Validate form data with shared client/server schemas; sanitize and safely render structured content.
- [x] Implement product create/update/archive-or-delete server actions with role checks and audit entries.
- [x] Implement explicit publish/hide control and public-cache revalidation after every visibility/content change.
- [x] Add protected product media management within the editor.
- [x] Write tests for duplicate slugs, invalid category, malformed nutrition/spec data, negative price, hidden product direct URL, and unauthorized mutations.

### Acceptance criteria

- With no rows in Supabase, the product list says no products exist and offers an authorized “create product” action; it does not show sample products.
- Only the seven supplied categories can be selected.
- A visible product appears in the public read path; hiding/archiving/deleting it removes it from every public data path after revalidation.
- Every mutation is server-authorized, validated, and audited.

## Phase 5 — Public athlete-focused product experience

**Dependencies:** Phase 4; approved design-token and logo asset setup.

### Tasks

- [x] Build the immersive public shell: logo treatment, strong brand entry, accessible navigation, product and verification calls-to-action, and support footer.
- [x] Implement progressive 3D/tech visual treatment using performant layers and a flat fallback. Do not make navigation, product details, or verification depend on animations/WebGL.
- [x] Build public catalog from live visible-product query only, with category filters and real empty/loading/error/not-found states.
- [x] Build public product detail route from live visible-product query only, with dynamic metadata and a safe not-found result for hidden/unpublished/deleted records.
- [x] Render only available product fields. Do not show placeholder ratings, discounts, testimonials, stock, nutrition claims, or invented specification text.
- [x] Add supplied support email/phone and the supplied Amazon/Flipkart outbound links, each labelled as external where applicable.
- [x] Implement keyboard, touch, screen-reader, narrow-device, reduced-motion, and slow-network checks.

### Acceptance criteria

- The site gives a futuristic, athlete-first impression while remaining readable, fast, and usable without animation.
- All public products come from Supabase and are currently marked visible.
- Hidden/unpublished product URLs return safe not-found responses and do not expose product/media metadata.
- Catalog/product pages use real data or clearly state that no products are currently available.
- The support and marketplace destinations exactly match the supplied links/details.

## Phase 6 — Secure verification-code data operations

**Dependencies:** Phase 2; final code format and deletion/repeat-scan decisions before finalization.

### Tasks

- [x] Specify canonical code format and secure at-rest lookup/storage approach. Implement code generation only on the server using cryptographically secure randomness.
- [x] Implement transactional/RPC batch generation: validate integer count 1–5,000, create batch metadata, generate globally unique product-independent codes, apply database uniqueness, and return a complete result/failure state.
- [x] Build live admin batch/code list with pagination, server-side filters, status labels, empty/loading/error states, and masked sensitive values by default.
- [x] Implement enable/disable with permissions, confirmation, status transition audit, and immediate verification effect.
- [x] Implement deletion/revocation per approved retention policy. Ensure it cannot erase verification history or create accidental code reuse.
- [x] Implement privileged code-detail/batch-detail access with raw-code disclosure only when policy permits.
- [x] Write concurrency and boundary tests: 1, 5,000, 0, 5,001, decimal, text, duplicate/collision retry, simultaneous generation, disabled/revoked states, and unauthorized access.

### Acceptance criteria

- An authorized admin can generate exactly 1–5,000 unique codes in a batch without providing a product.
- Database enforcement prevents duplicated codes even under concurrent requests.
- Disable/enable/delete-or-revoke actions are server-authorized, auditable, and reflected in live admin data.
- Product changes have no effect on code validity because codes do not require product associations.
- No UI or logs expose raw codes beyond the approved privileged use case.

## Phase 7 — Mobile-first verification hub and audit trail

**Dependencies:** Phase 6; approved phone, privacy, location, and repeat-scan policies.

### Tasks

- [x] Design and build `/verify` for small screens first. Include scratch code, required mobile number, clear validation, privacy notice/consent language, submit state, and result state.
- [x] Implement a server-side verification endpoint/action that normalizes/validates phone input, rate limits, atomically resolves/consumes code state, writes an event, and returns minimal safe output.
- [x] Make a valid mobile number mandatory. Disable/stop submission on missing or invalid input, but repeat the authoritative validation on the server.
- [x] Add permission-based approximate location capture with transparent status. Record available/denied/unavailable state; do not fail verification merely for lack of location unless a later approved policy changes this.
- [x] Record approved device/client metadata and request correlation. Protect and mask phone/location/device data in admin lists and never expose it on public result pages.
- [x] Implement result treatments for verified, invalid, disabled/revoked, already-verified/review, rate-limited, and system-error outcomes without leaking code inventory or other customer details.
- [x] Build live admin verification-event list/detail with secure filters, pagination, masking, audit context, and empty/loading/error states.
- [x] Test on mobile viewport and physical/realistic touch conditions; test denied location, blocked scripts, slow network, repeat submissions, rate limits, and concurrent verification of one code.

### Acceptance criteria

- A user cannot obtain a verification result without a valid mobile number.
- A valid enabled code is handled atomically and emits a complete audit event.
- Failed, disabled, repeat, and rate-limited requests produce safe outcomes without revealing code existence/inventory details.
- The admin can see the permitted verification audit data (time, outcome, safe code/batch reference, masked mobile, location status/approximation, device/client metadata) from real records.
- The flow works accessibly and independently of the futuristic/3D visual layer.

## Phase 8 — XLS/PDF exports and operational console

**Dependencies:** Phases 2 and 6; export field/retention policy.

### Tasks

- [x] Define the permitted export schema: code/batch fields, status, dates, and whether any raw code or sensitive personal data is allowed. Default to data minimization.
- [x] Build a server-authorized, filter-aware export job flow for XLS and PDF. Exports must query the full selected scope, not the currently visible client page.
- [x] Add export status/progress, download state, expiry/protected delivery approach, error handling, and export audit log.
- [x] Build the admin overview from real operational queries only: visible product count, code/batch status, verification activity, and export status where real data exists. Otherwise show a polished empty state.
- [x] Add responsive data-table behavior, saved-safe filters if requested, keyboard navigation, and destructive-action confirmation patterns.
- [x] Test large authorized selections, no-result exports, permission failures, job failure/retry, expired downloads, and field-masking rules.

### Acceptance criteria

- An authorized admin can export selected permitted code/batch data to both XLS and PDF.
- Exports are complete for the requested server-side scope, auditable, protected, and minimize raw/sensitive data.
- The console contains no fabricated totals, charts, recent activity, or example rows.
- Export errors and zero-result exports are understandable and recoverable.

## Phase 9 — Real-time, security, performance, and accessibility hardening

**Dependencies:** Phases 2–8.

### Tasks

- [x] Add authorized Supabase real-time subscriptions or safe polling/revalidation to active admin lists, batch status, verification-event activity, and export progress. Confirm subscriptions obey RLS.
- [x] Add cache invalidation/revalidation coverage for every product visibility and content mutation.
- [x] Conduct security review: RLS, role escalation, direct API calls, export authorization, code enumeration, brute force/rate limits, secret exposure, XSS, CSRF/session protections, Cloudinary upload abuse, and log redaction.
- [x] Conduct performance profiling on low/mid-range mobile and desktop devices; optimize image transformations, script weight, 3D fallbacks, long tables, and Core Web Vitals.
- [x] Conduct WCAG 2.2 AA-oriented review: keyboard-only, focus order, form errors, color contrast, tables, dialog behavior, screen-reader labels, image descriptions, reduced motion, zoom/reflow, and mobile touch targets.
- [x] Run resilience tests for Supabase/Cloudinary unavailability, partial mutations, delayed real-time delivery, offline/slow network, and empty database.
- [x] Add monitoring/alerts for verification failure spikes, rate-limit spikes, generation failures, Cloudinary failures, auth failures, export failures, and unexpected server errors without logging raw sensitive values.

### Acceptance criteria

- Real-time updates are useful, authorized, and do not leak records across roles/users.
- Public data changes are visible promptly and hidden data never remains publicly cached beyond the defined revalidation approach.
- Security testing finds no privilege bypass, code enumeration path, secret/client-data leak, or unmasked sensitive logging.
- Verification remains usable on mobile and does not depend on advanced graphical effects.
- Accessibility and performance issues discovered in the review have owners and are resolved or explicitly accepted before launch.

## Phase 10 — Release readiness and production launch

**Dependencies:** Phases 0–9 complete; all blocking business decisions approved.

### Tasks

- [x] Complete end-to-end tests for public browsing, product visibility, product admin, media upload, code batch generation, status transitions, verification with mandatory phone, audit visibility, and XLS/PDF export.
- [x] Run the PRD Section 15 release checklist and attach evidence for every completed item.
- [x] Validate production environment variables, RLS policies, database migrations, Cloudinary restrictions, redirect URLs, security headers, monitoring, backups/recovery, and retention/cleanup jobs.
- [x] Confirm support email/phone, marketplace links, privacy notice, and content are approved and live.
- [x] Perform a no-dummy-data audit across source, fixtures, seed scripts, screenshots, public routes, admin routes, and analytics/demo components. Remove or isolate development-only test data from production.
- [x] Conduct a controlled smoke test with an authorized admin and a non-admin/public session; do not use production scratch-code data outside approved procedures.
- [x] Document runbooks for code incident response, verification abuse, disabled/revoked codes, export failure, media failure, rollback, and access revocation.

### Acceptance criteria

- Every P0/P1 security, data-integrity, accessibility, and verification issue is resolved or explicitly approved by the responsible owner.
- Production contains no dummy or demo product/catalog/admin data.
- Verification code uniqueness, authorization, mobile requirement, audit capture, status controls, and exports are demonstrated in the production-like environment.
- A rollback and incident-response path is documented and accessible to the operating team.

## Definition of done for each task

A task is complete only when its code/configuration is implemented, reviewed, validated in its intended environment, protected by appropriate automated/manual tests, documented where operational knowledge is needed, and confirmed not to introduce dummy data or unprotected sensitive data. A visually complete screen without real data integration, validation, authorization, error states, and acceptance evidence is **not** done.
