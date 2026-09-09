<!-- Architecture: system shape, boundaries, and invariants that must never be violated -->

# Architecture

## System Shape

```
React (Vite, TS strict, Tailwind + shadcn/ui, Konva canvas)
        │  fetch()
        ▼
Hono API on Cloudflare Workers  (worker/)
        │  Postgres client (Neon serverless driver)
        ▼
Neon Postgres  (single shared DB, row-owned by user_id)
```

Auth: Clerk issues the session; Hono verifies it via Clerk's Workers-compatible middleware on every request that touches owned data.

Messaging: NextSMS WhatsApp API is called server-side only (never from the client) — API keys never reach the browser.

There is **no separate control-plane / tenant-plane split** here (unlike a multi-tenant product) — this is intentionally one database. The isolation mechanism is row ownership, not a separate connection per user.

---

## Client / Server / Agnostic Boundary

- **Client (`src/`)** — React components, Konva editor, Tailwind/shadcn UI, QR rendering, PDF viewing. Never talks to Neon directly. Never holds Clerk secret keys, NextSMS API keys, or Lipa Namba review actions.
- **Server (`worker/`)** — Hono routes, Clerk session verification, Neon queries, NextSMS calls, payment-activation logic. This is the only place allowed to run a database query or call an external API with a secret.
- **Agnostic (`shared/` or `lib/types.ts`)** — TypeScript types/schemas shared between client and worker (event, card, guest, check-in, payment shapes). No side effects, no imports from either the client or worker layer.

Getting this boundary wrong is the most common way to leak a secret into the client bundle or bypass ownership checks — check which layer a change belongs to before writing it.

---

## Data Ownership Model (single shared DB)

- Every table that isn't purely reference data (templates) has a `user_id` (Clerk user id) column identifying the owning organizer.
- **Every query that reads or writes event/card/guest/check-in/payment data must filter by `user_id`**, enforced in the Hono route/middleware layer — never assumed from the client payload.
- Clerk's session-verified user id is the only source of truth for "whose data is this" — never trust a `user_id`/`organizer_id` field sent in a request body.
- Templates are the one shared/reference table with no owner — readable by all authenticated users, writable only by super admins (seeding new templates/tiers).

---

## Check-In / Offline Sync Model

- The Check-In route is a special PWA-capable route within the same React app (not a separate app) — see `ui-rules.md`.
- Scans are written to a local queue (IndexedDB/localStorage) first, always, regardless of connectivity — the network call is never on the critical path of recording a scan.
- On reconnect, the queue flushes to `worker/routes/checkins.ts`, which is the only place that writes a check-in as "confirmed" in Neon.
- **Conflict rule:** if two queued scans (from different devices) resolve to the same guest/QR token as already checked-in, the server does not silently pick a winner — it marks the later sync as a conflict and the organizer is notified (in-app + dashboard flag), never auto-merged or auto-discarded.
- QR mode (unique-per-guest vs general-per-event) is set once per card at creation time and must not change after cards have been distributed — a mode change on a card that's already been sent is a data-integrity risk, not a simple edit.

---

## Payment / Event Activation Model

- An event's card-creation/sending access is gated by `events.status`. Only `active` events may create/send cards.
- The only path from `pending_payment` to `active` is an explicit super-admin action in the webapp, triggered after the admin sees a payment confirmation via WhatsApp (`wa.me/<support_number>`) — **never automated, never inferred from any webhook**, since there is no payment API integration by design.
- `payments` rows are append-only evidence (who submitted, when, what reference) — activation is a separate, explicit, auditable action (`activated_by`, `activated_at`) rather than a status flip with no actor recorded.

---

## Invariants

- No Neon query, ever, from `src/` — only from `worker/`.
- No Clerk secret key, NextSMS API key, or Neon connection string in any client-bundled code or `VITE_`-prefixed env var.
- No `user_id` trusted from a request body — always taken from the verified Clerk session on the server.
- No event reaches `active` status without a recorded `activated_by` super-admin actor.
- No check-in conflict is auto-resolved silently — always surfaced to the organizer.
- No QR mode change on a card after distribution.
- No raw external-API error (NextSMS, Clerk, Neon) shown to the end user — translate to a human-readable message first (see `code-standards.md`).

---

## Environment / Secrets Boundary

Worker-only secrets (via `wrangler secret put`, never committed, never `VITE_`-prefixed): Clerk secret key, NextSMS API credentials, Neon connection string, Lipa Namba support WhatsApp number (if treated as config rather than hardcoded).

Client-safe/public: Clerk publishable key, any purely cosmetic config.

See `code-standards.md` → Environment Variables for the full table once populated.
