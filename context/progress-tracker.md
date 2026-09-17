<!-- Progress tracker: live build status — update this after every session -->

# Progress Tracker

**Last updated:** 2026-09-17
**Current phase:** Phase 1 (Foundation) — app shell, design system and accessibility baseline built; auth and backend still to come.
**Overall status:** Project scope, architecture, build sequencing, code standards, and UI design system are all decided and documented. Documentation lookups going forward always go through the Context7 connector (see `library-docs.md` → Documentation Lookup Rule), not general web search — library specifics in `library-docs.md` are still marked as unverified against current docs and should be confirmed via Context7 before each phase that needs them. Next session should start on Phase 1 (Foundation: Clerk auth, base app shell, Hono/Neon scaffold).

---

## Completed

### Planning
- [x] Defined project scope: web-only event-card creation + QR check-in tool (weddings, send-offs, corporate events, birthdays)
- [x] Confirmed tech stack: React + TS (strict) + Tailwind + shadcn/ui, Konva canvas, Hono on Cloudflare Workers, Neon (single shared DB, row-level ownership), Clerk auth
- [x] Confirmed integrations: `@lglab/react-qr-code` for QR, `react-pdf` for PDF export, NextSMS for WhatsApp distribution, Lipa Namba (manual/offline) for payment
- [x] Decided data-ownership model: single shared Neon database, `user_id`-filtered rows — no per-tenant database split
- [x] Decided QR check-in model: dedicated PWA route in the same React app, offline-first local queue with sync-on-reconnect, conflict detection + organizer notification on double-scan
- [x] Decided tier model: VIP/VVIP (seating priority, exclusivity styling) and Single/Double (guest count per card) are independent axes, tier does not affect app behavior — design-only
- [x] Decided payment flow: per-event fee, Lipa Namba instructions shown in-app, confirmation sent externally via WhatsApp to a support number, event manually activated by a super admin (no automated payment API)
- [x] Sequenced the build into 6 phases (Foundation → Template/Card Engine → Events & Guests → Distribution → Payments → Check-In)
- [x] Wrote all context files: `project-overview.md`, `architecture.md`, `build-plan.md`, `code-standards.md`, `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`, `library-docs.md`, this tracker

## In Progress

- [ ] Feature 2 — App shell, design system & accessibility baseline: built on `development` per spec 0002, awaiting `/check verify` (Alpha workflow). `lint`, `format`, `test` (10 jsdom tests) and `build` all pass; the Playwright shell spec (AC-8) is authored but has not been executed yet, since browser binaries could not be installed in the build sandbox.

## Up Next

- [ ] Start Phase 1 (Foundation): scaffold `worker/` (Hono), wire `@hono/clerk-auth`, connect Neon, stand up the `sidebar-07`-based app shell in `src/`.
- [ ] Confirm the exact Neon client package for the Workers runtime (e.g. `@neondatabase/serverless`) before writing the first query.
- [ ] Confirm the offline-queue approach for the check-in PWA (e.g. Workbox + IndexedDB vs a lighter hand-rolled queue) before Phase 6, but decide early enough that Phase 1's PWA manifest/service-worker scaffolding accounts for it.
- [ ] Set up Clerk, Neon, and NextSMS accounts/credentials ahead of the phases that need them, so implementation isn't blocked on account provisioning.
- [ ] Author the first few templates (one per event type × tier combination) once the Konva editor's design-JSON shape is settled in Phase 2 — needed to unblock any real testing of the template gallery.

## Blocked

- [ ] None currently.

---

## Known Issues

_None yet — no code written._

---

## Decisions Made

