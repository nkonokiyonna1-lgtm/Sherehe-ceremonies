# UI Registry

Living document. Updated after every component is built or changed. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here (or in `src/components/`)
2. If yes — match its exact classes and prop conventions
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building any component — update this file with the component name, file path, and exact classes/props used.

---

## shadcn/ui Base Components (to install via `npx shadcn@latest add ...`)

No components are installed yet — this is the planned inventory to add as each is first needed. Install directly from shadcn rather than hand-building any of these.

| Component | shadcn add command | Purpose |
| ----------- | --------------------- | -------- |
| Sidebar layout | `npx shadcn@latest add sidebar-07` | Base app shell — collapsible sidebar, breadcrumb header, content area (see `ui-rules.md`) |
| Button | `npx shadcn@latest add button` | All interactive actions |
| Badge | `npx shadcn@latest add badge` | Status indicators (event/payment/check-in states) |
| Card | `npx shadcn@latest add card` | Bounded content sections |
| Input / Textarea / Select | `npx shadcn@latest add input textarea select` | Form fields |
| Form | `npx shadcn@latest add form` | `react-hook-form`-backed structured forms |
| Table | `npx shadcn@latest add table` | Event list, template list view, payment queue, attendance report |
| Dialog | `npx shadcn@latest add dialog` | Modals (e.g. confirm send, template preview) |
| Alert Dialog | `npx shadcn@latest add alert-dialog` | Destructive-action confirmation (delete event, reject claim) |
| Dropdown Menu | `npx shadcn@latest add dropdown-menu` | Row actions, user menu |
| Tabs | `npx shadcn@latest add tabs` | Template gallery filters (event type / tier), billing page regions |
| Avatar | `npx shadcn@latest add avatar` | Organizer/user identity in header |
| Popover | `npx shadcn@latest add popover` | Editor toolbar controls (color picker, etc.) |
| Sonner (Toast) | `npx shadcn@latest add sonner` | Action-level feedback (card sent, sync complete, conflict detected) |
| Skeleton | `npx shadcn@latest add skeleton` | Loading states for template gallery, dashboard |

---

## Sherehe-Specific Components (planned — none built yet)

Build these following `ui-rules.md`/`ui-tokens.md`; move each into a "Built" table below with exact classes/props once implemented.

| Component (planned)         | Suggested path                                   | Purpose |
| ------------------------------ | --------------------------------------------------- | --------- |
| `TemplateGallery`              | `src/features/templates/TemplateGallery.tsx`        | Grid of templates, filterable by event type and tier |
| `TemplateCard`                 | `src/features/templates/TemplateCard.tsx`           | Single template thumbnail + tier badge in the gallery |
| `CardEditorCanvas`              | `src/features/editor/CardEditorCanvas.tsx`          | Konva `Stage`/`Layer` wrapper, loads a template's design JSON |
| `EditorToolbar`                 | `src/features/editor/EditorToolbar.tsx`             | Text/color/image controls for the canvas |
| `QRCodeDisplay`                  | `src/features/distribution/QRCodeDisplay.tsx`       | Wraps `@lglab/react-qr-code`, consistent sizing across preview/WhatsApp/PDF |
| `PdfCardPreview`                 | `src/features/distribution/PdfCardPreview.tsx`      | `react-pdf` preview + download of a finished card |
| `WhatsAppSendButton`             | `src/features/distribution/WhatsAppSendButton.tsx`  | Triggers the NextSMS WhatsApp send action |
| `LipaNambaInstructions`          | `src/features/billing/LipaNambaInstructions.tsx`    | Paybill instructions + `wa.me/<support_number>` link |
| `EventActivationQueue`           | `src/features/admin/EventActivationQueue.tsx`       | Super-admin list of `pending_payment` events + activate action |
| `EventStatusBadge`               | Extend shadcn `Badge` usage                          | `pending_payment` / `active` / `completed` states, mapped per `ui-tokens.md` |
| `GuestListEntry`                 | `src/features/events/GuestListEntry.tsx`            | Name/contact entry, shown only when a card's QR mode is `unique_per_guest` |
| `CheckInScanner`                 | `src/features/checkin/CheckInScanner.tsx`           | Full-bleed camera QR scanner, PWA route |
| `SyncStatusIndicator`            | `src/features/checkin/SyncStatusIndicator.tsx`      | Always-visible queued/synced/conflict state on the check-in route |
| `LiveAttendanceDashboard`        | `src/features/checkin/LiveAttendanceDashboard.tsx`  | Real-time "X of Y checked in" during the event |
| `PostEventReport`                | `src/features/checkin/PostEventReport.tsx`          | Attendance summary + conflict-resolution list after the event |

---

## Built Components

Added 2026-09-15 by spec 0002 (app shell, design system, accessibility baseline).

### Installed shadcn/ui components (`src/components/ui/`)

