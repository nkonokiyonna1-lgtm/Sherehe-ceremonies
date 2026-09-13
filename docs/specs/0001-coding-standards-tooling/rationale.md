# 0001. Coding standards and tooling: rationale

## Context

> ⚠️ Premise note: `context/code-standards.md` states "TypeScript strict mode is enabled project-wide (`tsconfig.json`)," but `tsconfig.app.json` has no `strict` setting at all, and there is no Prettier config or dependency anywhere in the repo despite Prettier being listed under dev and test tooling. This is not a contradiction in the standard itself, the standard is right, it is just not wired up yet. Since the codebase is still the plain Vite scaffold with no product code written, this is close to free to fix now (a one line `tsconfig.app.json` change plus a Prettier config and dependency) and gets expensive to retrofit once real code exists on top of loose types. See `index.md`'s Follow-up.

Sherehe is a solo built, greenfield project (own dependency install and hosting, no upstream code to protect) with a real, meaningfully long build ahead of it across several cross cutting concerns: money (Lipa Namba billing), unauthenticated write paths (the QR check in scan endpoint), and a shared type boundary between a Cloudflare Worker (`worker/`) and a React client (`src/`). Written conventions decay fast on a solo build with no second engineer to catch drift session to session, and the project's own standards doc already names this directly: the point of most of these rules is to "prevent pattern drift across sessions."

The forces at play are: (1) a real client and server split where a mistake (a Neon query or a secret reachable from `src/`) is a security bug, not a style nit, (2) money and check in data, both meaningfully sensitive to error handling that leaks a raw provider error or silently swallows a conflict, (3) a solo developer relying on an AI agent across many sessions, where memorized or guessed library APIs go stale as dependencies update, and (4) a project not yet begun in earnest, so the standard can be enforced from line one rather than migrated onto existing code. The consequence of not writing this down as a spec is not that the rules stop applying (they are already written in `context/code-standards.md`), it is that they stay outside the workflow's tracked decisions, invisible to `/architect`'s "already decided" checks and to anyone auditing why a build choice was made.

## Options considered

Options considered were not documented at decision time; these conventions were written directly into `context/code-standards.md` before this project adopted the scope and spec workflow, with no recorded alternative naming scheme, testing stack, or dependency approval process on file.

## Rationale

The standards already reflect the shape of the actual architecture (`worker/` versus `src/` versus `shared/`), so re deriving them from scratch would either reinvent the same rules or quietly drift from the architecture spec they were written alongside. The one meaningful choice this spec makes is the enforcement level: because no product code exists yet (`src/App.tsx` and `src/main.tsx` are still the unmodified Vite template), there is nothing to migrate and no reason to accept a documentation only standard that code review might miss. Enforcing from line one, mostly through the type checker and linter that are already in the project, costs nothing extra and closes the gap the premise note found before it can compound.
