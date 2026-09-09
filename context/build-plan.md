<!-- Build plan: features broken into phases with clear done criteria -->

# Build Plan

## Core Principle

Sherehe is a greenfield build — no upstream to stay compatible with, so phases are sequenced purely by dependency order: foundation → design engine → event/guest data → distribution → payments → check-in. Payments are deliberately sequenced *after* distribution because the per-event fee gates card creation/sending, but the activation flow itself doesn't depend on distribution being built — it's ordered late here because it's low-risk to build once the shape of "an event" is stable. Check-in is last because it depends on cards (and their QR mode) already existing. Each phase should be visually verified in the UI before the next begins, and any non-trivial fix gets a short doc so it isn't re-debated later.

---

## Phase 1 — Foundation

Auth, base layout, routing, and the data-ownership pattern that everything else depends on.

**UI:**

- Clerk sign-in/sign-up
- Base app shell: shadcn `sidebar-07` layout (collapsible sidebar, breadcrumb header, content area)

**Logic:**

- Hono worker scaffold (`worker/`), Clerk session-verification middleware on every protected route
- Neon connection (`worker/db.ts`), initial schema: `users` (Clerk-linked), `events`, row-ownership pattern established here and reused by every later table
- Shared types (`shared/types.ts`) for Event, Card, Guest, CheckIn, Payment

**Status:** Not started.

---

## Phase 2 — Template & Card Design Engine

**UI:**

- Template Gallery — filterable by event type (wedding/send-off/corporate/birthday) and tier (VIP/VVIP/Single/Double)
- Card Editor — Konva canvas: load a template's design JSON, allow text/color/image edits, save back as a Card

**Logic:**

- `templates` table (reference data, no owner): event type, tier, Konva design JSON, thumbnail
- `cards` table: `event_id`, `template_id`, edited Konva design JSON, QR mode (`unique_per_guest` | `general`)
- Tier designs (VIP/VVIP exclusivity styling vs Single/Double guest-count framing) authored as actual template content, not app logic — tier does not affect behavior, only the design

**Status:** Not started. Depends on Phase 1.

---

## Phase 3 — Events & Guests

**UI:**

- Event create/detail page: type, date, status indicator (draft/pending_payment/active/completed)
- Guest list entry (only shown when a card's QR mode is `unique_per_guest`)

**Logic:**

- `events.status` state machine: `draft → pending_payment → active → completed`
- `guests` table: name/contact, assigned QR token (only populated for `unique_per_guest` cards)
- QR token generation: unique per guest, or one general token per card, per the mode chosen in Phase 2 — set once, immutable after first distribution (see `architecture.md`)

**Status:** Not started. Depends on Phase 2.

---

## Phase 4 — Distribution

**UI:**

- "Send via WhatsApp" action on a Card
- PDF preview/download button (`react-pdf`)

**Logic:**

- `worker/routes/distribution/whatsapp.ts`: calls NextSMS's WhatsApp messaging API server-side, sends the rendered card (image/PDF link) to guest contact(s)
- PDF generation from the Card's Konva design (render to image/canvas, embed in a `react-pdf` document)
- QR code embedded in both the WhatsApp-sent card and the PDF, using `@lglab/react-qr-code`, encoding the guest's or event's QR token

**Status:** Not started. Depends on Phase 3.

---

## Phase 5 — Payments (Lipa Namba, manual)

**UI:**

- Billing page: Lipa Namba paybill instructions, "I've paid" confirmation step (screenshot/reference submission guidance pointing to the support WhatsApp number)
- Super-admin-only "Activate Event" view: list of `pending_payment` events, activate action

**Logic:**

- `payments` table: `event_id`, submitted-evidence metadata, status (`pending`/`activated`), `activated_by`, `activated_at`
- Event activation action: super admin flips `events.status` to `active` — the only path to `active` (see `architecture.md` invariants)
- Card creation/sending routes gated on `events.status === 'active'`

**Status:** Not started. Depends on Phase 3 (event must exist to be paid for). Not functionally dependent on Phase 4, but built after it since distribution needs a stable Card shape to gate correctly.

---

## Phase 6 — Check-In & Attendance

**UI:**

- Check-In route (PWA-capable, special route in the same app): camera-based QR scanner
- Live Dashboard: real-time "X of Y checked in" during the event
- Post-Event Report: attendance summary after the event

**Logic:**

- Offline-first local queue (IndexedDB/localStorage) for scans; syncs to `worker/routes/checkins.ts` on reconnect
- Conflict detection: duplicate scan of the same guest/token from two devices → flagged, organizer notified, never silently resolved (see `architecture.md`)
- `checkins` table: token scanned, timestamp, device/staff id, sync status (`queued`/`synced`/`conflict`)
- Live dashboard reads confirmed (`synced`) check-ins only; report includes a conflict-resolution summary

**Status:** Not started. Depends on Phase 3 (cards/guests/QR tokens must exist) and Phase 5 (event must be `active` for check-in to be meaningful).

---

## Feature Count

| Phase     | Name                              | Features |
| --------- | ---------------------------------- | -------- |
| 1         | Foundation                         | 1        |
| 2         | Template & Card Design Engine      | 1        |
| 3         | Events & Guests                    | 1        |
| 4         | Distribution                       | 1        |
| 5         | Payments (Lipa Namba)              | 1        |
| 6         | Check-In & Attendance              | 1        |
| **Total** |                                     | **6**    |
