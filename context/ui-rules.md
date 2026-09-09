<!-- UI rules: how the interface behaves — layout, interactions, and component patterns -->

# UI Rules

Concise rules for building Sherehe's UI. This is a from-scratch build on shadcn/ui — shadcn's own component defaults are the source of truth for visual decisions unless a rule below says otherwise. These rules cover the most important patterns without over-specifying every detail.

---

## Font

No custom typeface has been chosen yet — use shadcn's default font stack (system/sans) until a brand font is decided. Do not introduce a display font ad hoc per component; revisit this file once a decision is made.

---

## Layout

Base app layout follows the shadcn `sidebar-07` block pattern:

- **Collapsible left sidebar** — houses primary navigation (Dashboard, Events, Templates, Check-in, Reports, and Payment Activation for super admins only).
- **Header** with breadcrumbs reflecting the current route, sitting above the content area.
- **Content/children area** — the actual page content renders here; pages do not re-implement their own top-level frame.
- This is a browser-based web app, not an Electron shell — the layout should still feel like an application (sidebar + content), not a centered marketing page, even though it runs in a browser tab.
- Main content area uses standard Tailwind padding (`p-4`/`p-6`), consistent across pages.

The **Check-in route** is the one exception: on small/mobile viewports during active scanning, it may go full-bleed (hide the sidebar) so the camera view has maximum space — but it still lives inside the same app/router, not a separate deployment.

---

## Navigation

- Sidebar items: Dashboard, Events, Templates, Check-in, Reports — visible to all organizers. Payment Activation is visible only to users with the super-admin role (checked via Clerk role claim, never a client-side flag).
- Active item: use shadcn `sidebar-07`'s built-in active-state styling (`bg-sidebar-primary`/`text-sidebar-primary-foreground`) — don't hand-roll a different active indicator.
- Breadcrumbs in the header should reflect real navigation depth (e.g. `Events / Amina's Wedding / Cards / Edit`), not just the page title repeated.
- Dark mode is supported via the `.dark` class and the token set in `ui-tokens.md` — every new component must include both light and dark treatment from the start, not added later.

---

## Cards

Use the shadcn `Card` component for any bounded content section (event summary, template preview, stat tile on the live dashboard).

```
background:    bg-card
text:          text-card-foreground
border:        border-border
border-radius: rounded-lg
padding:       p-4 or p-6
```

Never use a colored card background — color is carried by badges, text, and (for VIP/VVIP) the template's own design content, never the card surface.

---

## Typography Hierarchy

Until a custom type scale is set (see `ui-tokens.md`), use this relative hierarchy consistently:

**Section headings** — page/card section titles: `text-lg`/`text-xl`, weight 600, `text-foreground`
**Body / primary content**: `text-sm`/`text-base`, weight 400–500, `text-foreground`
**Secondary / muted text** — labels, timestamps, helper text: `text-xs`/`text-sm`, weight 400, `text-muted-foreground`

---

## Badges / Status Indicators

Always use shadcn's `Badge` component rather than a hand-rolled pill. Map event/payment/check-in states to `Badge` variants per `ui-tokens.md`'s Status Colors table (`secondary` for pending states, `default` for active/synced, `destructive` for conflicts/errors). Do not introduce a new visual status system — extend the `Badge` variant mapping instead.

---

## Buttons

Always use the shadcn `Button` component (`variant="default"|"secondary"|"destructive"|"outline"|"ghost"|"link"`, plus `size`) — never a raw `<button>`. Primary organizer actions (Create Event, Save Card, Send via WhatsApp) use `default`. Destructive actions (Delete Event, Reject Payment Claim) use `destructive` and should be confirmed via a shadcn `AlertDialog` before executing.

---

## Forms

Use shadcn's `Form` (built on `react-hook-form`) + `Input`/`Select`/`Textarea` primitives for any structured input (event creation, card text fields, guest name entry) — never a raw uncontrolled `<input>`. Validation errors render inline under the field, using `text-destructive`, never as a raw alert/toast for field-level issues. Toasts (shadcn `Sonner`/`Toast`) are reserved for action-level feedback (e.g. "Card sent", "Sync complete", "Check-in conflict detected").

---

## Tables

Use shadcn's `Table` primitives for any list view (events list, template gallery in list mode, payment-activation queue, post-event attendance report).

- No alternating row colors — rely on `border-border` row separators and `hover:bg-muted/50`.
- Column headers: `text-xs`, `font-medium`, `text-muted-foreground`, uppercase optional.
- Keep visible columns focused (name/status/date and 1–2 key numbers) — push secondary detail into a row-click detail view rather than crowding the table, especially on the attendance report.

---

## Card Editor (Konva)

- The Konva canvas sits inside its own bounded editor layout, not a plain page — a toolbar (text/color/image controls, using shadcn `Button`/`Popover`/`Select`) alongside the canvas, and a persistent Save action.
- Editable vs. fixed template regions must be visually distinguishable in the editor (e.g. a subtle outline on editable fields) so organizers don't assume the entire template is freely editable.
- Tier-specific design elements (VIP/VVIP exclusivity styling) are part of the template's Konva design data, not toggled by app-level UI controls — the editor doesn't need a "make this VIP" switch, tier is chosen when the template itself is picked.

---

## QR & Distribution UI

- QR codes render via `@lglab/react-qr-code` sized consistently across the card preview, the WhatsApp-sent image, and the PDF export — don't let three different sizes drift across those three surfaces.
- The "Send via WhatsApp" and "Download PDF" actions sit together on the same distribution step, not on separate pages, since an organizer typically does both for the same card.

---

## Check-In (PWA route) UI

- Full-bleed camera viewfinder is the dominant element on this route; status (scanning/success/duplicate/conflict) shows as a large, unambiguous inline state change directly under or over the viewfinder — not a small toast easy to miss mid-scan.
- Sync/offline state (queued scans pending upload) is always visible on this screen, not hidden in a menu — an organizer at a door needs to trust, at a glance, whether scans are syncing.
- A checked-in confirmation should be visually distinct from a duplicate/conflict result at a glance (e.g. success vs. destructive-toned full-screen flash), since staff will be scanning quickly under time pressure.

---

## Empty States

Every list/section that can be empty must have a minimal empty state:

- Short descriptive text in `text-muted-foreground`
- Optional icon above the text (e.g. `lucide-react`, shadcn's default icon set)
- A CTA button if there's a logical next action (e.g. "Create your first event", "Browse templates")

---

## Progressive Disclosure & Simplicity

- Hide advanced options (e.g. QR mode selection, guest list entry) until they're contextually relevant — don't show guest-list UI at all when a card's QR mode is `general`.
- Keep even spacing using Tailwind's spacing scale, not arbitrary pixel values.
- Maintain alignment across form fields, table columns, and the template gallery's grid.

---

## Do Nots

- Never use a raw hex/oklch value or an unlisted Tailwind color class — only the tokens in `ui-tokens.md`.
- Never hand-roll a badge, button, form input, table, or dialog — use the corresponding shadcn primitive.
- Never skip dark-mode classes on a new component.
- Never show a raw error message from Clerk/Neon/NextSMS to the user — translate it first (see `code-standards.md`).
- Never let the check-in scanning screen block on a network call before giving scan feedback — local queue write comes first, always (see `architecture.md`).
- Never introduce a new color token for tier/event-type differentiation — that differentiation belongs in template design content, not the app chrome.
