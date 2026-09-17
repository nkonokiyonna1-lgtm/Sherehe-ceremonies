# 0002. App shell, design system, accessibility baseline

**Date**: 2026-09-15
**Status**: In Progress

## Summary

This builds the frame the whole app lives inside: a collapsible sidebar, a header with breadcrumbs, and one content area, wired to the OKLCH color tokens already written in `context/ui-tokens.md`, in both light and dark themes from the first day. Every page a nav item points to gets a real empty state for now. Two tiny stub modules stand in for the things later features own (who the user is, whether an event is live), and they are the exact seams those features will replace, not throwaway fakes. Keyboard and screen reader basics (a skip link, focus that follows navigation, an active item marker) ship with the frame, so no later page has to remember them.

See `rationale.md` for the context, options considered, and full rationale.

## Requirements

**User stories**:

- As an organizer, I want one consistent app frame so every page behaves the same way I already learned.
- As a keyboard or screen reader user, I want to reach page content without tabbing through the whole nav, and to know which page I am on.
- As the developer building later features, I want the tokens, routing, and layout proven once, so a feature only adds content.

**Acceptance criteria** (the contract `/develop` builds to and `/check verify` checks):

- **AC-1**: The shell renders at every nav route: a collapsible sidebar carrying the organizer items (Dashboard, Templates, Events, Billing, Check-In, Reports, Settings), a header whose breadcrumbs reflect real navigation depth from route metadata, and one persistent content area. Navigating between routes does not remount the sidebar or lose its collapsed state.
- **AC-2**: Nav visibility comes from one config module reading two stub functions: Check-In appears only when the event liveness stub says an event is live (currently no, so hidden), and Event Activation appears only when the auth stub role is super admin. Flipping a stub value changes the sidebar with no component edits (tests flip it with `vi.mock` on the two module functions). Visibility is sidebar only: a direct visit to `/check-in` renders its page normally, while Activation additionally has the route guard in AC-3.
- **AC-3**: A plain organizer who opens `/admin/activation` directly lands back at `/dashboard` with a human readable toast notice, not a crash and not a silently rendered admin page.
- **AC-4**: The theme follows the operating system setting on first visit; the header toggle switches light and dark immediately; the choice survives a reload from `localStorage` with no flash of the wrong theme before paint.
- **AC-5**: A jsdom unit test proves the keyboard contract: the skip link is the first focusable thing and moves focus to the content area, every sidebar item is reachable by Tab and activatable by Enter, the active item carries `aria-current="page"`, focus moves to the content area on route change, and Escape closes the mobile overlay (the test stubs `matchMedia` to force the overlay variant).
- **AC-6**: Every route renders its designed shape: `/` (the sign in placeholder landing) renders outside the shell with no sidebar, proving the layoutless pattern the future scanner needs; an unknown URL renders a NotFound page inside the shell; every destination renders a real empty state (title, one muted line, one CTA button) using the shadcn `Empty` and `Button` components.
- **AC-7**: The complete token set from `ui-tokens.md` (light and dark) lives in `src/index.css`, the one sanctioned file, mapped into Tailwind, and no other file in `src/` contains a hex or oklch literal (a grep of `src/` excluding `index.css` proves it).
- **AC-8**: One Playwright spec passes against the real app (the 7 organizer-visible shell URLs plus `/` and a mistyped URL, and an assertion that `/admin/activation` redirects): the shell renders at every nav URL, the collapse button works at desktop width, the sidebar appears as an overlay sheet at phone width, and a keyboard only walk from page load reaches content through the skip link.
- **AC-9**: `npm run lint`, `npm run format`, `npm run test`, and `npm run build` all exit clean.

## Decision

**Chosen option**: Option 2: the shadcn `sidebar-07` block on React Router v7 nested routes, with stub seams for role and event liveness.

Build the shell from shadcn's `sidebar-07` block and the `breadcrumb` component, inside one persistent layout route on React Router v7 (declarative mode), with the OKLCH tokens mapped through Tailwind v4's CSS `@theme` (no `tailwind.config.ts`), a hand rolled theme provider, and `src/lib/auth.ts` plus `src/lib/event-status.ts` as the two named stub seams every later feature replaces.

**Implementation skills**: `shadcn` (`shadcn/ui`, `.agents/skills/shadcn/`)

## Feature design

