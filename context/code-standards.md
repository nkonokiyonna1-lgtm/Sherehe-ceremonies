<!-- Code standards: rules the agent must follow when writing code for this project -->

# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

- Readability over succinctness — write short, well-named functions and components.
- Use early exits; avoid nested conditionals and loops.
- Greenfield codebase, no upstream to protect — organize by feature (`templates/`, `cards/`, `checkins/`, `payments/`), not by strict fork-safety isolation. Still keep server-only logic (Neon queries, NextSMS calls, payment activation) out of anything importable by the client.
- Understand the client/server/agnostic boundary (see `architecture.md`) before writing a line — this is the most common way secrets or unfiltered queries leak into the client bundle.
- One thing at a time — complete one feature fully (including a short doc for any non-trivial fix) before starting the next.
- **Look up current library/API documentation via the Context7 connector, not a general web search.** Before writing code against any dependency in `library-docs.md` (Clerk, Neon, Hono, Konva, `@lglab/react-qr-code`, `react-pdf`, shadcn/ui, etc.), resolve it through Context7 rather than searching the open web or relying on memory of the API shape. The only exception is NextSMS, which isn't indexed on Context7 — fetch its known Postman doc URL directly instead (see `library-docs.md` → Documentation Lookup Rule). Update `library-docs.md` with what was found, same as any other non-trivial finding.

---

## Language & Type Safety

- TypeScript strict mode is enabled project-wide (`tsconfig.json`), both `worker/` and `src/`.
- Prefer type safety over `any`; shared shapes (Event, Card, Guest, CheckIn, Payment) live in `shared/types.ts` and are imported by both client and worker — never redefined locally.
- `shared/types.ts` and any other `shared/` files are side-agnostic: no imports from `src/` or `worker/`, no side effects.

---

## File and Folder Naming

- React component files: PascalCase (e.g. `TemplateGallery.tsx`, `CheckInScanner.tsx`).
- Utility/module files: camelCase (e.g. `qrTokenUtils.ts`, `syncQueue.ts`).
- Hono route files: camelCase, grouped by resource (`worker/routes/events.ts`, `worker/routes/checkins.ts`).
- Test files: `**/*.test.ts` / `**/*.spec.ts`.
- One component per file.

---

## Component / Module Structure

```typescript
// imports → types → component/function → exports
// React components: props type → component (hooks first, then handlers, then render) → default export
```

- No inline styles — Tailwind utility classes, themed via the CSS variables in `ui-tokens.md` and shadcn's component primitives.
- No direct Neon queries or NextSMS calls inside a React component — those belong in `worker/routes/`, called via `fetch()`.
- Konva canvas logic (layers, shapes, transformers) lives in dedicated hooks/utilities (`src/features/editor/`), not inlined into page components.

---

## API / Backend Conventions

### Hono on Cloudflare Workers

```typescript
// worker/routes/*.ts — register a Hono route, verify the Clerk session, validate input, run the query, return typed JSON
// worker/middleware/clerkAuth.ts — runs before any route touching owned data (events/cards/guests/checkins/payments)
```

- Every route handler validates its input before processing.
- Every route touching owned data reads `user_id` from the verified Clerk session — never from the request body (see `architecture.md`).
- Return `{ success: boolean, data?, error? }` shaped JSON responses consistently across all routes.
- NextSMS API calls wrap retries and never expose raw provider error bodies to the client — translate to a human-readable message first.
- Super-admin-only routes (event activation, template seeding) check a role claim from Clerk, not a client-supplied flag.

---

## Database

- Never query Neon directly from a React component — always through `worker/routes/`.
- Single shared database, row-level ownership via `user_id` — every query on `events`/`cards`/`guests`/`checkins`/`payments` filters by the session's `user_id` at the route/middleware layer, not left to the caller to remember.
- `templates` has no owner column — readable by all authenticated users, writable only by super-admin routes.
- Use parameterized queries exclusively (Neon serverless driver / query builder — confirm exact client library before first use, see `library-docs.md`).
- Postgres `ALTER TABLE ADD COLUMN` is safe for additive schema changes; still provide sane defaults for existing rows.
- QR mode (`unique_per_guest` | `general`) is set once at card creation and must not be mutated after a card has been distributed — enforce this in the update route, not just in the UI.

