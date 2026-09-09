<!-- UI tokens: the design system values the agent must use for all styling -->

# UI Tokens

Design tokens for Sherehe. All colors are defined as CSS custom properties (OKLCH color space) and consumed through shadcn/ui's Tailwind config, which maps them to semantic utility classes. Use these tokens throughout — never hardcode a hex/oklch value directly in a component.

---

## How to Use

This project uses **Tailwind CSS + shadcn/ui**, with colors defined as CSS variables (not raw hex) and mapped in `tailwind.config.ts` under `theme.extend.colors` using shadcn's standard `hsl(var(--token))`-style pattern (here OKLCH-based). Both a light (`:root`) and dark (`.dark`) variant are defined.

```tsx
// Correct — uses shadcn semantic classes backed by the CSS variables below
className="bg-background text-foreground border-border"
className="bg-primary text-primary-foreground"

// Never — hardcoded OKLCH/hex values in a component
className="bg-[oklch(0.527_0.154_150.069)]"
```

To add a new token: add the CSS variable to both `:root` and `.dark` in the global stylesheet, then reference it in `tailwind.config.ts` — never inline a new color value in a component.

---

## Color Tokens (CSS variables)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.148 0.004 228.8);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.148 0.004 228.8);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.148 0.004 228.8);
  --primary: oklch(0.527 0.154 150.069);
  --primary-foreground: oklch(0.982 0.018 155.826);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.963 0.002 197.1);
  --muted-foreground: oklch(0.56 0.021 213.5);
  --accent: oklch(0.963 0.002 197.1);
  --accent-foreground: oklch(0.218 0.008 223.9);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.925 0.005 214.3);
  --input: oklch(0.925 0.005 214.3);
  --ring: oklch(0.723 0.014 214.4);
  --chart-1: oklch(0.872 0.007 219.6);
  --chart-2: oklch(0.56 0.021 213.5);
  --chart-3: oklch(0.45 0.017 213.2);
  --chart-4: oklch(0.378 0.015 216);
  --chart-5: oklch(0.275 0.011 216.9);
  --radius: 0.625rem;
  --sidebar: oklch(0.987 0.002 197.1);
  --sidebar-foreground: oklch(0.148 0.004 228.8);
  --sidebar-primary: oklch(0.627 0.194 149.214);
  --sidebar-primary-foreground: oklch(0.982 0.018 155.826);
  --sidebar-accent: oklch(0.963 0.002 197.1);
  --sidebar-accent-foreground: oklch(0.218 0.008 223.9);
  --sidebar-border: oklch(0.925 0.005 214.3);
  --sidebar-ring: oklch(0.723 0.014 214.4);
}