**Data model sketch** (client side only; this slice persists nothing):

- `NavItem`: `title` (string, req), `href` (string, req), `icon` (lucide icon, req), `visibility` (`'always' | 'super_admin' | 'live_event'`, default `'always'`). The sidebar renders `navConfig.filter(visibility rule)`. Single source for nav; no component hardcodes items.
- `StubUser`: `name` (string), `avatarInitials` (string), `role` (`'organizer' | 'super_admin'`). Returned by `getCurrentUser()` in `src/lib/auth.ts`; constant `'organizer'` and the display name "Amina (demo)" until feature 4.
- `isEventLive()`: boolean in `src/lib/event-status.ts`; returns `false` until feature 6 wires real event state.
- Theme state: key `theme` in `localStorage`, values `'light' | 'dark'`, absent means follow system (`matchMedia('(prefers-color-scheme: dark)')`).

**Route map**:

| Path | Shell | Page | Breadcrumb handle |
|---|---|---|---|
| `/` | none (layoutless) | Sign in placeholder landing linking to `/dashboard`; feature 4 replaces its content with Clerk `<SignIn />` | none |
| `/dashboard` | yes | Dashboard empty state; shell default landing (`/` nav clicks and the guard both land here) | Dashboard |
| `/templates` | yes | Templates empty state | Templates |
| `/events` | yes | Events empty state | Events |
| `/billing` | yes | Billing empty state | Billing |
| `/check-in` | yes (nav item hidden until live) | Check-In empty state, CTA explains it unlocks during a live event | Check-In |
| `/reports` | yes | Reports empty state | Reports |
| `/settings` | yes | Settings empty state, hosts nothing yet | Settings |
| `/admin/activation` | yes, role guarded | Event Activation empty state | Activation |
| `/check-in/scan` (future) | none | reserved: the full bleed scanner mounts in the layoutless group `/` already proves | none |
| `*` | yes | NotFound inside the shell, nav still works | (none) |

**State transitions** (theme, the only state machine here):
`system default → (toggle) → stored choice → (toggle) → opposite stored choice`; a stored choice always wins over the system on later loads.

**API surface**: no HTTP endpoints in this slice (no backend yet). The interfaces are the route map above plus two module contracts: `getCurrentUser()` and `isEventLive()`, whose signatures feature 4 and feature 6 implement for real without touching components.

**Value sourcing** (every value an action produces or displays, and where it comes from):

| Action | Value produced / displayed | Source |
|---|---|---|
| Render sidebar | the item list | `src/config/nav.ts` (literal config) |
| Show/hide Check-In | event live or not | `isEventLive()` stub, `false` (feature 6 replaces) |
| Show/hide Activation | user role | `getCurrentUser().role` stub, `'organizer'` (feature 4 replaces) |
| Mark active item | current location | React Router `useLocation` pathname |
| Render breadcrumb trail | labels per depth | each route's `handle.crumb` metadata |
| Show user block | name, avatar initials | `getCurrentUser()` stub |
| Apply theme at load | stored value or system value | `localStorage.theme`, else `matchMedia` |
| Notice on guard redirect | the message string | literal: "Event Activation is only available to super admins." |
| Empty state copy | title, line, CTA label | authored per page in build step 8 following `ui-rules.md`, recorded in `ui-registry.md` |
| Toast host | Sonner `<Toaster />` | mounted once in the shell |
| Guard toast on repeat visits | no stacked toasts | stable toast id |
| Skip link target | the content region | `<main id="main-content" tabIndex={-1}>`, shell only (none on `/`) |
| Page title in the browser tab | document title | fixed "Sherehe" in `index.html`; per route titles belong to the i18n feature |

**Behavioral rules** (settled so the build never guesses):

- Route change focus: on every pathname change except the initial mount, move focus to `#main-content`; a user clicking a link or a guard redirect both count.
- Guard matching: exact path `/admin/activation` only; anything else under `/admin/` that is not a defined route falls to NotFound.
- Breadcrumbs: `handle.crumb` is a static string; a route without one contributes no crumb; param-derived crumbs (a future event name) are a later spec's extension.
- Active item: exact pathname match this slice; prefix matching arrives with the scanner route.
- Sidebar collapsed state: shadcn `SidebarProvider`'s built-in `sidebar_state` cookie persistence, no custom storage.
- Mobile overlay: shadcn defaults (overlay below the `md` breakpoint, Radix Sheet focus trap, Escape closes and returns focus to the trigger).
- Theme script: `localStorage` read in try/catch, stored value accepted only as `'light'` or `'dark'` else fall through to `matchMedia`; while nothing is stored, a `change` listener keeps following the system.
- Theme toggle is two state (light, dark) once touched; returning to "follow system" is not built this slice.
- Stub avatar: initials "A" via `AvatarFallback`, no `AvatarImage` this slice.

