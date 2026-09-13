# Verify: coding standards & tooling · spec 0001 · updated 2026-09-13
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Commands
- [ ] `npx tsc -b` → compiles clean, no type errors, with strict mode on → AC-1
- [ ] `npm run lint` → zero ESLint errors or warnings → AC-2
- [ ] `npm run format` → "All matched files use Prettier code style!", zero files flagged → AC-2
- [ ] `npm run test` → Vitest runs the placeholder `App.test.tsx` and passes → AC-3
- [ ] `npm run test:e2e` → Playwright runs the placeholder `e2e/scaffold.spec.ts` and passes (needs `npx playwright install chromium` first, on a machine with normal network access; blocked in the sandbox this was built in) → AC-3
- [ ] `npm run build` → production build succeeds end to end (implies AC-1 held under the real build, not just `tsc -b`) → AC-1

## Manual
- [ ] Open `tsconfig.app.json` and `tsconfig.node.json`, confirm `"strict": true` is present in both → AC-1
- [ ] Try adding an unapproved dependency (e.g. `npm install left-pad`) without first editing `context/code-standards.md`'s approved list, confirm this is a self review catch, not a mechanical block (no lint rule or CI gate enforces this yet, per the spec's Enforcement section) → AC-4

## Acceptance-criteria coverage
- AC-1 (strict mode on in both tsconfigs): covered by the `tsc -b` command, the `build` command, and the manual tsconfig check
- AC-2 (lint and format both clean): covered by the `lint` and `format` commands
- AC-3 (working test and test:e2e scripts, even with minimal tests): covered by the `test` and `test:e2e` commands; `test:e2e` needs a one time `npx playwright install` outside this sandbox before it can run
- AC-4 (dependency approval convention): covered by the manual step; this AC is a process convention, not a mechanically enforced one, so `/check verify` can confirm the convention is documented and followed but cannot gate it automatically
