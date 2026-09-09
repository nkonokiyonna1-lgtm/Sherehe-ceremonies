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

_None yet — add entries here as components are built, following the same table format above (Component / Path / Purpose / exact classes and props used)._