---

## Error Handling

- Never use empty catch blocks — always log or handle.
- User-facing errors must be human-readable — never surface a raw Clerk/Neon/NextSMS error string to the UI.
- Log errors with a context prefix, e.g. `[checkins/sync]`.
- A failed Clerk session check must return a specific error (`{ error: 'unauthenticated' }`), not a bare 401 with no shape, so the client can route appropriately.
- A check-in sync conflict is not an error to swallow — it must persist as a `conflict` status row and surface to the organizer, never silently resolved (see `architecture.md`).
- Offline queue writes (IndexedDB) must never throw uncaught — a failed local write should still let the scan attempt show feedback to the person scanning.

---

## Environment Variables

### Worker-only (Cloudflare Worker secrets, via `wrangler secret put`, never committed)

| Variable                     | Used In                                 |
| ------------------------------ | ----------------------------------------- |
| `CLERK_SECRET_KEY`             | `worker/middleware/clerkAuth.ts`          |
| `NEON_DATABASE_URL`            | `worker/db.ts`                            |
| `NEXTSMS_API_URL`              | `worker/routes/distribution/whatsapp.ts`  |
| `NEXTSMS_API_KEY`              | `worker/routes/distribution/whatsapp.ts`  |
| `LIPA_NAMBA_INSTRUCTIONS`      | Billing page copy (paybill/business number, kept as config) |
| `SUPPORT_WHATSAPP_NUMBER`      | `wa.me/<number>` link shown on the billing page |

### Client-safe (public, `VITE_`-prefixed)

| Variable                        | Used In                    |
| ---------------------------------- | ----------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY`       | `src/` Clerk provider          |

**Note:** no Neon connection string, NextSMS key, or Clerk secret key may ever be `VITE_`-prefixed or otherwise reach the client bundle.

---

## Comments

- No comments explaining what the code does — code must be self-explanatory.
- Comments only for why — e.g. why a check-in conflict is never auto-resolved, why QR mode is immutable after distribution.

---

## Dependencies

Approved core dependencies (see `package.json` for exact versions):

### Shared

- `react` / `react-dom` / `react-router` — UI framework and routing
- `typescript` — strict mode, both `src/` and `worker/`
- `tailwindcss` + `shadcn/ui` — styling and component primitives
- `@tailwindcss/vite` — Tailwind v4's Vite plugin (the CSS `@theme` mechanism replaces `tailwind.config.ts`)
- `shadcn` — runtime dependency (the `shadcn/tailwind.css` import in `src/index.css` resolves from this package)
- `radix-ui` — shadcn's component primitives (installed via `shadcn init`, radix base)
- `class-variance-authority` + `cn` — component variants and class merging (shadcn's `cn()` helper re-exports `cn`)
- `lucide-react` — icon set (shadcn default)
- `tw-animate-css` — animation utilities used by shadcn components
- `sonner` — toasts (action-level feedback, see `ui-rules.md`)
- Dev/test: `vitest`, `playwright`, `eslint` (+ plugins), `prettier`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`

### Client (`src/`)

- `konva` / `react-konva` — card design canvas
- `@lglab/react-qr-code` — QR code rendering
- `@react-pdf/renderer` (`react-pdf`) — PDF preview/download generation
- `@clerk/clerk-react` — auth UI/hooks
- PWA/offline: a service-worker/IndexedDB approach for the check-in queue (confirm exact library — e.g. Workbox — before first use; see `library-docs.md`)

### Worker (`worker/`)

- `hono` — API framework on Cloudflare Workers
- `@hono/clerk-auth` — Clerk session middleware for Hono
- A Neon-compatible Postgres client for the Workers runtime (e.g. `@neondatabase/serverless`) — confirm before adding
- `wrangler` (dev dependency) — Cloudflare Workers CLI/deploy tooling

Do not install any other packages without updating this list first. Keep NextSMS and Lipa Namba integrations dependency-light (direct REST calls) rather than adding a heavier SDK, consistent with there being no vendor SDK for either.
