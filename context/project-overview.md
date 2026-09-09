<!-- Project overview: what you're building, why, and who it's for -->

# Project Overview

## About the Project

Sherehe — Ceremonies is a web application for designing, tiering, and distributing digital event cards (weddings, send-off parties, corporate events, birthday parties), plus tracking attendance at the event itself via QR check-in. Built from scratch — no upstream fork, no inherited codebase.

Single deployment target: a web app (React frontend, Hono on Cloudflare Workers backend, Neon Postgres), including a PWA-capable check-in route used at the physical event, often offline.

---

## The Problem It Solves

Event organizers (individuals and businesses running weddings, send-offs, corporate functions, birthdays) need a fast way to produce professional, tiered invitation cards (VIP/VVIP/Single/Double) without hiring a designer, distribute them over WhatsApp (the dominant channel in-market) or as a downloadable PDF, and reliably track who actually showed up — without relying on a paper guest list or a manual door count. Sherehe solves all three: template-driven card design, WhatsApp/PDF distribution, and QR-based check-in with an offline-tolerant scanning flow and a live attendance dashboard.

---

## Pages

- **Templates** — browse pre-made card templates, filtered/categorized by event type (wedding, send-off, corporate, birthday) and by tier (VIP, VVIP, Single, Double).
- **Card Editor** — Konva canvas editor for customizing a chosen template (text, colors, images) per event.
- **Events (list/detail)** — an organizer's events; each event holds its cards, payment status, and check-in data.
- **Billing / Payment Instructions** — Lipa Namba paybill instructions for the per-event fee, plus a "payment submitted" state while awaiting super-admin activation.
- **Distribution** — send a finished card via WhatsApp (NextSMS) or download as PDF (`react-pdf`).
- **Check-In** — PWA-capable scanning screen (special route), used at the event to scan guest/event QR codes, with an offline queue.
- **Live Dashboard** — real-time "X of Y checked in" view during the event.
- **Post-Event Report** — attendance summary after the event ends.
- **Super Admin — Event Activation** — internal view/action for activating an event once a Lipa Namba payment is confirmed via WhatsApp.

---

## Navigation

Collapsible sidebar (shadcn `sidebar-07` pattern) with a header bar showing breadcrumbs, and a content/children viewing area. Sidebar groups: Templates, Events, Billing, Check-In (visible only when an event is in "active/live" state), Reports, Settings. Super-admin-only items (Event Activation) appear only for that role.

---

## Core User Flow

### Flow 1 — Create an Event & Design a Card

Organizer creates an event (name, type, date), picks a template filtered by event type and tier (VIP/VVIP/Single/Double — tiers differ only in design, evoking exclusivity for VIP/VVIP and guest count semantics for Single/Double), and customizes it in the Konva editor.

### Flow 2 — Pay the Per-Event Fee (Lipa Namba, manual)

Organizer sees Lipa Namba paybill instructions on the Billing page, pays externally, then sends a payment confirmation (screenshot or SMS text) to the app's configured WhatsApp support number (`wa.me/<number>`). A super admin manually activates the event in the webapp once confirmed — no automated payment API integration. Only after activation can the organizer create/send cards for that event.

### Flow 3 — Distribute Cards

Once the event is active, the organizer sends the finished card to guests via WhatsApp (through NextSMS's WhatsApp messaging API) and/or shares a downloadable PDF (rendered/downloaded via `react-pdf`). Each card carries a QR code — either unique per invited guest or one general QR per event, organizer's choice per event.

### Flow 4 — Check-In at the Event

On the day of the event, staff use the Check-In PWA route (logged in as the organizer or a staff account) to scan QR codes. The scanner works offline: scans are queued in local storage and synced to Neon once connectivity returns. If two devices scan the same guest and a conflict is detected on sync, the organizer is notified rather than the conflict being silently resolved. A live dashboard shows real-time attendance counts during the event; a post-event report summarizes attendance afterward.

---

## Data Architecture

**Single shared Neon Postgres database, single-tenant model with row-level ownership** — no per-organizer database isolation. Every row (events, cards, guests, check-ins, payments) is scoped by an owning `organizer_id`/`user_id` column, and all queries must filter by it (see `architecture.md` for the enforcement pattern).

- **Users / Organizers** — Clerk-authenticated; `user_id` is the row-ownership key throughout.
- **Events** — type (wedding/send-off/corporate/birthday), date, status (draft/pending_payment/active/completed), owning organizer.
- **Templates** — categorized by event type and tier (VIP/VVIP/Single/Double); Konva design data (JSON) per template.
- **Cards** — a customized instance of a template for a specific event; holds final Konva design JSON, PDF render reference, and QR mode (unique-per-guest or general-per-event).
- **Guests** (only when QR mode is unique-per-guest) — name/contact, assigned QR token, check-in status.
- **Check-ins** — QR token scanned, timestamp, device/staff identifier, sync status (queued/synced/conflict).
- **Payments** — per-event Lipa Namba claim: reference/screenshot metadata, status (pending/activated), activated_by (super admin), activated_at.

---

## Features In Scope

- Template gallery categorized by event type and card tier (VIP/VVIP/Single/Double), designs distinguished visually by tier.
- Konva-based card customization per event.
- QR code generation per card, configurable as unique-per-guest or general-per-event.
- WhatsApp distribution via NextSMS.
- PDF card generation/download via `react-pdf`.
- Offline-tolerant Check-In PWA route with local queue + sync + conflict notification.
- Live attendance dashboard during the event, plus a post-event report.
- Manual Lipa Namba payment flow: paybill instructions → external payment → WhatsApp confirmation → super-admin activation.

## Features Out of Scope

- RSVP / guest-list management beyond QR check-in — this is design-and-send only, no invite-tracking or RSVP responses.
- Automated payment API integration (no ClickPesa/PayPal/Stripe-style automated processing) — Lipa Namba is manual/offline-verified by design.
- Multi-tenant data isolation (no per-organizer database or schema separation) — a single shared database with row ownership is sufficient at this stage.
- Seating chart / table assignment features.

---

## Tech Stack

- **Frontend:** React, TypeScript (strict), Tailwind CSS, shadcn/ui, Konva (card canvas editor), `@lglab/react-qr-code` (QR generation), `react-pdf` (PDF view/download)
- **Backend:** Hono on Cloudflare Workers
- **Database:** Neon (Postgres), single shared DB, row-level ownership
- **Auth:** Clerk
- **Messaging:** NextSMS (WhatsApp messaging API) for card distribution and payment-confirmation channel
- **Payments:** Lipa Namba — manual/offline verification only, no payment API
- **Tooling:** ESLint + Prettier, Vitest, Playwright, Jest

---

## Target User

Individuals and businesses in the East African market (primarily Tanzania, given Lipa Namba/NextSMS) organizing weddings, send-off parties, corporate events, or birthday parties, who want professional tiered invitation cards distributed over WhatsApp, plus a reliable door-count/check-in mechanism on the day of the event.

---

## Success Criteria

- A new organizer can create an event, pick a template by type/tier, customize it, and reach a "ready to send" card without design help.
- Cards distribute correctly via WhatsApp (NextSMS) and as a downloadable PDF, with a working QR code in either mode (unique or general).
- Lipa Namba activation is fully traceable — every event activation is tied to a specific super-admin action, never auto-approved.
- Check-in works reliably offline: no scan is lost, and any double-scan conflict across devices is surfaced to the organizer rather than silently dropped or silently overwritten.
- The live dashboard and post-event report accurately reflect synced check-in data once connectivity is restored.
