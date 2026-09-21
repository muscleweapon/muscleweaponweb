# Muscle Weapon Website — Product Requirements Document

## 1. Document purpose

Build the initial Muscle Weapon supplement website as a polished, athlete-first product experience with a separate, powerful administrative interface. The public site must present only administrator-approved products and let customers authenticate products through a secure verification hub. The admin site must manage catalog content and verification codes from live Supabase data.

This document is implementation-ready. It captures the supplied requirements without inventing product claims, inventory, pricing, fulfilment, payment, legal, or business-policy details that have not been provided.

## 2. Product summary

Muscle Weapon is a supplement brand whose supported catalog categories are:

1. Protein
2. Mass gainer
3. Multivitamins
4. Calcium
5. Omega gold fish oil
6. Creatine
7. Pre-workout

The website has two deliberately distinct experiences:

- **Public user experience:** a premium, futuristic product discovery and product-authentication destination for athletes.
- **Admin experience:** an authenticated operational console for managing products, visibility, media, verification codes, audits, and exports.

The visual direction is “athlete technology from 2050”: immersive but purposeful 3D depth, restrained motion, high contrast, and sharp tactical energy. Use the supplied Muscle Weapon logo—the white athlete silhouette, wordmark, and rifle motif on black—as the branding reference. It must be displayed respectfully and never distorted, recolored incompatibly, or used as an interactive control without accessible text.

## 3. Goals and success criteria

### Goals

- Make Muscle Weapon feel unmistakably premium, athletic, modern, and visually ahead of typical supplement storefronts.
- Give customers a fast, trustworthy way to check a scratch-code product verification record.
- Give authorized administrators confident, real-time control of what is publicly visible and how verification codes are operated.
- Keep products, code inventory, and audit records live in Supabase; store product images in Cloudinary.
- Avoid fabricated products, dashboard metrics, reviews, verification events, or other dummy records in all production-facing screens.

### Success criteria

- A public visitor can find visible products by category, open a product detail page, and reach verification on desktop or mobile.
- A customer cannot complete verification without a valid mobile number.
- An admin can generate 1–5,000 unique, product-independent codes in one approved batch; view, disable, delete (where permitted), and export them as XLS and PDF.
- Every verification attempt is auditable with its outcome, time, submitted code reference, mobile-number handling, available approximate location, and device/client metadata.
- Admin product changes and visibility changes are reflected in the public site without manually maintained placeholder data.
- Screens clearly represent empty, loading, unauthorized, and error states.

### Out of scope for this release

- Checkout, payment processing, cart, shipping, and order management.
- Inventory, tax, distributor, loyalty, subscription, prescription, or returns workflows.
- Medical advice, efficacy claims, clinical claims, or product certification claims not supplied by a content owner.
- A consumer account/profile system beyond the phone number required by the verification flow.
- Automatic code-to-product binding. Codes are intentionally product-independent; an optional product association may be recorded only if an administrator deliberately adds one in a later release.

## 4. Users and authorization

| Actor | Primary needs | Access |
| --- | --- | --- |
| Public visitor/customer | Browse visible products, obtain support or marketplace links, verify a scratch code | Public content and verification submission only |
| Admin | Manage products, product visibility, images, codes, exports, and verification records | Authenticated admin console |
| Super admin (recommended role) | Manage admin roles and sensitive destructive actions | All admin actions, subject to audit |

No client-side role check is sufficient. Supabase Row Level Security (RLS), privileged server-side actions, and protected admin routes must enforce authorization.

## 5. Information architecture

### Public routes

- `/` — immersive homepage with brand entry, category discovery, selected visible products, verification call-to-action, support links.
- `/products` — visible-product catalog, category filter, search only when backed by live product data.
- `/products/[slug]` — visible product details.
- `/verify` — scratch-code verification hub.
- `/verify/result/[id]` — a safe, customer-facing result for the current verification event; it must not expose other customers’ mobile numbers or internal records.
- `/support` — supplied customer-support contact details and marketplace destinations.

Public content must render only published/visible product records returned from an authorized public read path. Hidden, draft, archived, deleted, disabled, or otherwise non-public records must never be exposed by direct URL, page source, API response, cache, image alt text, sitemap, or search index.

### Admin routes