| Component | Path | Purpose | Notes |
| ----------- | -------- | --------- | ------- |
| Sidebar (`sidebar-07` set) | `src/components/ui/sidebar.tsx` | App shell: collapsible sidebar, mobile Sheet overlay, `sidebar_state` cookie persistence | `SidebarProvider` wraps the shell layout; active item via `SidebarMenuButton isActive`; focus ring `ring-sidebar-ring` |
| Breadcrumb | `src/components/ui/breadcrumb.tsx` | Header breadcrumbs from route `handle.crumb` via `useMatches` | `BreadcrumbLink asChild` + router `Link` for crumbs, `BreadcrumbPage` for the last |
| Button | `src/components/ui/button.tsx` | All actions | `asChild` for link buttons; empty-state CTAs use `variant="default"` |
| Dropdown Menu | `src/components/ui/dropdown-menu.tsx` | Installed with sidebar block (used when the user menu arrives with feature 4) | not yet composed by app code |
| Avatar | `src/components/ui/avatar.tsx` | Stub user block, sidebar footer | `AvatarFallback` initials only this slice, no `AvatarImage` |
| Empty | `src/components/ui/empty.tsx` | Every page's empty state | composed via `EmptyStatePage` below |
| Sonner (Toast) | `src/components/ui/sonner.tsx` | Action-level feedback incl. the guard redirect notice | local edit: `useTheme` now comes from `@/hooks/use-theme` (hand-rolled provider) instead of `next-themes` |
| Separator, Sheet, Skeleton, Tooltip, Input | `src/components/ui/` | Pulled in as sidebar/sonner dependencies | Tooltip: app wraps `TooltipProvider` once in `App.tsx` |

### Sherehe shell components (built spec 0002)

| Component | Path | Purpose | Classes/props |
| ----------- | -------- | --------- | --------------- |
| `ShellLayout` | `src/layouts/ShellLayout.tsx` | The one layout route: skip link, sidebar, header (trigger + breadcrumbs + theme toggle), `<main id="main-content" tabIndex={-1}>`, `<Toaster>` | focus moves to `#main-content` on every pathname change except first mount |
| `AppSidebar` / `SidebarNav` | inside `ShellLayout.tsx` | Renders `visibleNavItems()` from `src/config/nav.ts` only; `aria-current="page"` on the active link; brand header; stub user footer | `SidebarMenuButton asChild isActive tooltip`; nav wrapped in `<nav aria-label="Main">` |
| `RequireSuperAdmin` | `src/components/RequireSuperAdmin.tsx` | Client-side UX guard on `/admin/activation`: redirect to `/dashboard` + `toast.warning` with stable id `activation-role-guard` (no stacked toasts) | never enforcement, see spec 0002 security model |
| `EmptyStatePage` | `src/components/EmptyStatePage.tsx` | Shared page shape for every shell destination: `<h1>` + `Empty` (icon media, title, one muted line, one CTA `Button asChild`) | used by `src/pages/pages.tsx` |
| `LandingPage` | `src/pages/LandingPage.tsx` | Layoutless `/`: wordmark, headline, CTA link to `/dashboard`, footer | theme toggle present; feature 4 swaps in Clerk `<SignIn />` |
| `ThemeProvider` / `useTheme` | `src/components/ThemeProvider.tsx`, `src/hooks/use-theme.ts`, `src/components/theme-context.ts` | Light/dark following OS until toggled; stored in `localStorage.theme`; pre-paint script in `index.html` prevents flash | values `'light' \| 'dark'`; stored choice wins on load |
| `ThemeToggle` | `src/components/ThemeToggle.tsx` | Header icon button, Sun/Moon, `aria-label` states the target theme | `Button variant="ghost" size="icon"` |

### Empty state copy in use (recorded per ui-rules.md)

- Dashboard: "Nothing to report yet" / attendance lands here when an event is live / CTA "Browse templates"
- Templates: "No templates yet" / CTA "Go to Events"
- Events: "No events yet" / CTA "Create an event" (lands on `/dashboard` until feature 6 builds creation)
- Billing: "No payments to show" / CTA "Go to Events"
- Check-In: "Check-in unlocks during a live event" / CTA "Go to Events"
- Reports: "No reports yet" / CTA "Go to Events"
- Settings: "Nothing to configure yet" / CTA "Go to Dashboard"
- Activation: "No events awaiting activation" / CTA "Go to Dashboard"
- NotFound: "We couldn't find that page" / CTA "Go to Dashboard"
- Guard toast: "Event Activation is only available to super admins."

## Notes

- The two planned-inventory tables above (`shadcn/ui Base Components`, `Sherehe-Specific Components`) still list items not built yet; rows for Sidebar, Button, Avatar, Sonner, and the dropdown/breadcrumb/empty adds are now built and recorded in the Built table. `/sync` may prune those rows later.
- Status colors for `Badge` variants are still unverified against an installed `Badge` (not installed in this slice; see `ui-tokens.md` Status Colors note).
