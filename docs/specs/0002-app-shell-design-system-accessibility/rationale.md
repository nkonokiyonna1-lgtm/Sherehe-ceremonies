# 0002 rationale: app shell, design system, accessibility baseline

## Context

Sherehe has a complete design system on paper and none in code. `context/ui-tokens.md` carries a full OKLCH token set in light and dark; `context/ui-rules.md` names the `sidebar-07` layout, the nav behavior, and the rule that every component ships both themes at birth; `context/ui-registry.md` lists planned components with nothing built. The repository itself holds the default Vite React TypeScript scaffold (a hero demo page), no router, no Tailwind, no shadcn, no components.

Three forces shape the decision. First, Tracer Bullet: the shell is the first slice of UI, so it must prove the whole chain (deps, token wiring, routing, layout, accessibility) end to end, thin, rather than perfect one piece. Second, two later features are unstarted (Clerk auth is feature 4, event state is feature 6) while the shell must already show role-gated and liveness-gated navigation; the frame needs a seam, not a fake. Third, accessibility is a standing requirement across every page, and in a single page app most accessibility failures are frame failures (focus stranded after navigation, no way past the nav, no announcement of the current item), so the shell is the right place to fix them once.

The context files also disagree with each other: `project-overview.md` lists six organizer nav items, `ui-rules.md` lists a different five including a Dashboard. Someone must reconcile them; a spec that builds a shell has to pick a set.

## Options considered

### Option 1: Fold the shell into feature 6's walking skeleton

Defer this whole feature; build a minimal layout inside Slice 1's core loop where Clerk and event state already exist, so no stubs are ever needed and the nav can query real data from day one.

**Pros**:

- Zero fake data anywhere; the role and liveness rules bind straight to real sources.
- One fewer integration point now; fewer dependencies to wrinkle.

**Cons**:

- Packs the first real feature with two jobs (the walking skeleton plus the entire design system foundation), which is where thin slices bloat.
- Every interim feature (i18n, auth) builds pages with no proven frame, then re-tests them when the shell arrives; the accessibility baseline slips past the point where "from the start" still means anything.

### Option 2: shadcn sidebar-07 block, nested routes, stub seams (chosen)

React Router v7 in declarative mode; one layout route holding the `sidebar-07` block, breadcrumb header, and a persistent content area; tokens ported into Tailwind v4's `@theme`; nav driven by a config module filtered through `src/lib/auth.ts` and `src/lib/event-status.ts` stubs; hand-rolled theme provider with a pre-paint script; skip link plus focus management owned by the frame.

**Pros**:

- Matches what the context files already committed to (the block, the tokens, the nav behavior), so the build adds nothing the project did not already choose.
- The stubs are interfaces, not lies: the visibility rule ships real and only its data source is provisional.
- One persistent layout keeps sidebar state, focus, and the skip link across navigation, which is exactly what the accessibility baseline needs.

**Cons**:

- A client-side guard that is not enforcement; it must be read as UX until feature 4's server check exists.
- Three dependency families land at once (router, Tailwind v4, shadcn) and immediately expose the staleness in `ui-tokens.md`'s config-file instructions.

### Option 3: Facade prototype, full shell with mocked screens

Treat the shell as a UI-only prototype: sidebar, header, theme, plus fleshed-out mock pages (fake tables, fake event rows) to review the whole look before any wiring.

**Pros**:

- Design review gets real surface area early; stakeholders see the product shape after one slice.
- Templatizes page skeletons that later features copy.

**Cons**:

- The mock content is throwaway; features 6 onward rewrite every screen it fills, and dead UI teaches later sessions the wrong patterns.
- Against the project's own rule (install and build only what the next slice needs) and against Tracer Bullet, which thins the first thread rather than widening it.

## Rationale

Option 2 was chosen over Option 1 because the shell and the walking skeleton fail for different reasons; merging them means a Slice 1 bug can no longer be attributed to either, and the accessibility baseline ("from the start") has to survive the most schedule-pressured slice in the project. Option 2 over Option 3 because placeholder content is debt with a preview: the empty states were capped at title, line, and CTA so the frame itself stays under review, not invented screens.

One reservation was consciously widened: `ui-rules.md` says toasts are for action-level feedback, and the guard's redirect notice is navigation-level. The engineer ratified the exception at spec review (an alternative inline banner was considered and rejected for one more component in the frame); `/sync` should record the widened rule. The nav set is the engineer's call at interview (the union of the two conflicting context lists plus Dashboard); AC-1 fixes the canonical labels and the Follow-up makes the context refresh a prerequisite of verify.

The engineer's answers drove the load-bearing specifics, each consistent with the project's own sources: the stub-seam approach and the redirect-with-notice guard follow `architecture.md` (role from the Clerk session later, never a client flag; the client guard is presentation); the token mechanism follows what `ui-tokens.md` intends semantically while correcting its Tailwind v3 instruction to the v4 reality the init step installs; the component install set stays inside `ui-registry.md`'s "install when first needed" rule, with Sonner justified now because the guard's human-readable notice and `ui-rules.md`'s toast reservation both need a working example; the route and layout answers (declarative v7, one persistent layout, handle-based breadcrumbs, overlay sidebar on mobile, focus-to-content on navigation) are the boring defaults of each library's own guidance rather than inventions (basis: shadcn's own sidebar example is written against React Router declarative mode; WCAG 2.4.1 Bypass Blocks is what the skip link serves).

## References

**Project sources**:

- `context/ui-tokens.md` (the OKLCH set, both themes, ring and sidebar tokens)
- `context/ui-rules.md` (sidebar-07 layout, breadcrumb depth, dark mode at birth, Badge and toast reservations)
- `context/ui-registry.md` (the planned component list and install-when-needed rule)
- `context/project-overview.md` (nav groups; the Check In visibility rule)
- `context/architecture.md` (role never trusted client-side; the client/server boundary)
- `context/code-standards.md` (the approved dependency list this change updates; human-readable errors rule)
- Spec [0001](../0001-coding-standards-tooling/index.md) (strict mode, lint, format, Vitest and Playwright, the dependency approval rule)
- Installed skill `shadcn` (`.agents/skills/shadcn/`): semantic tokens only, compose don't reinvent, dialog and sheet require titles, Empty component over custom markup

**Practices & standards**:

- WCAG 2.4.1 Bypass Blocks (the skip link) and 2.4.7 Focus Visible (the ring tokens)
- SPA focus management on route change (move focus to the new content region)
- Pre-paint theme script pattern (avoid the wrong-theme flash without SSR)
- Boring technology: official shadcn block plus the project-approved router over hand-rolled layout code
- Tracer Bullet slicing (project build approach): thinnest working thread through every layer, then widen