- `/admin/login`
- `/admin` — live operational overview based only on real records; it may show empty/no-activity states rather than invented metrics.
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/verification-codes`, `/admin/verification-codes/batches/[id]`
- `/admin/verifications`, `/admin/verifications/[id]`
- `/admin/settings` — only for implemented controls, such as support/contact content and role settings if included.

## 6. Visual and interaction requirements

### Brand and visual system

- Base the interface on near-black surfaces, white logo treatment, steel/graphite depth, and one configurable electric accent color. Do not infer a brand color not present in approved assets; make the accent a design token awaiting approval.
- Preserve high contrast and readable text. “Futuristic” must not reduce legibility or make normal tasks hard to perform.
- Use condensed/display typography for short impact moments only, paired with a highly legible body font. Confirm licensing before use.
- Use a grid, large product renders, layered cards, spec-panel styling, subtle glows, translucent technical overlays, and controlled perspective to convey 3D depth.
- Prefer performant CSS transforms, WebGL/Spline/R3F only where necessary, and progressive enhancement. Provide a flat but premium fallback if advanced rendering fails.
- Respect `prefers-reduced-motion`; remove non-essential parallax, auto-rotation, particle movement, and large transitions for users who request reduced motion.
- Ensure the rifle graphic is brand artwork, not a functional weapon depiction or purchase prompt.

### Public UX

- The homepage must establish the brand in the first viewport, give a clear route to products and verification, and keep the logo recognizable.
- Categories should feel like athletic “systems” while retaining clear textual labels and keyboard-accessible controls.
- Product cards must surface only data that exists: image if available, name, category, price if set, and availability/visibility state appropriate for public display. Do not fabricate ratings, stock counts, badges, discounts, testimonials, or nutrition facts.
- Product details must provide administrator-entered description, specifications, nutrition facts, price, images, and relevant category only when present. Omit unavailable sections rather than showing filler.
- External Amazon and Flipkart links must be visibly external and use the supplied destinations. Their inclusion must not imply current stock, pricing, or endorsement beyond the supplied links.

### Admin UX

- The admin console should feel more capable than the public site: dense-but-readable live data views, strong system feedback, keyboard-friendly tables, filters, bulk actions, and a clear audit context.
- Use unmistakable state colors and labels for published/hidden product status and code status. Never use color alone to convey status.
- High-risk actions (disable, delete, export, role change) must state the scope and result, require appropriate confirmation, and log the actor/action.
- Every dashboard metric and chart must be computed from live data; when no data exists, show a meaningful zero/empty state with no illustrative fabricated values.

## 7. Functional requirements

### 7.1 Product catalog and visibility

1. An admin can create, edit, and delete a product.
2. A product supports at least: name, URL slug, category, price, description, specifications, nutrition facts, Cloudinary image references, public visibility/publish state, and audit timestamps. Fields not supplied must remain blank/omitted, not filled with demo values.
3. Category selection is constrained to the seven categories in Section 2. Additive categories require an explicit product decision and migration.
4. Price must use a defined currency code and non-negative minor-unit/decimal-safe representation. Currency and display policy require configuration rather than assumption.
5. An admin can explicitly control whether each product is public. Changes must update public read results promptly through the selected cache/revalidation strategy.
6. A hidden, draft, or deleted product must not be discoverable in the public UI. Its media URL must not be returned in a public product API response.
7. Product image upload goes directly or securely via a signed Cloudinary flow. Persist only the required Cloudinary asset metadata (for example, public ID, secure URL, width, height, format, alt text) in Supabase.
8. Before replacing or deleting media, the interface must explain whether the Cloudinary asset will be retained or removed. Orphan cleanup must be handled deliberately, not silently.
9. Product deletion must be policy-driven. Prefer soft deletion/audited archival when a product is referenced by operational history; never break verification history to remove catalog content.

### 7.2 Verification hub

1. The verification hub accepts a customer-entered scratch code and a mobile number. Mobile number entry is mandatory before any verification result is disclosed.
2. Validate code format and normalize the mobile number before submission. The selected phone normalization library/strategy must be documented and tested; do not assume a country or silently strip meaningful digits.
3. Provide a privacy notice explaining what is recorded for fraud/authenticity purposes before submission. Any consent/notice wording requires business/legal approval.
4. The backend verifies the code atomically. It must not reveal whether a code exists before the mobile-number requirement and server-side controls are satisfied.
5. A valid, enabled, unconsumed code returns an authenticated success result and records a verification event.
6. A code that is invalid, disabled, deleted/revoked, or already verified returns an accurate, non-sensitive outcome. The UI must avoid exposing code inventory or other customers’ data.
7. The exact repeat-verification policy is a required business decision. Until confirmed, the implementation must record every attempt and present a conservative “already verified / review details” state rather than treating a previously used code as new.
8. Capture approximate location only with appropriate browser permission and transparent disclosure. If denied, unavailable, or inaccurate, record that state; verification must not fail merely because location is unavailable unless a future policy explicitly requires it.
9. Record device/client metadata necessary for audit and fraud analysis, such as user-agent-derived browser/OS/device category, IP-derived network context only when collected server-side under an approved privacy policy, and request correlation ID. Do not claim exact location/device identity beyond the available signal.
10. Rate-limit verification attempts by an appropriate combination of code, mobile number, IP/session, and device signal. Add abuse-resistant error messages and server-side monitoring.
11. Verification results must be accessible, mobile-first, and useful without 3D graphics.

### 7.3 Verification-code administration

1. Only an authorized admin can generate codes. A requested batch size is an integer from 1 through 5,000 inclusive.
2. Each generated code is globally unique across current and historical code records. Generate cryptographically secure random values on the server, enforce a database uniqueness constraint, and retry only safely on collision.
3. Codes are product-independent. Batch creation must not require a product ID and product management must not mutate a code’s validity.
4. Each generation action creates a batch record with requested count, successful count, actor, time, code format/version, status, and any failure details.
5. The admin can list and filter batches/codes by status, batch, dates, and verification state using live data.
6. The admin can disable/enable an eligible code. Disabled codes cannot verify. All transitions must record actor, time, reason when supplied, and prior/new status.
7. The admin can delete an unverified code only if the finalized retention policy permits it. A deletion must be auditable, revoke the code, and never erase verification audit records. For verified codes, offer revocation/archival instead of destructive deletion.
8. The admin can export an authorized selection or batch as XLS and PDF. Exports must contain only the permitted code fields, use a generated-at timestamp and scope, and be logged. The exact inclusion of raw codes after verification should be minimized and policy-controlled.
9. Export generation must run server-side or from authorized data, never from an incomplete paginated browser table. Protect download URLs, expire them, and prevent unauthorized sharing where the platform supports it.
10. The admin can inspect verification audit history, including outcome, time, code/batch reference, normalized/masked mobile information, location availability/approximation, and device/client metadata. By default, sensitive values should be masked in list views.

### 7.4 Support and outbound links

- Display the supplied support email `muscle.weapon@gmail.com` and phone number `8816090309` in a responsive, accessible support area. Make them administrator-configurable if a settings system is implemented; otherwise keep them in a clearly identified content configuration.
- Include the supplied Amazon and Flipkart URLs as external links:
  - Flipkart: `https://www.flipkart.com/search?q=muscle%20weapon&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`
  - Amazon: `https://www.amazon.in/l/27943762031?ie=UTF8&marketplaceID=A21TJRUUN4KGV&product=B0B5WVQ3SN&me=A1YVXEMI1WMBFS`
