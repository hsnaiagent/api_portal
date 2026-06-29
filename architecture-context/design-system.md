# Portal Design System

## Document Type

**Decision** — authoritative UI guidelines for the Enterprise API Portal mockup and future production UI.

---

## Brand Color Source of Truth

All portal UI colors must come from the official brand palette:

| Location | Role |
|----------|------|
| **`portal/public/Brand Colors.csv`** | Authoritative palette (design / stakeholder export) |
| **`portal/src/config/brand-colors.ts`** | TypeScript mirror — import for programmatic use |
| **`portal/src/index.css`** (`@theme`) | Tailwind tokens — use `brand-*` utility classes in components |
| **`portal/src/config/brand.ts`** | Semantic aliases (primary, link, accent) for app metadata |

**When adding or changing UI:** read `Brand Colors.csv` first. Do not introduce ad-hoc hex values or third-party palette colors (e.g. raw Tailwind `purple-*`, `indigo-*`) unless documented as a functional exception (errors, warnings).

---

## Palette (Brand Colors.csv)

| Name | Hex | Tailwind token | Typical use |
|------|-----|----------------|-------------|
| Green | `#84BD00` | `brand-accent` | Accent highlights, metric emphasis, logo gradient |
| Dark Green | `#00843D` | `brand-green` | Primary buttons, avatars, success toasts, active step pills |
| Blue | `#00A3E0` | `brand-blue` | Text links, secondary CTAs, focus rings on inputs |
| Dark Blue | `#0033A0` | `brand-blue-dark` | Link hover, gradient end, secondary emphasis |
| Gray | `#5F6369` | `brand-gray` / `slate-500` | Muted text, icons, labels |
| Neutral Gray | `#C0C0C0` | `brand-neutral-gray` / `slate-400` | Disabled hints, subtle icons |
| Light Gray | `#DADADA` | `brand-light-gray` / `slate-200` | Borders, dividers |
| Dark Gray | `#323232` | `brand-dark-gray` / `slate-800` | Headings, body text |
| White | `#FFFFFF` | `brand-white` | Cards, header, sidebar background |

### Derived tints (backgrounds only)

| Token | Hex | Use |
|-------|-----|-----|
| `brand-green-light` | `#E6F2EC` | Active sidebar item, chip backgrounds, approved/published badges |
| `brand-blue-light` | `#E6F4FB` | AI panel backgrounds, tag chips, in-progress lifecycle badges |
| Page background | `#FAFAFA` | App shell main area (`slate-50`) |

---

## Semantic Usage Rules

### Primary actions

```html
<button class="rounded-lg bg-brand-green px-4 py-2 text-brand-white hover:bg-brand-green-dark">
```

Use **Dark Green** (`brand-green`) for filled buttons: Submit, Register, Accept, Sign in.

### Links & navigation text

```html
<a class="text-brand-blue hover:text-brand-blue-dark hover:underline">
```

Use **Blue** for inline links and text-only actions. Do not use green for hyperlinks.

### Active navigation

```html
<a class="bg-brand-green-light text-brand-green">...</a>
```

Sidebar / tab active state: light green background + dark green text.

### Accent & metrics

```html
<span class="text-brand-accent">42</span>
```

Use **Green** (`brand-accent`) for KPI numbers and positive emphasis where a button is not intended.

### Hero / marketing panels

Login and empty-state heroes may use a brand gradient:

```html
<div class="bg-gradient-to-br from-brand-green to-brand-blue-dark text-brand-white">
```

### Borders & surfaces

| Element | Classes |
|---------|---------|
| Card | `border border-slate-200 bg-brand-white rounded-xl` |
| Input | `border border-slate-200 focus:border-brand-blue outline-none` |
| Page canvas | `bg-slate-50` (mapped to `#FAFAFA`) |

### Surfaces & text on color

| Element | Classes | Never use |
|---------|---------|-----------|
| Card / panel background | `bg-brand-white` | `bg-white` |
| Text on colored buttons | `text-brand-white` | `text-white` |
| Modal overlay | `bg-black/40` | — (allowed exception) |

### AI feature styling

**Purple is restricted to two components only:**
- `portal/src/components/ai/AIBadge.tsx` — small inline AI label chips
- `portal/src/components/ai/AIThinkingOverlay.tsx` — loading/result overlay internals

Everything else AI-related uses brand blue:

```html
<!-- AI action button -->
<button class="bg-brand-blue text-brand-white hover:bg-brand-blue-dark">

<!-- AI panel wrapper (around AIThinkingOverlay) -->
<div class="rounded-xl border border-brand-blue/30 bg-brand-blue-light p-6">

<!-- AI inline link / helper text -->
<button class="text-brand-blue">...</button>
```

Use the `<AIBadge />` component for score/relevance chips — do not recreate purple badge markup inline.

### Logo

- File: `portal/public/portal-logo.svg`
- Gradient uses **Green** → **Blue** from the palette
- Reference via `BRAND.logoPath` in `brand.ts`

---

## Typography

