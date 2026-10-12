# Verify: internationalization scaffold · spec 0003 · updated 2026-10-12
_Steps derived from the feature's "Done when" line in `docs/scope/scope.md` (spec 0003 has no numbered acceptance criteria). `/check verify` runs these; `/test` locks the durable ones._

## Commands
- [x] `npx tsc -b` → compiles clean, no type errors → DW-1, DW-2 (passed 2026-10-12 during `/develop`)
- [x] `npm run lint` → zero ESLint errors or warnings → DW-2 (passed 2026-10-12)
- [x] `npm run format` → "All matched files use Prettier code style!" → DW-2 (passed 2026-10-12)
- [x] `npm test` → 20 of 20 tests pass, including the language switch tests and the English and Swahili catalog parity test → DW-1, DW-2 (passed 2026-10-12)
- [x] `npm run build` → production build succeeds → DW-1 (passed 2026-10-12)
- [ ] `npm run test:e2e` → the existing Playwright shell spec still passes with the default English language → DW-1 (not run during `/develop`, no browser available in that environment)

## UI / manual
- [ ] Run `npm run dev`, open `/`, click "Kiswahili" in the header → headline, button label and footer switch to Swahili, and `<html lang>` becomes `sw` → DW-1
- [ ] Reload the page → it stays in Swahili. Remove the `locale` key from local storage and reload → it returns to English → DW-1
- [ ] Open each of the nine pages in Swahili (`/dashboard`, `/templates`, `/events`, `/billing`, `/check-in`, `/reports`, `/settings`, `/admin/activation` as a super admin, and an unknown address) → sidebar, breadcrumb, heading, empty state text and button are all Swahili → DW-1
- [ ] As an organizer, visit `/admin/activation` while in Swahili → you land on the dashboard and the notice appears in Swahili → DW-1
- [ ] Tab to the language switch and press Enter → the language toggles, and the accessible name reads "Badilisha lugha kuwa English" while in Swahili → DW-1
- [ ] Add a new string by following the pattern in the spec's Standard definition (a key in both `en` and `sw` catalogs, read with `useTranslation('<namespace>')`) → it renders in both languages and the parity test fails if one language is missing the key → DW-2
- [ ] Ask a native Swahili speaker to review the Swahili catalogs in `shared/locales/sw/` and `src/i18n/locales/sw/` → wording is natural and correct (the first draft was written by `/develop`) → DW-1

## Done when coverage
- DW-1 (a page renders in either language behind a locale switch): covered by the test, build and e2e commands and the manual steps on the switch, persistence, the nine pages, the guard notice and keyboard use
- DW-2 (new strings have an established pattern to follow): covered by the type, lint, format and test commands (including the parity test) and the manual step that adds a new string