- Open external destinations safely (`rel="noopener noreferrer"` where applicable) and label them for assistive technologies.

## 8. Data model expectations

The exact SQL types/names may differ, but the following entities and relationships are required.

| Entity | Required fields / behavior |
| --- | --- |
| `profiles` | Supabase auth user reference, role (`admin` / `super_admin` or equivalent), created/updated timestamps. Role changes are audited. |
| `products` | ID, name, unique slug, enum category, price amount/currency when set, description, specifications JSON/text, nutrition facts JSON/text, visibility/publish status, soft-delete/archive state, timestamps, creator/updater. |
| `product_images` | ID, product ID, Cloudinary public ID and secure URL, dimensions/format if available, alt text, sort order, timestamps. |
| `verification_code_batches` | ID, requested/generated count, code scheme/version, status, timestamps, actor, optional operational note. No product required. |
| `verification_codes` | ID, batch ID, unique stored code representation, status (`active`, `disabled`, `revoked/deleted`, as policy defines), generation time, transition audit references. Avoid returning raw code values broadly. |
| `verification_events` | ID, code ID/reference when resolvable, submitted-code safe fingerprint/reference, outcome, event time, mobile number protected/normalized representation, location status/approximate fields, device/client metadata, request correlation, rate-limit result. Must preserve failed attempts without leaking secrets. |
| `admin_audit_log` | actor, action, entity/type, entity ID, before/after safe values, reason if given, timestamp, request correlation. |
| `export_jobs` | requester, scope/filter, format (XLS/PDF), status, generated timestamp, protected file reference/expiry, error details when failed. |

