# 0003. Internationalization scaffold (English and Swahili)

**Date**: 2026-09-22
**Status**: Proposed

## Summary

This sets the one right way to write and show text in two languages, English and Swahili, across the app, the WhatsApp messages it sends, and the PDF cards it generates. It picks `react-i18next` for the browser and plain `i18next` for the worker, fixes where translated strings live, and fixes how the language a person is using gets tracked and used. Once this lands, a new page is written with translation keys from the start instead of English sentences that get retrofitted later.

## Requirements

Not applicable. This is a cross cutting standard, not a feature with its own acceptance criteria; see Standard definition below for what a developer must do to comply, and Consequences for what the scope 3 build task ("Build it: /develop internationalization scaffold") concretely wires up.

## Decision

**Chosen option**: `react-i18next` in `src/`, plain `i18next` in `worker/`, sharing the same JSON catalogs.

Use `i18next` as the shared translation engine in both `src/` (via `react-i18next`) and `worker/` (via plain `i18next`, instantiated per request), with namespaced JSON catalogs organized by feature area.

## Standard definition

**Canonical pattern**:

Client (`src/`), a component:
```tsx
import { useTranslation } from 'react-i18next'

export function DashboardNavItem() {
  const { t } = useTranslation('nav')
  return <span>{t('dashboard')}</span>
}
```

Client, `src/i18n/index.ts` (the one place the instance is created):
```ts
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import common_en from './locales/en/common.json'
import nav_en from './locales/en/nav.json'
import common_sw from './locales/sw/common.json'
import nav_sw from './locales/sw/nav.json'

i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { common: common_en, nav: nav_en },
    sw: { common: common_sw, nav: nav_sw },
  },
  interpolation: { escapeValue: false },
})
```

Worker (`worker/`), a route that sends a WhatsApp message or labels a PDF, request scoped, never a shared module level instance:
```ts
import i18next from 'i18next'
import common_en from '../shared/locales/en/common.json'
import common_sw from '../shared/locales/sw/common.json'

const SUPPORTED_LOCALES = ['en', 'sw'] as const
type Locale = (typeof SUPPORTED_LOCALES)[number]

function toLocale(value: unknown): Locale {
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : 'en' // never trust an unrecognised client-sent value
}

async function tFor(locale: Locale) {
  const instance = i18next.createInstance()
  await instance.init({
    lng: locale,
    resources: { en: { common: common_en }, sw: { common: common_sw } },
  })
  return instance.getFixedT(locale, 'common')
}

// worker/routes/distribution/whatsapp.ts
const t = await tFor(toLocale(body.locale)) // body.locale: the organizer's app language, sent by the client on every request whose response includes translated content
const message = t('cardSentMessage', { guestName })
```

**Replaces**:
- Hardcoded English string literals inline in JSX and TS, e.g. `title: 'Dashboard'` in `src/config/nav.ts`, `'Sign in to get started'` in `src/pages/LandingPage.tsx`.
- A future WhatsApp or PDF label written as a plain English template string in a worker route.

**Enforcement**:
No automated lint rule at this stage (no `eslint-plugin-i18next` or similar installed; adding one is a Follow-up item, not blocking today's scaffold). Enforced by review convention: a PR introducing a user visible string outside `src/i18n/locales/**` or `shared/locales/**` should be flagged in review.

**Rollout**:
New code only, immediately. Do not open a single migration PR to retrofit every existing string; extract the roughly twenty strings already in `src/config/nav.ts`, `src/pages/LandingPage.tsx`, `src/components/EmptyStatePage.tsx`, and `src/layouts/ShellLayout.tsx` as part of this scaffold's own build task (there is little enough of it that "extract as you scaffold" and "gradual migration" are the same amount of work here). This build task also creates the `shared/locales/` directory itself, which does not exist in the repo yet, and updates `src/test/setup.ts` to wrap test renders in an initialized i18next instance so `src/shell.test.tsx` and every later jsdom test that renders a translated component keeps passing.

**Exceptions**:
- Dates, times, and numbers (event dates, check in timestamps, attendance counts) are not reformatted per language at this stage; they keep one fixed format regardless of the active language. Revisit only if a real request for localized date/number display surfaces.
- Aria labels and other assistive text follow the same catalog convention as visible text; there is no exception for accessibility strings.
- Locale detection is manual only: the app defaults to English and changes only when the organizer uses the switch (no browser language auto-detection at this stage).

## Consequences

**Positive**:
- Every page written from now on is translation ready from its first commit; no retrofit pass is needed later.
- The worker/client split is settled once, here, instead of being improvised the first time a WhatsApp string needs translating (scope item 9).
- Namespacing by feature area (`common`, `templates`, `events`, `checkin`, `billing`, `nav`) mirrors the project's existing folder convention, so a developer already knows where a new key belongs.

**Negative / tradeoffs**:
- Two new runtime dependencies (`i18next`, `react-i18next`), which need adding to the approved dependency list in `context/code-standards.md` before `/develop` installs them (code standards currently requires updating that list first).
- No compile time check that a translation key exists or that both locale files stay in sync; a missing Swahili key only surfaces at runtime (falls back to English, logs a dev warning per the Standard definition's Exceptions), not at build time.
- The worker side pattern (`tFor(locale)`, `createInstance()` per call) is unused until the first server side feature that sends translated content is actually built (WhatsApp distribution, scope 9); until then it is a documented convention with no code exercising it, which is a real risk that it drifts before its first real use.

**Neutral**:
- The organizer's chosen language lives in `localStorage` only, until scope item 4 (auth and data foundation) adds a `users` table; at that point, migrate it to a `preferred_locale` column and stop trusting the client-sent `locale` field as the source of truth for the worker.
- The WhatsApp/PDF locale is always the organizer's own app language, not a per-event or per-guest setting; a guest who does not read English or Swahili is out of scope for now.

## Follow-up

- [ ] Add `i18next` and `react-i18next` to the approved dependency list in `context/code-standards.md` before `/develop` installs them.
- [ ] Once scope item 4 (auth and data foundation) ships a `users` table, migrate the organizer's language preference from `localStorage` to a `preferred_locale` column, and stop sourcing the worker's `locale` from an unauthenticated client field.
- [ ] Consider installing the `i18n-expert` community skill (`daymade/claude-code-skills`, via Claude Code: `npx skills add daymade/claude-code-skills`) for react-i18next install/configure/audit guidance; this chat session found it but could not install it here.
- [ ] Consider an `eslint-plugin-i18next` style lint rule once the string count grows past what review alone catches comfortably.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
