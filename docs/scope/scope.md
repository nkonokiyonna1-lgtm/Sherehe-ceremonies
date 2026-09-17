# Scope: Sherehe — Ceremonies

A web app for organizers in Tanzania and East Africa to design, tier, and distribute digital event cards (weddings, send offs, corporate events, birthdays), then track attendance at the event via QR check in.

**Build approach:** Tracer Bullet (prove the whole pipe works end to end before building any part of it fully).
**Workflow:** Alpha (after `/develop`, run `/check verify` on the real app; nothing more by default). `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Coding standards & tooling | Foundation | in-progress |
| 2 | App shell, design system & accessibility baseline | Foundation | in-progress |
| 3 | Internationalization scaffold (English/Swahili) | Foundation | planned |
| 4 | Auth & data foundation | Foundation | planned |
| 5 | Analytics & error monitoring setup | Foundation | planned |
| 6 | Core event to check in loop | Slice 1 | planned |
| 7 | Template gallery with filtering | Slice 2 | planned |
| 8 | Konva card editor | Slice 2 | planned |
| 9 | WhatsApp distribution via NextSMS | Slice 2 | planned |
| 10 | Guest list & unique per guest QR mode | Slice 3 | planned |
| 11 | Lipa Namba payments & event activation gating | Slice 3 | planned |
| 12 | Offline tolerant check in queue & conflict detection | Slice 4 | planned |
| 13 | Post event report | Slice 4 | planned |

## Foundations

### 1. Coding standards & tooling
Confirm and sharpen the existing `AGENTS.md`/`context/` conventions and lint and format tooling against the real stack, so every later feature builds on enforced standards instead of a Vite default template.
**Done when:** root `AGENTS.md` reflects the real stack choices, and lint and format run clean on the current codebase.
spec [0001](../specs/0001-coding-standards-tooling/index.md) · code in `tsconfig.app.json`, `tsconfig.node.json`, `.prettierrc`, `eslint.config.js`, `vite.config.ts`, `playwright.config.ts`, `e2e/`
- [x] Capture conventions + tooling choices: `/audit`
- [x] Apply the standard: `/develop coding standards & tooling` (TypeScript strict mode on, Prettier configured, Vitest + Playwright installed with a passing smoke test each)
- [x] Verify it: `/check verify coding standards & tooling`

### 2. App shell, design system & accessibility baseline
The shadcn `sidebar-07` layout (collapsible sidebar, breadcrumb header, content area) on the provided OKLCH token set, with the sidebar groups from `project-overview.md` (Templates, Events, Billing, Check In, Reports, Settings, super admin only items), plus a basic semantic HTML and keyboard navigation baseline applied across every page from the start.
**Done when:** the sidebar and breadcrumb shell renders with the correct nav groups and role visibility, and base components handle focus and keyboard use.
spec [0002](../specs/0002-app-shell-design-system-accessibility/index.md)
- [x] Design it (spec): `/architect app shell, design system & accessibility baseline`
- [x] Build it: `/develop app shell, design system & accessibility baseline`
  - [x] Toolchain and tokens: install router, Tailwind v4, shadcn init; port the light and dark OKLCH set into `src/index.css` (AC-7, AC-9)
  - [x] Shell and routing thread: sidebar block plus components, stub seams for role and liveness, route map with layoutless landing, guard, and NotFound (AC-1, AC-2, AC-3, AC-6)
  - [x] Frame finished: breadcrumbs from route metadata, collapse and mobile overlay, theme toggle with pre-paint script, skip link and focus on navigation, empty states on every page (AC-1, AC-4, AC-5, AC-6)
  - [x] Proven: jsdom keyboard tests, lint, format, test, build clean, registry updated (AC-5, AC-9). The AC-8 Playwright shell spec is authored but remains pending until `e2e/shell.spec.ts` executes successfully; `e2e/scaffold.spec.ts` does not verify AC-8.
code: `src/layouts/ShellLayout.tsx`, `src/routes.tsx`, `src/config/nav.ts`, `src/components/ui/`, `src/index.css`
- [ ] Verify it: `/check verify app shell, design system & accessibility baseline`

### 3. Internationalization scaffold (English/Swahili) · needs a decision
Wire an i18n approach so every page can be authored in English and Swahili from day one, rather than retrofitted once content exists.
**Done when:** a page renders in either language behind a locale switch, and new strings have an established pattern to follow.
- [ ] Design it (spec): `/architect internationalization scaffold`

### 4. Auth & data foundation · needs a decision
Clerk sign in and sign up, the Hono worker scaffold (`worker/`) with Clerk session verification middleware, the Neon connection, and the initial schema (`users`, `events`) establishing the row ownership pattern (`user_id` filtered queries) that every later table reuses.
**Done when:** a user can sign in through Clerk, the worker verifies the session on a protected route, and Neon holds `users`/`events` rows filtered by `user_id`.
- [ ] Design it (spec): `/architect auth & data foundation`

### 5. Analytics & error monitoring setup · needs a decision
Instrument the app with product analytics and error monitoring from the first deployed slice, so real usage and failures are visible early rather than only once something breaks in production.
**Done when:** a page view and a deliberately thrown error each show up in the chosen tool's dashboard.
- [ ] Design it (spec): `/architect analytics & error monitoring setup`

## Slice 1: Core event to check in loop

### 6. Core event to check in loop · needs a decision
The thinnest real thread through the whole product, and this build's walking skeleton: an organizer signs in, creates an event, picks one of a small seeded set of templates (no customization yet), gets a card with a single general (event wide) QR code, downloads it as a PDF, and that QR can be scanned at the Check In route to write a real, online, check in reflected on a live dashboard. No editor, no WhatsApp send, no payment gating, no per guest QR, no offline queue yet, just the full pipe working end to end, narrowly.
**Done when:** an organizer can sign in, create an event, pick a seeded template, download a PDF with a scannable QR, and scanning it at the Check In route increments a live "X checked in" count for real.
- [ ] Design it (spec): `/architect core event to check in loop`

## Slice 2: Card design & distribution breadth

### 7. Template gallery with filtering
Replace Slice 1's seeded single template pick with a real gallery, filterable by event type (wedding, send off, corporate, birthday) and tier (VIP, VVIP, Single, Double), with tiers distinguished only by design.
**Done when:** the gallery lists templates, filters by type and tier, and a selection carries into card creation.
- [ ] Build it: `/develop template gallery with filtering`

### 8. Konva card editor
Let an organizer customize a chosen template's text, colors, and images before finalizing a card, replacing the uncustomized card from Slice 1.
**Done when:** edits made in the Konva canvas persist to the card's design JSON and are reflected in the generated PDF and QR output.
- [ ] Build it: `/develop konva card editor`

### 9. WhatsApp distribution via NextSMS
Add sending a finished card to a guest over WhatsApp as a second distribution channel alongside the PDF download from Slice 1.
**Done when:** a card can be sent to a guest contact through NextSMS's WhatsApp API from the server only, and a delivery failure shows a human readable message, never a raw API error.
- [ ] Design it (spec): `/architect whatsapp distribution via nextsms`

## Slice 3: Guests & payment gating

### 10. Guest list & unique per guest QR mode
Let an organizer choose, per card, between one general QR (Slice 1's model) and a unique QR per named guest, with guest entry shown only in the latter mode.
**Done when:** a card's QR mode is chosen once at creation and locked after distribution, and unique mode generates a distinct token per guest.
- [ ] Design it (spec): `/architect guest list & unique per guest qr mode`

### 11. Lipa Namba payments & event activation gating · needs a decision
The Billing page (paybill instructions, "I've paid" confirmation step) and the super admin only Activate Event view, wiring the real gate so only `active` events can create or send cards, replacing Slice 1's always open assumption.
**Done when:** a `pending_payment` event cannot create or send cards, and a super admin activation action flips it to `active` with `activated_by` and `activated_at` recorded.
- [ ] Design it (spec): `/architect lipa namba payments & event activation gating`

## Slice 4: Robust check in

### 12. Offline tolerant check in queue & conflict detection · needs a decision
Upgrade Slice 1's online only scan to the real offline first model: a local queue that always writes first regardless of connectivity, syncs on reconnect, and flags (never silently resolves) a double scan conflict across devices.
**Done when:** a scan made offline queues locally, appears once connectivity returns, and a duplicate scan of the same guest from two devices is flagged to the organizer instead of auto resolved.
- [ ] Design it (spec): `/architect offline tolerant check in queue & conflict detection`

### 13. Post event report
A summary view of attendance after an event ends, built on the same confirmed check in data as the live dashboard.
**Done when:** a completed event shows total invited versus checked in counts, plus any conflict resolution summary.
- [ ] Build it: `/develop post event report`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **RSVP / guest list management beyond QR check in**: invite tracking or RSVP responses · needs a decision
- **Automated payment API integration**: ClickPesa, Stripe, or similar automated processing in place of manual Lipa Namba · needs a decision
- **Multi tenant data isolation**: per organizer database or schema separation · needs a decision
- **Seating chart / table assignment**: seat and table planning features · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies, so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` for Alpha and above); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; Alpha's last stage (after `/check verify`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Workflow** (header line) is the project default, what runs after `/develop`: this project's default is **Alpha** = `/check verify`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