### Data integrity rules

- Enforce a database unique constraint on the canonical code storage value, not merely application memory.
- Use a transaction/RPC for code generation and verification state transitions. Two simultaneous requests must not both successfully consume the same code.
- Store raw verification codes only if operationally necessary; otherwise store a secure lookup representation (for example, keyed hash) and design exports accordingly. The chosen method must still allow authorized raw-code export if the business requires it.
- Encrypt or otherwise protect mobile-number data at rest and in transit; restrict raw values to necessary server-side processing. Exports and admin lists must default to masking.
- Treat audit records as append-only. Corrections should add an event/audit entry, not rewrite history.
- Time values use UTC at rest and are formatted for users with an explicit locale/timezone strategy.

## 9. API and real-time expectations

### Public API/BFF operations

- `GET /products` — returns only public visible products; supports safe filtering by supported category.
- `GET /products/:slug` — returns a single public visible product or an indistinguishable not-found response.
- `POST /verification/attempt` — validates the phone and code, applies rate limiting, records an event, and returns a minimal result payload.

### Admin operations

- Authenticated create/read/update/archive products and product images.
- Signed Cloudinary upload signature/credential issuance, with strict resource/type/folder and size/format constraints.
- Batch code generation (1–5,000), status transitions, audited deletion/revocation, list/query, and job-based XLS/PDF export.
- Read-only verification event/audit queries, filtered and paginated.

### Real-time behavior

- Supabase is the system of record for application data. Admin pages must query live data and may subscribe to authorized real-time changes for active lists, status updates, export progress, and operational counters.
- Revalidate/invalidate public catalog caches after a product visibility/content change. Real-time UI must not bypass RLS.
- Use pagination, server-side filtering, and indexed queries for codes/events; never load all records into the browser.

## 10. State, validation, and resilience

Every feature must define and implement the following rather than relying on undefined or placeholder UI:

| State | Requirement |
| --- | --- |
| Loading | Visible skeleton/progress state that preserves layout and is announced appropriately. Do not show invented data beneath it. |
| Empty | Explain that no real records are available and offer an authorized next action (for example, “Create first product” in admin). |
| Validation | Inline, specific, accessible errors before submission where possible; authoritative server validation on every mutation. |
| Error | Clear recovery state with retry when safe; log unexpected failures with correlation IDs; never reveal secrets, code existence, or stack traces. |
| Unauthorized | Public site remains usable; protected routes return safe unauthorized/not-found responses and offer a legitimate sign-in path where appropriate. |
| Offline/slow network | Do not claim completion until confirmed by the server. Preserve safely entered non-sensitive form data only where permitted. |

Key validation rules:

- Batch count: required integer, 1–5,000 inclusive; reject decimals, non-numeric input, zero, negatives, and values above the limit.
- Product: required name, unique well-formed slug, allowed category, valid non-negative price if supplied, bounded text/JSON payload sizes, configured image count/type/size limits.
- Code: required, trimmed/canonicalized according to the defined format, server-side validity only.
- Mobile number: required, parsed/normalized by the selected phone strategy, rejects invalid entries; never rely solely on an HTML input pattern.
- Rich content/specifications/nutrition facts: sanitize output and validate structured payloads to prevent XSS or malformed data.

## 11. Security, privacy, and compliance requirements

- Use Supabase Auth for admin authentication with secure session handling. Require strong sign-in controls; add MFA for privileged roles if available in the selected setup.
- Apply RLS to every exposed table, view, storage reference, and real-time channel. Public reads are limited to approved product data only. Verification events, codes, raw code data, exports, and admin audits are never public.
- Keep Supabase service-role credentials and Cloudinary API secrets on the server only. Do not ship them to the browser or commit them to source control.
- Use server-side authorization for every admin mutation and export; check role and record an audit event.
- Add CSRF/session protections appropriate to the chosen framework, secure cookies, HTTPS-only deployment, security headers, input validation, output encoding, and dependency monitoring.
- Rate limit admin-sensitive actions and verification attempts. Add pagination/query caps and export-size limits.
- Define a retention and deletion policy for mobile numbers, location/device metadata, failed verification events, exported files, and revoked/deleted codes before production launch. This is a required business/legal decision, not a placeholder to ignore.
- Obtain approved privacy/consent copy before collecting location or device/network data. Location must be optional unless requirements are later changed with legal review.
- Provide access controls and logs sufficient to investigate fraud without exposing customer personal data unnecessarily.