**Key invariants**:

- One layout route owns the frame; a page never wraps its own sidebar or header (`ui-rules.md`).
- All color flows through semantic token classes; hex or oklch literals appear only in the global stylesheet (`ui-tokens.md`).
- The sidebar renders exclusively from `nav.ts` through the visibility rule; role and liveness are read only via the two stub modules, never inline in components.
- Every interactive element is keyboard reachable with a visible focus ring (`ring-ring`, `ring-sidebar-ring` per `ui-tokens.md`).
- Every component carries its light and dark treatment at birth, never added later (`ui-rules.md`).
- The landing page and the future scanner are the only layoutless routes; nothing else escapes the shell without a spec change.

**Security model**: no data, no secrets, no auth in this slice. The `/admin/activation` guard is a client side convenience (UX), never enforcement; real role checks live server side in feature 4, per `architecture.md` (role from the verified Clerk session, never a client flag) and `ui-rules.md`. The fake user is display text inside a file named `auth.ts` that is obviously a stub, with the feature 4 swap recorded below. No new environment variables and no third party credentials.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: load `/dashboard`, press Tab once, activate the skip link with Enter, land inside the content area; click through every sidebar item and watch breadcrumbs update while the sidebar never remounts. Verifies **AC-1**, **AC-5**.
- Visibility flip: set the liveness stub to true, Check-In appears; set the role stub to `super_admin`, Activation appears; revert both, both vanish. No component touched. Verifies **AC-2**.
- Failure case: a plain organizer opens `/admin/activation` directly; expect a redirect to `/dashboard` plus one visible toast. A mistyped URL `/evnts` renders NotFound inside the shell with working nav. Verifies **AC-3**, **AC-6**.
- Theme: first visit with the OS set to dark renders dark; toggle to light, reload, still light with no wrong theme flash. Verifies **AC-4**.
- Mobile: at 390px width the sidebar is an overlay, openable from a header trigger, closed by Escape with focus returned. Verifies **AC-1**, **AC-5**, **AC-8**.

## Build plan

Ordered for the project's Tracer Bullet approach (root `AGENTS.md`, scope header): stand up one thin working thread from tokens through a rendered page first, then widen.

1. Install the new runtime deps (`react-router`, `tailwindcss` v4 with its Vite plugin) and run `npx shadcn@latest init` (Radix base, `components.json`, `cn()` helper, `lucide-react`); record every added package in the approved dependency list in `context/code-standards.md` in the same change (spec 0001's dependency rule). Satisfies **AC-7**, **AC-9**.
2. Port the full light and dark token set from `ui-tokens.md` into `src/index.css`, mapped through Tailwind v4's `@theme inline`; delete the Vite scaffold styles and hero markup (`App.css` and the demo sections). Satisfies **AC-7**.
3. Add the shell components: `npx shadcn@latest add sidebar breadcrumb button dropdown-menu avatar empty sonner` (the `sidebar-07` block plus its dependencies). Satisfies **AC-1**, **AC-6**.
4. Create the stub seams: `src/lib/auth.ts`, `src/lib/event-status.ts`, `src/config/nav.ts` with the shapes above. Satisfies **AC-2**.
5. Wire the router (declarative mode): the layoutless group with `/`, one shell layout route with nested pages carrying `handle.crumb`, the role guard on `/admin/activation` (redirect plus Sonner toast), and the `*` NotFound inside the shell. Satisfies **AC-1**, **AC-3**, **AC-6**.
6. Complete the shell layout: sidebar from `nav.ts` with active state and `aria-current`, collapse button and mobile overlay, header with breadcrumbs built from `useMatches`, theme toggle icon button, stub user block in the sidebar footer, skip link, and focus to the content area on every route change. Satisfies **AC-1**, **AC-5**.
7. Theme provider: hand rolled, `localStorage` persistence, system default, and a small inline script in `index.html` that applies the stored class before React mounts (no flash). Satisfies **AC-4**.
8. Empty state pages for Dashboard, Templates, Events, Billing, Check-In, Reports, Settings, Activation, each with title, muted line, and one CTA per `ui-rules.md`. Satisfies **AC-6**.
9. jsdom unit tests for the AC-5 keyboard contract (skip link first and focused, Tab and Enter reach and activate every item, `aria-current`, focus moves on navigation, Escape closes the overlay). Satisfies **AC-5**.
10. One Playwright shell spec for AC-8: every URL in AC-8's set renders, collapse works at desktop width, overlay works at phone width, keyboard only path reaches content; wire `webServer: npm run preview` in `playwright.config.ts` so the spec serves a built app. (Playwright browser binaries must be present on the machine running this; spec 0001's install worked only outside this sandbox's blocked network, so `/check verify` re-asserts the binaries before trusting the run.) Satisfies **AC-8**.
11. Green `lint`, `format`, `test`, `build`; record the built shell components and exact classes in `context/ui-registry.md`'s Built table (the registry's own update rule). Satisfies **AC-9**.

