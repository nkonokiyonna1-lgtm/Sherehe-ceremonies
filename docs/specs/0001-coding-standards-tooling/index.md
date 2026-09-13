# 0001. Coding standards and tooling

**Date**: 2026-09-13
**Status**: Accepted

## Summary

This records the coding standards and tooling already decided for Sherehe, mostly written down in `context/code-standards.md` before this workflow existed. It covers naming, the client and worker and shared code boundary, how errors must look to the user, the approved dependency list, and how the AI agent must look up library docs (through Context7, not open web search or memory). Nothing here is new; this spec turns an existing decision into a tracked record so `/develop` and future audits can point at it. One gap surfaced while writing this down: the strict TypeScript setting the standards call for is not actually turned on yet in `tsconfig.app.json`, and there is no Prettier configuration in the repo yet either, even though both are named as settled.

See `rationale.md` for the context, options considered, and full rationale behind this decision.

## Requirements

**User stories**:
- As the developer building Sherehe across many sessions, I want the documented standards enforced by tooling rather than memory, so a later session can't quietly drift from them.

**Acceptance criteria**:
- **AC-1**: `tsconfig.app.json` and `tsconfig.node.json` both set `"strict": true`, matching what `code-standards.md` already claims.
- **AC-2**: `npm run lint` (ESLint) runs clean on a fresh checkout, and a `format` script (Prettier check) exists and also runs clean.
- **AC-3**: A test runner (Vitest for unit tests, Playwright for end to end) is installed with working `test` scripts, even before any test files exist.
- **AC-4**: Adding a dependency not on `code-standards.md`'s approved list requires updating that list in the same change.

## Decision

**Chosen option**: Document and enforce going forward (all new code, from the first line).

Adopt the conventions already written in `context/code-standards.md` as the project's coding standard, enforced by TypeScript strict mode and ESLint from the first line of real code, since the codebase currently holds none.

## Standard definition

**Canonical pattern** (a Hono route handler on the Worker, the shape every owned-data route follows):
```typescript
// worker/routes/events.ts
app.get('/events/:id', clerkAuth, async (c) => {
  const userId = c.get('userId') // from the verified Clerk session, never from params or body
  const event = await db.query(
    'select * from events where id = $1 and user_id = $2',
    [c.req.param('id'), userId],
  )
  if (!event) {
    return c.json({ success: false, error: 'not found' }, 404)
  }
  return c.json({ success: true, data: event })
})
```

**Replaces** (there is no existing code to migrate; these are the anti patterns this standard rules out before any code is written):
- A React component querying Neon or calling NextSMS directly instead of going through `worker/routes/` via `fetch()`
- Reading `user_id` (or any ownership field) from the request body or an unverified param instead of the verified Clerk session
- A raw Clerk, Neon, or NextSMS error string reaching the client instead of a translated, human readable message
- A shared shape (`Event`, `Card`, `Guest`, `CheckIn`, `Payment`) redefined locally instead of imported from `shared/types.ts`
- Reaching for a new dependency, or a remembered/guessed library API, instead of resolving it through Context7 first and updating `library-docs.md`

**Enforcement**:
- TypeScript strict mode, project wide, both `worker/` and `src/` (`tsconfig.app.json`, `tsconfig.node.json`): now on, see Follow-up
- ESLint (`eslint.config.js`): already configured with `typescript-eslint` recommended, `react-hooks`, and `react-refresh`, plus `eslint-config-prettier` so it never disagrees with formatting; covers naming and hook rule violations but not this project's domain specific rules (the client/server boundary, error shape, dependency approval) since those need a person or a project specific lint rule to catch
- Prettier: named in `code-standards.md` under dev and test tooling; now configured, see Follow-up
- The client/server boundary, the `{ success, data?, error? }` response shape, and the dependency approval list are not mechanically enforceable by a generic lint rule; they rely on code review and, for `/develop` and any future audits, this spec plus `context/code-standards.md` being read before code is written

**Rollout**: enforce immediately, for all code, from the first line. The repository currently holds no product code (only the default Vite React TypeScript scaffold), so there is no existing violation to migrate and no need for a phased or file by file rollout.

**Exceptions**: none, with one already named in the standard itself: NextSMS is not indexed on Context7, so its documentation is looked up via its known Postman doc URL instead (see `library-docs.md` → Documentation Lookup Rule).

## Consequences

**Positive**:
- One enforced set of naming, error shape, and boundary rules for every session and every feature, instead of a rule that only exists until someone (or some session) forgets it
- The client/server boundary rule (no secrets, no direct Neon/NextSMS calls from `src/`) is the single rule most likely to cause a real security bug if missed, and it is now named as load bearing rather than one bullet among many
- Nothing to migrate: the standard applies from the first real feature, at zero retrofit cost

**Negative / tradeoffs**:
- The Context7 only lookup rule and the closed, update the list first dependency policy both add a small amount of friction to reaching for a new library or pattern mid build; that friction is the standard's intent (avoiding stale or hallucinated API usage across sessions), not an oversight, but it is a real cost on a solo build with no second engineer to share the overhead
- Most of the domain specific rules here (the boundary rule, the response shape, the dependency list) have no automated enforcement yet; they depend on this spec and `code-standards.md` actually being read before code is written, which a lint rule would guarantee and review convention does not

**Neutral**:
- Turning on `strict: true` and adding Prettier now, before any component or route exists, was a one time, low cost change; the same change after the first slice ships would have touched real code

## Follow-up

- [x] Add `"strict": true` to `tsconfig.app.json` and `tsconfig.node.json` now, before the first feature's code is written. `context/code-standards.md` already states this is project wide policy; the setting itself is currently missing. Done via `/develop coding standards & tooling`: both files set it, `tsc -b` compiles the existing scaffold clean with no migration needed.
- [x] Add a Prettier config (`.prettierrc` or equivalent), the `prettier` dev dependency, and a `format` (check) / `format:fix` npm script; `code-standards.md` lists Prettier under dev and test tooling but none of this exists in the repo yet. Done via `/develop coding standards & tooling`: `.prettierrc` (matching the scaffold's existing no semicolon, single quote style), `.prettierignore` (excludes prose docs under `context/`/`docs/`/`*.md`, formats only real source and config), `eslint-config-prettier` wired into `eslint.config.js` so lint and format never disagree.
- [x] `context/code-standards.md` names `vitest`, `playwright`, and implies a `jest` style test runner as approved dev and test dependencies, none of which are installed yet; no action needed before Slice 1, but the first feature that adds tests should install and configure whichever of these the engineer confirms are actually in use, since the doc does not disambiguate vitest versus a separate jest setup. Done via `/develop coding standards & tooling`, ahead of Slice 1 per the engineer's request: Vitest (`test`/`test:watch`, jsdom, Testing Library) with a passing placeholder smoke test on `App.tsx`, and Playwright (`test:e2e`) with a placeholder end to end test. Resolved the ambiguity by installing Vitest only, no separate Jest; nothing in the project needs Jest specifically. **Not verified end to end**: the sandbox this was built in blocks `cdn.playwright.dev`, so the Chromium binary `npx playwright install` needs could not be downloaded here; `test:e2e` is wired correctly but needs that install run once on a machine with normal network access before it can actually execute.
