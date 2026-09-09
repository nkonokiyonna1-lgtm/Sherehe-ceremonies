<!-- Library docs: integration notes for third-party libraries/APIs used in this project -->

# Library Docs

Integration notes for each third-party library/API this project depends on. Treat every snippet here as a starting point, not a guarantee — vendor APIs move; re-verify against current docs before implementing the phase that needs it (see `progress-tracker.md` → Up Next / Session Notes for which checks are still outstanding).

---

## Clerk (Auth)

- Use `@clerk/clerk-react` on the client for sign-in/sign-up UI and session hooks.
- On the worker, use `@hono/clerk-auth` middleware (pulls in `@clerk/backend`, Workers/V8-isolate compatible) — do not hand-roll JWT/JWKS verification.
- The middleware exposes the verified session/user on the Hono context; every route touching owned data (`events`, `cards`, `guests`, `checkins`, `payments`) reads `user_id` from this context, never from the request body (see `architecture.md`).
- **Super-admin role:** model as a Clerk custom role/claim (e.g. `org_role` or a public metadata flag) rather than a separate app-level table — confirm Clerk's current recommended pattern for a single non-multi-tenant app (this project has no Clerk Organizations concept, just individual users, so the "super admin" flag is likely public/private metadata on the user, not an org role — verify before building Phase 5).
- Env vars: `CLERK_SECRET_KEY` (worker-only), `VITE_CLERK_PUBLISHABLE_KEY` (client-safe).

---

## Neon (Database)

- Single shared Postgres database — no per-tenant project provisioning (unlike a multi-tenant silo model). One `NEON_DATABASE_URL` worker secret.
- Confirm the exact Postgres client for the Workers runtime before Phase 1 — `@neondatabase/serverless` is the commonly recommended driver for edge/Workers environments, but confirm current package name/version against Neon's own docs rather than assuming.
- Whether to use a query builder/ORM (e.g. Drizzle) on top of the raw driver is not yet decided — confirm before Phase 1's schema work; either way, all queries are parameterized and live only in `worker/`.
- Use standard `ALTER TABLE ADD COLUMN` migrations for schema changes; no per-tenant migration runner needed since there's only one database.

---

## Hono on Cloudflare Workers

- `worker/` is a standard Hono app; routes grouped by resource (`worker/routes/events.ts`, `worker/routes/cards.ts`, `worker/routes/checkins.ts`, `worker/routes/payments.ts`, `worker/routes/distribution/whatsapp.ts`).
- `@hono/clerk-auth` middleware runs before any route touching owned data.
- Deploy via `wrangler`; all secrets set with `wrangler secret put`, never committed, never `VITE_`-prefixed.
- Return `{ success, data?, error? }` consistently (see `code-standards.md`).

---

## Konva (`react-konva`)

- Each template stores its base design as serialized Konva shape data (JSON) — text, image, and shape nodes with metadata marking which fields are organizer-editable vs. fixed.
- A `Card` stores the organizer's edited copy of that JSON (positions/text/colors changed within the editable regions), not a diff against the template.
- Confirm the current recommended pattern for exporting a Konva `Stage` to an image (`stage.toDataURL()` / `toImage()`) before wiring PDF export (Phase 4) and WhatsApp image sending (Phase 4) — both need a rendered raster of the finished card.
- Tier-specific visual treatment (VIP/VVIP exclusivity styling) lives entirely inside each template's own Konva JSON — no app-level logic branches on tier.

---

## `@lglab/react-qr-code`

- Renders a QR code from a string payload (the card/guest's QR token) as an SVG/canvas component.
- Confirm current prop names (size, value, error-correction level, etc.) against the package's current README before first use — do not assume standard `qrcode.react`-style props without checking, since this is a less common package.
- The encoded payload should be a stable, non-guessable token (not a raw sequential id) — generate via a secure random string, not an incrementing counter, since check-in security depends on it not being easily forged.
- Same QR component/sizing is reused across the card preview, the WhatsApp-sent image, and the PDF export (see `ui-rules.md`) — don't re-implement QR rendering three times.

---

## `react-pdf` (`@react-pdf/renderer`)

- Used to compose a downloadable PDF from the finished card — likely by embedding a rasterized export of the Konva stage as an image inside a `react-pdf` `<Document>`/`<Page>`, rather than re-implementing the card layout in `react-pdf`'s own primitives.
- Confirm current `@react-pdf/renderer` API (component names, image embedding pattern) before implementing Phase 4 — the package has had breaking changes across major versions historically.
- Provide both an in-app preview (`PDFViewer`) and a download action (`PDFDownloadLink` or a generated blob) per the planned `PdfCardPreview` component (see `ui-registry.md`).

---

## NextSMS (WhatsApp messaging)

- API reference: `https://documenter.getpostman.com/view/1679195/2sAYkDP1XN` — **re-check this before implementing Phase 4**, since it's a Postman-hosted doc that can change without a version bump being obvious.
- Called server-side only, from `worker/routes/distribution/whatsapp.ts` — API key never reaches the client.
- Wrap calls with retry logic; never surface NextSMS's raw error response to the organizer — translate to a human-readable message (see `code-standards.md`).
- Confirm current auth header format, endpoint for sending a WhatsApp message with a media attachment (the rendered card image/PDF link), and rate limits before first use.
- Env vars: `NEXTSMS_API_URL`, `NEXTSMS_API_KEY` (worker-only).

---

## Lipa Namba (Manual/Offline Payment)

- Not an API integration — there is no Lipa Namba SDK or webhook. The "integration" is entirely: display paybill instructions + a `wa.me/<support_number>` link in-app, and let a super admin flip `events.status` to `active` after seeing a payment confirmation in WhatsApp chat outside the app.
- `LIPA_NAMBA_INSTRUCTIONS` and `SUPPORT_WHATSAPP_NUMBER` are config (worker secrets or a simple config table), not hardcoded in the UI — so the paybill number/instructions can be updated without a redeploy.
- No `payments` evidence (screenshot, SMS text) is stored in-app — it lives only in the WhatsApp conversation. The in-app `payments`/`events` record only needs the activation metadata (`activated_by`, `activated_at`), not the proof itself.

---

## shadcn/ui

- Component installs via `npx shadcn@latest add <component>` — see `ui-registry.md` for the full planned list. Install each only when first needed rather than bulk-installing everything upfront.
- Base layout is the `sidebar-07` block — installed once in Phase 1 and extended (not replaced) for Sherehe-specific nav items.
- All theming flows through the CSS variables in `ui-tokens.md`; shadcn's generated `tailwind.config.ts` color mapping should reference those variables, not introduce its own default palette.

---

## PWA / Offline Check-In Queue

- Approach not yet finalized — options include a Workbox-based service worker + IndexedDB queue, or a lighter hand-rolled `localStorage`/IndexedDB queue with a manual `navigator.onLine`/sync-event listener. Confirm the choice before Phase 1's PWA manifest/service-worker scaffolding, since it affects the build tooling (e.g. `vite-plugin-pwa` if going the Workbox route).
- Whatever the mechanism, the rule from `architecture.md` holds regardless of implementation: a scan always writes to the local queue first; the network sync is a secondary step that never blocks the scan-confirmation UI.
- Conflict detection (two devices, same unique QR token, both offline) must be resolved server-side once both queued scans reach `worker/routes/checkins.ts` — the client's job is only to queue and flag "pending sync," not to attempt conflict resolution locally.