- **Font stack:** system UI (`system-ui, -apple-system, Segoe UI, Roboto, sans-serif`) — defined in `index.css`
- **Headings:** `text-brand-dark-gray` or `text-slate-800` (same value)
- **Body:** default body color `#323232`
- **Muted:** `text-slate-500` / `text-brand-gray`

---

## Component Checklist (new UI)

Before merging any new screen or component:

1. [ ] Colors come from `brand-*` or mapped `slate-*` tokens — no raw hex in JSX
2. [ ] Primary buttons use `bg-brand-green text-brand-white`, not `bg-blue-*` or `bg-purple-*`
3. [ ] Links and AI helper text use `text-brand-blue`, not `text-brand-green` or `text-purple-*`
4. [ ] Focus states use `focus:border-brand-blue`
5. [ ] Cards and panels use `bg-brand-white` + `border-slate-200` — never bare `bg-white`
6. [ ] Text on colored backgrounds uses `text-brand-white` — never bare `text-white`
7. [ ] AI panels use `bg-brand-blue-light border-brand-blue/30`; purple only inside `AIBadge` / `AIThinkingOverlay`
8. [ ] Lifecycle/classification badge colors defined in config files — not inline in components
9. [ ] If a new semantic color is needed, add it to `brand-colors.ts` and `@theme` — do not inline

---

## Color Migration Reference

When reviewing or updating existing components, replace off-palette classes:

| Old pattern | Replace with | Context |
|-------------|--------------|---------|
| `bg-white` | `bg-brand-white` | All card/panel surfaces |
| `text-white` | `text-brand-white` | Text on brand-green/blue buttons |
| `bg-purple-600` / `hover:bg-purple-700` | `bg-brand-blue hover:bg-brand-blue-dark` | AI action buttons |
| `bg-purple-50` / `border-purple-200` | `bg-brand-blue-light border-brand-blue/30` | AI panel wrappers |
| `text-purple-600` / `text-purple-900` | `text-brand-blue` / `text-brand-dark-gray` | AI helper links / headings |
| `bg-blue-600` | `bg-brand-blue` | Info toasts |
| `bg-blue-100 text-blue-700` | `bg-brand-blue-light text-brand-blue-dark` | Internal classification, in-dev lifecycle |
| `bg-green-100 text-green-700` | `bg-brand-green-light text-brand-green` | Public classification |
| `bg-teal-*` / `bg-indigo-*` | `bg-brand-blue-light text-brand-blue*` | Lifecycle progress states |
| `bg-purple-100 text-purple-700` (inline) | Use `<AIBadge />` component | AI score/relevance chips |

**Keep unchanged:** `red-*` (errors), `orange-*` / `yellow-*` (warnings), `purple-*` inside `AIBadge.tsx` and `AIThinkingOverlay.tsx` only, `bg-black/40` (modals).

---

## Functional Color Exceptions

These may use standard semantic colors outside the brand palette:

| Purpose | Allowed |
|---------|---------|
| Error / rejected | `red-*` |
| Warning / pending review | `yellow-*`, `orange-*` |
| Destructive action | `red-600` |
| AI inline badges | `purple-*` in `AIBadge.tsx` only |
| AI loading overlay | `purple-*` in `AIThinkingOverlay.tsx` only |

Lifecycle status badges in `lifecycle.ts` and classification badges in `classification.ts` use brand tokens where possible; functional colors (red/orange/yellow) remain for error/warning states.

### Lifecycle badge token map (`lifecycle.ts`)

| Status | Classes |
|--------|---------|
| draft, retired | `bg-slate-100 text-slate-*` |
| proposed, in_development | `bg-brand-blue-light text-brand-blue-dark` |
| in_testing | `bg-brand-blue-light text-brand-blue` |
| approved, published | `bg-brand-green-light text-brand-green` |
| under_review | `bg-yellow-100 text-yellow-800` (exception) |
| deprecated | `bg-orange-100 text-orange-700` (exception) |
| rejected, emergency_retired | `bg-red-*` (exception) |

### Classification badge token map (`classification.ts`)

| Level | Classes |
|-------|---------|
| restricted | `bg-red-100 text-red-700` (exception) |
| confidential | `bg-orange-100 text-orange-700` (exception) |
| internal | `bg-brand-blue-light text-brand-blue-dark` |
| public | `bg-brand-green-light text-brand-green` |

---

## File Map (implementation)

```
portal/public/Brand Colors.csv     ← stakeholder source
portal/src/config/brand-colors.ts  ← TS constants
portal/src/config/brand.ts         ← app branding metadata
portal/src/index.css               ← Tailwind @theme tokens
portal/src/components/             ← consume brand-* classes
```

---

## Related Documents

- [`target-architecture.md`](target-architecture.md) — Portal plane UI scope
- [`requirements.md`](requirements.md) — NFRs for accessibility and consistency
- [`decisions.md`](decisions.md) — ADRs affecting portal behavior
- [`../portal/README.md`](../portal/README.md) — running the mockup locally