## Consequences

**Positive**:

- Every later feature mounts into a proven frame instead of carrying shell bugs into its own slice; Slice 1's auth work lands on routes, not on a layout debate.
- Dark mode, keyboard use, and screen reader semantics are enforced by the frame once, which is exactly what `ui-rules.md` demands but cannot itself guarantee.
- The two stub modules state precisely what features 4 and 6 must implement; the swap is a one file edit, and the scope's "role visibility" bar is met for real now, with a real source later.
- The layoutless landing already proves the escape hatch the full bleed scanner needs, so feature 6 adds a route, not a refactor.

**Negative / tradeoffs**:

- The stub role guard is UX only; a reader could mistake it for enforcement. The spec names this explicitly, but it depends on the engineer and `/check verify` keeping feature 4 honest about server side checks.
- `ui-tokens.md` describes token mapping through `tailwind.config.ts`, which is how Tailwind v3 worked; this slice uses v4's CSS `@theme` instead. The context file is stale on that mechanism until `/sync` revises it.
- Installing router, Tailwind, shadcn, and Sonner now widens the surface every later slice inherits; the runner up (waiting, building the shell inside Slice 1) would have kept this slice small but moves its risk into the walking skeleton.
- A hardcoded "Amina (demo)" user block is visible fake data on every page until feature 4; deliberately labeled, but it is fake until then.

**Neutral**:

- `App.css` and the Vite hero page are deleted; `src/App.tsx` becomes the router mount.
- The approved dependency list grows by roughly six packages (router, Tailwind, its Vite plugin, and the shadcn init set: class-variance-authority, clsx, tailwind-merge, lucide-react; plus sonner via the add step).
- `ui-registry.md` gets its first Built entries.

## Follow-up

- [ ] `/sync`: refresh `context/ui-rules.md` (nav list now includes Dashboard; the canonical seven organizer labels are exactly AC-1's set, hyphenated "Check-In") and `context/ui-tokens.md` (token mapping mechanism is Tailwind v4 CSS `@theme`, not `tailwind.config.ts`), and widen `ui-rules.md`'s toast reservation to include the guard redirect notice (ratified by the engineer at spec review). Run before `/check verify`, so AC-1 is checked against reconciled context. This skill does not edit context files.
- [ ] Feature 4 (auth & data foundation): implement `getCurrentUser()` against the Clerk session (role via the custom claim pattern confirmed in `library-docs.md`), replace the landing content with `<SignIn />`, the stub block with `<UserButton />`, and add the real server side role enforcement behind this client guard.
- [ ] Feature 6 (core event to check in loop): implement `isEventLive()` against event state; mount the full bleed scanner in the layoutless route group this slice proves; that slice also owns the PWA manifest and service worker (deferred here by choice; `--primary` is the stable theme color for the manifest when it comes).
- [ ] Add an `## Agent skills` bullet in root `AGENTS.md` for the installed `shadcn` skill (`.agents/skills/shadcn/`), owned by `/audit` or `/sync`.
- [ ] The installer bundled a second skill, `migrate-radix-to-base`, alongside `shadcn` (same repo); keep or remove as the engineer prefers.

## Rationale

Context, options considered, reasoning, and references: see `rationale.md`.
