# 0003. Internationalization scaffold — rationale

## Context

> ⚠️ Premise note: the scaffold's job is to fix the pattern every future page, WhatsApp message, and PDF label must follow, not to localize features that do not exist yet. WhatsApp distribution (scope 9) and the Konva card editor / PDF pipeline (scope 7, 8) have no code yet; `worker/` itself has not been scaffolded. Building their translated copy now would mean writing strings for routes that are not there. This spec fixes the convention those features build to later (see `index.md`'s Standard definition); the build task this spec actually unlocks today is installing the libraries and extracting the roughly twenty strings that already exist in `src/config/nav.ts`, `src/pages/LandingPage.tsx`, and the shell components.

Sherehe targets organizers in Tanzania and East Africa; the product overview names Swahili as a first class audience, not an afterthought. Every page, every WhatsApp message sent through NextSMS, and every PDF card label is currently a hardcoded English string (sampled directly: `src/config/nav.ts`'s `navItems` array hardcodes `title: 'Dashboard'`, `'Templates'`, `'Events'`, and five more; `src/pages/LandingPage.tsx` hardcodes its headline, subhead, and CTA text inline in JSX). Left alone, each new feature adds more of them, and a later retrofit means re-reading and re-testing every page at once instead of writing translated strings once, as each page is first built.

Two constraints shape the decision. First, this scaffold is scope item 3, sequenced before item 4 (auth and data foundation), so there is no `users` table and no session concept yet; a chosen language has nowhere in the database to live. Second, `worker/` (the Hono API) has not been scaffolded, and Cloudflare Workers run each request on a shared isolate, so any server side translation lookup must be request scoped, never a module level mutable "current language."

## Options considered

### Option 1: react-i18next (with plain i18next in the worker)

`i18next` is the translation engine (key lookup, fallback, pluralization, interpolation); `react-i18next` is a thin React binding (`useTranslation`, `Trans`) over it. Because `i18next` itself has no framework dependency, the same engine and the same JSON catalogs run in `worker/` (plain `i18next`, no React) for WhatsApp and PDF strings, so there is one translation format for the whole codebase, not two.

**Pros**:
- One catalog format and one key lookup engine shared by `src/` and `worker/`, so a WhatsApp message and the page that triggered it can literally cite the same key.
- Namespaces and lazy loading are built in, which matches the project's feature folder convention (`templates/`, `events/`, `checkins/`) directly.
- By far the largest ecosystem and the most Stack Overflow / GitHub issue coverage for the specific bugs a team hits (missing key detection, interpolation edge cases, testing helpers).

**Cons**:
- Loose, string based message format (no compile time check that a key exists or that its interpolation variables match usage); a typo'd key silently falls back instead of failing a build.
- More configuration surface than a minimal tool: instance setup, namespace wiring, and (unused here) plugin ecosystem add first read complexity for a two language, no plural-heavy-language project.

### Option 2: react-intl / FormatJS

ICU MessageFormat based; the message format itself encodes plurals, gender, and number/date formatting in a single string syntax standardized outside any one library.

**Pros**:
- ICU MessageFormat is a real standard, not a library specific format, so the message strings themselves are portable to a future translation vendor.
- Very strong built in number, date, and plural formatting, which the project has explicitly deferred (index.md's Standard definition keeps date and number formatting fixed regardless of language), so most of this option's strength goes unused right now.

**Cons**:
- No first class worker/server side translation story as clean as plain `i18next`; using it outside React for the WhatsApp/PDF strings means either a second tool in the worker or bending FormatJS's lower level `intl-messageformat` package to do a job `i18next` core does natively.
- ICU syntax has a steeper authoring curve for a small team writing straightforward UI and message copy, with no current requirement (grammatical gender, complex plurals) that needs it.

### Option 3: Lingui

Compile time string extraction: `lingui extract` scans source for `t` macro calls and generates catalogs, with the smallest runtime bundle of the three because most work happens at build time.

**Pros**:
- Smallest client bundle at runtime, and extraction removes the risk of a key existing in code but never making it into a catalog file.
- Good TypeScript ergonomics with the macro approach.

**Cons**:
- Needs a Babel or SWC macro plugin wired into the Vite build, and a second, separate mechanism to reach `worker/` for WhatsApp/PDF strings (the macro is a client build step, not a portable runtime engine); this is a bigger toolchain change than the other two options for a small, early stage team.
- Smaller community than `i18next`; fewer examples for the Cloudflare Workers + Vite combination this project runs.

## Rationale

The worker/client split is the deciding force: the moment "all three" (UI, WhatsApp, PDF) was chosen as this scaffold's scope, the library needs a server side story that is not an afterthought, and `i18next` is the only one of the three options whose core engine is framework agnostic by design rather than by workaround (`architecture.md`'s client/server boundary rule that no Neon query or secret ever reaches `src/` applies the same discipline here: translation lookup logic should not need to differ by layer). `react-intl`'s strength (ICU formatting) answers a problem this project has explicitly deferred (date/number formatting per language), so it buys little today. `Lingui`'s compile time extraction is attractive but adds a build toolchain change and still leaves the worker side to solve separately; for a two person, Foundation phase codebase with roughly twenty strings today, the operational simplicity of one well documented, boring engine outweighs Lingui's bundle size edge.