.dark {
  --background: oklch(0.148 0.004 228.8);
  --foreground: oklch(0.987 0.002 197.1);
  --card: oklch(0.218 0.008 223.9);
  --card-foreground: oklch(0.987 0.002 197.1);
  --popover: oklch(0.218 0.008 223.9);
  --popover-foreground: oklch(0.987 0.002 197.1);
  --primary: oklch(0.448 0.119 151.328);
  --primary-foreground: oklch(0.982 0.018 155.826);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.275 0.011 216.9);
  --muted-foreground: oklch(0.723 0.014 214.4);
  --accent: oklch(0.275 0.011 216.9);
  --accent-foreground: oklch(0.987 0.002 197.1);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.56 0.021 213.5);
  --chart-1: oklch(0.872 0.007 219.6);
  --chart-2: oklch(0.56 0.021 213.5);
  --chart-3: oklch(0.45 0.017 213.2);
  --chart-4: oklch(0.378 0.015 216);
  --chart-5: oklch(0.275 0.011 216.9);
  --sidebar: oklch(0.218 0.008 223.9);
  --sidebar-foreground: oklch(0.987 0.002 197.1);
  --sidebar-primary: oklch(0.723 0.219 149.579);
  --sidebar-primary-foreground: oklch(0.982 0.018 155.826);
  --sidebar-accent: oklch(0.275 0.011 216.9);
  --sidebar-accent-foreground: oklch(0.987 0.002 197.1);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.56 0.021 213.5);
}
```

`--primary` is a green tone — this is the app's core accent, used for primary actions and the sidebar's active-item indicator (`--sidebar-primary`). `--destructive` (red) is reserved for destructive actions and error states only.

---

## Color Usage Guide

| Element                     | Token                                  |
| ------------------------------ | ----------------------------------------- |
| Page background               | `bg-background`                          |
| Card / surface                 | `bg-card` `text-card-foreground`         |
| Sidebar surface                | `bg-sidebar` `text-sidebar-foreground`   |
| Sidebar active item            | `bg-sidebar-primary` `text-sidebar-primary-foreground` |
| Primary action (buttons, links)| `bg-primary` `text-primary-foreground`   |
| Secondary surface/action       | `bg-secondary` `text-secondary-foreground` |
| Muted text / disabled state    | `text-muted-foreground` on `bg-muted`    |
| Destructive action / error text| `bg-destructive` / `text-destructive`    |
| Default border                 | `border-border`                          |
| Form input border/background   | `border-input` `bg-background`           |
| Focus ring                     | `ring-ring`                              |
| Charts (attendance graphs)     | `--chart-1` … `--chart-5`, in order      |

### Event/Tier Accent Usage

No new colors are introduced for tiers or event types. VIP/VVIP visual "exclusivity" is achieved through template design (typography, imagery, borders/foil-style treatment) authored inside each template's Konva design data — not through app-level color tokens. Do not add a `gold`/`vip` color token; reuse `--primary`/`--accent` and let template content carry the exclusivity feel.

### Status Colors (check-in / event / payment states)

No dedicated status-color tokens exist yet beyond `--destructive`. Use shadcn `Badge` variants mapped as follows until/unless a dedicated status palette is added:

| Status                          | Suggested Badge treatment            |
| ---------------------------------- | --------------------------------------- |
| `pending_payment` / `queued`       | `secondary` variant (muted)            |
| `active` / `synced`                | `default` variant (primary)            |
| `conflict` / error states          | `destructive` variant                  |

Confirm this mapping against the actual `Badge` component once installed rather than assuming — see `ui-registry.md`.

---

## Typography

No custom type scale has been defined yet — default to Tailwind's standard scale (`text-sm`, `text-base`, `text-lg`, etc.) and shadcn's default font stack until a brand typeface is chosen. Revisit this section once a font decision is made; do not invent a scale in the meantime.

| Element              | Suggested size    | Weight | Color token             |
| ----------------------- | -------------------- | -------- | -------------------------- |
| Page heading            | `text-2xl`/`text-3xl`| 700    | `text-foreground`        |
| Section heading         | `text-lg`/`text-xl`  | 600    | `text-foreground`        |
| Body text               | `text-sm`/`text-base`| 400    | `text-foreground`        |
| Muted / timestamp       | `text-xs`/`text-sm`  | 400    | `text-muted-foreground`  |

---

## Spacing & Radius

- `--radius: 0.625rem` is the base border-radius token — shadcn derives `rounded-sm`/`rounded-md`/`rounded-lg` from it via its standard `calc()` pattern. Do not hardcode a different radius on cards, buttons, or inputs.
- Use Tailwind's default spacing scale (`gap-2`, `p-4`, `p-6`, `px-4 py-2`) — no custom spacing tokens have been introduced.

---

## Component Tokens

### Cards

```
background:    bg-card
text:          text-card-foreground
border:        border-border
border-radius: rounded-lg (derived from --radius)
padding:       p-4 or p-6
```

### Buttons (shadcn `Button`)

Use the shadcn `Button` component and its built-in variants (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`) — never a raw `<button>`.

```
default (primary):  bg-primary text-primary-foreground
secondary:           bg-secondary text-secondary-foreground
destructive:         bg-destructive text-white
outline:             border border-input bg-background
```

### Inputs (shadcn `Input`/`Form`)

```
background:    bg-background
border:        border-input
border-radius: rounded-md (derived from --radius)
focus:         ring-ring
```

### Sidebar (shadcn `sidebar-07` block)

```
surface:        bg-sidebar text-sidebar-foreground
active item:    bg-sidebar-primary text-sidebar-primary-foreground
border:         border-sidebar-border
focus ring:     ring-sidebar-ring
```

---

## Invariants

- Never hardcode an OKLCH/hex value in a component — always reference the CSS variable via its Tailwind class.
- Never introduce a new color token without adding it to both `:root` and `.dark`.
- Tier (VIP/VVIP/Single/Double) and event type never get dedicated color tokens — differentiation happens in template design content, not the app's color system.
- `--destructive` is reserved for destructive actions and true error states — never repurposed for a neutral "pending" state.
- Radius always derives from `--radius` — never hardcode a different radius value on a card, button, or input.