- **Single shared Neon database, not multi-tenant** — row-level ownership (`user_id`) is sufficient; no per-organizer database isolation needed at this scale.
- **QR check-in is the only attendance mechanism** — deliberately no RSVP/guest-list management feature; this is a design-and-send product plus a door-count tool, not an event-planning suite.
- **QR mode (unique-per-guest vs general-per-event) is chosen per event/card and locked after distribution** — prevents a data-integrity gap where a mode change invalidates already-sent cards.
- **Tier (VIP/VVIP/Single/Double) is purely a design/template concern** — no differential logic anywhere else in the app (no separate check-in queues, no pricing logic tied to tier itself).
- **Lipa Namba is manual, not an API integration** — organizer pays externally and confirms via WhatsApp to a support number; a super admin performs the actual activation in-app. No payment webhook, no automated status transition.
- **Check-in PWA is a route within the main app, not a separate deployable** — simpler to maintain, and it can reuse the same Clerk session/auth.
- **Offline-first is a hard requirement for check-in** — scans always write to a local queue first; the network call is never on the critical path of recording a scan. Conflicting duplicate scans are surfaced to the organizer, never silently auto-resolved.
- **UI system is shadcn/ui on the provided OKLCH token set**, using the `sidebar-07` block (collapsible sidebar + breadcrumb header + content area) as the base app layout.
- **TypeScript strict mode, PascalCase components, ESLint + Prettier** across the whole codebase — no fork-safety constraint since this is a from-scratch build with no upstream.
- **All library/API documentation lookups go through the Context7 connector, not general web search** — the one exception is NextSMS, which isn't indexed on Context7 and is instead checked by fetching its known Postman doc URL directly.

---

## Session Notes

**2026-09-09 (planning session)**
- Defined full project scope and confirmed it's a single-target web app (no separate mobile/desktop target).
- Walked through tech stack (React/Tailwind/shadcn, Hono/Cloudflare Workers, Neon, Clerk, Konva) and integrations (QR via `@lglab/react-qr-code`, PDF via `react-pdf`, WhatsApp via NextSMS, payments via Lipa Namba manual flow).
- Clarified the check-in model in detail: dedicated check-in mode screen (not general staff scanning), QR mode is selectable per event (unique-per-guest or general), organizer needs both a live dashboard and a post-event report, offline scanning with local-queue sync and conflict notification on double-scan.
- Clarified tier semantics: Single/Double = guest count per card; VIP/VVIP = seating priority/exclusivity styling; the two axes are independent and neither affects app behavior.
- Clarified payment flow end-to-end: per-event fee unlocks card creation/sending for that event; Lipa Namba instructions + a `wa.me/<support_number>` link are shown in-app; the actual payment confirmation (screenshot/SMS text) is sent via WhatsApp outside the app; a super admin manually activates the event afterward.
- Confirmed design tokens (OKLCH color set provided) and layout (shadcn `sidebar-07`: collapsible sidebar + breadcrumb header + content area), with shadcn/ui as the component library and no components built yet.
- Confirmed code conventions: TypeScript strict mode, PascalCase, ESLint + Prettier, Vitest + Playwright + Jest available, no fork-safety constraint (greenfield, no upstream).
- Proposed and confirmed a 6-phase build sequence: Foundation → Template & Card Design Engine → Events & Guests → Distribution → Payments (Lipa Namba) → Check-In & Attendance.
- Wrote all eight context files plus this tracker from scratch.

**Next session should:**
- Start Phase 1 exactly as sequenced in `build-plan.md` — don't skip ahead to the card editor before auth/data-ownership scaffolding exists, since every later table depends on the `user_id` ownership pattern established there.
- Use the **Context7 connector** for every library documentation lookup from here on — Clerk, Neon, Hono, Konva, `@lglab/react-qr-code`, `react-pdf`, shadcn/ui — never a general web search (see `library-docs.md` → Documentation Lookup Rule and `code-standards.md`). NextSMS is the one exception: it isn't indexed on Context7, so re-confirm its current WhatsApp API request/response shape by fetching `https://documenter.getpostman.com/view/1679195/2sAYkDP1XN` directly before implementing Phase 4.
- Re-confirm current `@lglab/react-qr-code` and `react-pdf` APIs via Context7 before Phase 2/4 implementation, since neither has been checked against current docs yet in this planning session.
- Confirm the Neon Workers-runtime client package and the super-admin role modeling approach via Context7 before Phase 1, per the open items flagged in `library-docs.md`.
