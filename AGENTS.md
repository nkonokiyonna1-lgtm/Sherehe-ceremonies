---
description: Rules and context for AI Agents building Sherehe
globs: "*"
alwaysApply: true
---

# Sherehe - Agent Configuration

## REad Before Anything Else

Read the context files in this exact order before writing any code:

1. 'context/project-overview.md'
2. 'context/architecture.md'
3. 'context/ui-tokens.md'
4. 'context/ui-rules.md'
5. 'context/ui-registry.md'
6. 'context/code-standards.md'
7. 'context/library-docs.md'
8. 'context/build-plan.md'
9. 'context/progress-tracker.md'

## Build approach

Tracer Bullet: prove the whole pipe works end to end before building any part of it fully. Every slice is a thin, real, working thread through every layer (auth, DB, API, UI); breadth is added later by thickening one segment at a time. Set by `/scope` in `docs/scope/scope.md`.

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview a build
npm run preview
```

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._