## 12. Performance, accessibility, and responsiveness

- Mobile is a first-class experience. The verification flow must be easy to complete one-handed, with large controls, input affordances, a visible required-mobile indication, and no dependency on hover or complex 3D effects.
- Support current mobile and desktop browsers agreed during implementation. Test common narrow, medium, and wide breakpoints; do not hide critical actions off-screen.
- Use responsive images, Cloudinary transformations, lazy loading, and loading priorities for hero assets. Do not make the verification workflow wait for immersive assets.
- Set a performance budget during implementation. Avoid shipping excessive video, uncompressed 3D models, or blocking animation libraries. Measure Core Web Vitals on representative devices.
- Meet WCAG 2.2 AA goals for contrast, keyboard navigation, visible focus, semantic forms, image alt text, labels/errors, skip navigation, modal behavior, and reduced motion.
- Ensure 3D/perspective effects never carry exclusive information; text alternatives and conventional navigation remain available.

## 13. Architecture and delivery guardrails

- Use a component-based web application with separate public and protected admin route boundaries.
- Supabase provides authentication, PostgreSQL data, row-level authorization, and approved real-time subscriptions. Database migrations and RLS policies are version controlled.
- Cloudinary provides product image hosting and transformations. The application owns the mapping from products to Cloudinary asset metadata.
- Server/API boundary owns secret-dependent operations, permission checks, code generation/verification transactions, exports, audit writes, and privacy-sensitive transformations.
- Environment configuration includes no production secrets in source. Provide an `.env.example` with variable names only and setup documentation.
- Use TypeScript/domain validation schemas (or equivalent) shared across UI and server when possible; database constraints remain authoritative.
- Add observability for authentication failures, verification abuse, code generation failures, export job failures, Cloudinary upload failures, and public catalog errors. Do not log raw codes or full mobile numbers.

## 14. Required decisions before production release

These are deliberate unresolved decisions; implementation must expose/configure them rather than silently inventing answers.

1. Product display currency and whether price is mandatory.
2. Verification-code format/length/prefix and whether raw codes must remain retrievable after generation.
3. Policy for repeat scans of a previously verified code and for a disabled/revoked code.
4. Retention/deletion rules for code records, mobile numbers, audit events, location/device metadata, and exports.
5. Applicable countries, mobile-number validation/default country behavior, privacy notice, and consent language.
6. Admin invitation/onboarding and MFA policy.
7. Exact product-fields schema for nutrition facts and specifications, and approved product/claim content.
8. Cloudinary folder, transformation, moderation, and asset-retention rules.
9. Whether product associations to codes are ever needed in a later release; the current build must not require one.

## 15. Release acceptance checklist

- [ ] Public routes contain no dummy products, reviews, metrics, offers, or unverifiable claims.
- [ ] Admin routes display only live Supabase records and reliable empty/loading/error states.
- [ ] Product CRUD, Cloudinary media handling, and public visibility control are protected and tested.
- [ ] Public catalog returns only visible products, including on direct URLs and API/cache paths.
- [ ] Verification rejects absent/invalid mobile numbers and records approved audit data.
- [ ] Code generation enforces 1–5,000 inclusive and global uniqueness under concurrent requests.
- [ ] Codes remain product-independent and work without a product association.
- [ ] Disable/enable/delete-or-revoke flows follow final policy, are authorized, and are audited.
- [ ] XLS/PDF export is authorized, complete for its selected scope, and audited.
- [ ] RLS and server-side authorization have been tested with unauthenticated, unauthorized, admin, and super-admin cases.
- [ ] Mobile, keyboard, reduced-motion, error, and empty-state testing is complete.
- [ ] No secrets, raw code values, or full mobile numbers leak to client logs, analytics, or unauthorized responses.
