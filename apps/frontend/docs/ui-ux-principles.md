# UI/UX Principles (Anvara Marketplace)

This document defines **how the Anvara web app should look and behave**. It is the source of truth for UI decisions, component styling, motion, error handling, and A/B testing usage.

The project uses **Tailwind CSS v4 (CSS-first)** and **CSS-variable design tokens** in `apps/frontend/app/globals.css`. All UI must be built on those tokens and shared primitives (Button/Dialog/Toast/etc.), not one-off styles.

---

## Product UI goals

- **Clarity over cleverness**: reduce cognitive load, prefer familiar patterns.
- **Consistency over novelty**: similar features must look/behave the same.
- **Accessibility-first**: keyboard, focus, semantics, and contrast are mandatory.
- **Speed + stability**: avoid layout shift, use skeletons, and keep interactions responsive.

---

## Global styling rules (non‑negotiable)

- **No hardcoded hex colors in components**.
  - Use tokens like `bg-[--color-primary]`, `text-[--color-muted]`, `border-[--color-border]`.
- **No ad-hoc button/modal implementations**.
  - Use shared primitives under `apps/frontend/app/components/ui/`.
- **44px minimum touch target** for clickable controls.
  - Buttons, icon buttons, checkbox rows, pagination items.
- **Always show a focus indicator** (use `:focus-visible`).
  - Never remove outlines without replacing them.
- **States must be defined** for interactive elements:
  - default, hover, active/pressed, focus-visible, disabled, loading.
- **Prefer semantic tokens** (success/warning/error) for status UI.
- **Respect Reduced Motion**:
  - animations should be subtle, short, and disabled/reduced under `prefers-reduced-motion`.
- **Theme-safe by default (Light/Dark)**:
  - Do not rely on Tailwind `gray-*`/`white`/`black` utility colors for surfaces.
  - Use semantic tokens (`--color-background`, `--color-foreground`, `--color-border`, `--color-surface-hover`, etc.) so components look correct in both themes.

---

## Design tokens (global)

### Color tokens (semantic)

Defined in `apps/frontend/app/globals.css`.

- **Brand**
  - `--color-primary`: primary action (e.g., “Book”, “Create”, “Confirm”)
  - `--color-primary-hover`: primary hover state
  - `--color-primary-light`: subtle brand tints (badges, highlights)
- **Surface & text**
  - `--color-background`: app background
  - `--color-foreground`: primary text
  - `--color-muted`: secondary text (help text, subtitles)
  - `--color-border`: borders/dividers
- **Interactive surfaces (derived)**
  - `--color-surface-hover`: neutral hover surface (works in light + dark)
  - `--color-surface-pressed`: neutral pressed surface (works in light + dark)
- **Status**
  - `--color-success`, `--color-warning`, `--color-error`

Rules:
- Use **muted text** for secondary information only; primary data should be `--color-foreground`.
- Use **primary color** for primary CTAs and selected states, not for decoration.
- Error UI uses error tokens; do not “invent” alternate reds/oranges per file.

### Radius, shadows, spacing (semantic)

We standardize:
- **Radius**: `sm` (chips), `md` (inputs), `lg` (cards/modals)
- **Shadows**: `sm` (cards), `md` (hovered cards), `lg` (modal elevation)
- **Spacing**: use Tailwind spacing scale; avoid arbitrary padding unless required.

### Z-index layers (semantic)

- **Base content**: default
- **Sticky header**: above content
- **Dropdowns**: above header
- **Dialogs**: above dropdowns
- **Toasts**: above dialogs

---

## Layout & spacing

- **Max content width**: `max-w-6xl` for main content container.
- **Page gutters**: `p-4` default, `md:p-6` for modal padding.
- **Vertical rhythm**: page sections use `space-y-6` by default.
- **Cards**:
  - use `rounded-lg` + `border border-[--color-border]`
  - hover affordance: `transition-shadow hover:shadow-md` (subtle, not jumpy)

---

## Typography

- **Font**: system font stack (already set globally).
- **Hierarchy**:
  - Page title: `text-2xl font-bold`
  - Section title: `text-lg font-semibold`
  - Card title: `font-semibold`
  - Body: default
  - Muted: `text-[--color-muted]`
- **Line length**:
  - Prefer 60–90 characters for longer paragraphs.
- **Numbers and prices**:
  - Price emphasis uses `text-[--color-primary]` + `font-semibold` or `text-2xl font-bold` in detail views.

---

## Buttons (definition + hierarchy)

### Button variants (standard)

- **Primary**: main CTA on a surface.
  - Used for: Book, Confirm, Create, Save, Login.
- **Secondary**: neutral action that is still important (often paired with Primary).
  - Used for: Cancel, Back, Close (when not icon-only).
- **Outline**: alternative CTA or optional path; can also be used for Secondary in dense UI.
- **Ghost**: tertiary actions in toolbars/menus.
- **Destructive**: actions that delete/irreversibly change state.
- **Link**: navigation-like actions inside text context.

### Default placement rules (primary action emphasis)

When there are two actions (e.g., **Cancel** and **Book**):
- **Primary action must be visually emphasized** (Primary variant).
- **Cancel must be less emphasized** (Secondary/Outline).
- Order (LTR): **Cancel on the left**, **Primary on the right**.

Examples:
- Booking confirm: Cancel (Secondary) + Confirm (Primary)
- Login prompt: Cancel (Secondary) + Login (Primary)
- Delete confirm: Cancel (Secondary) + Delete (Destructive)

### Button sizing rules

- Minimum height: **44px** (`min-h-[44px]`) for Primary/Secondary/Outline/Destructive.
- Padding:
  - default: `px-6 py-2.5`
  - compact: `px-4 py-2` (only in dense cards/lists)
- Border radius: `rounded-lg`.

### Button state rules

- **Hover**: subtle darkening or border emphasis.
- **Active/pressed**: slight scale down (e.g. `active:scale-[0.98]`) only for Primary/Destructive; avoid on small inline controls.
- **Disabled**: `disabled:opacity-50` plus `cursor-not-allowed` where appropriate.
- **Loading**:
  - Keep label stable (“Saving…”, “Booking…”) and disable the button.
  - Avoid layout shift (don’t change width).

### Icon buttons

- Size: 36–40px square.
- Must have `aria-label`.
- Hover uses a subtle surface highlight.

---

## Modals / Dialogs

We use dialogs for focused tasks: create/edit forms, confirmations, booking flows.

### Backdrop rules (blur requirement)

If there is a modal, the background must blur:
- Overlay: `bg-black/40 backdrop-blur-sm`
- Modal panel: `bg-[--color-background]` + `border-[--color-border]` + `shadow-lg`

This matches the existing “update campaign” / booking modal pattern.

### Behavior rules (accessibility)

- Must trap focus while open.
- ESC closes (except when explicitly blocked for destructive confirmation steps).
- Click outside closes for standard modals; destructive confirms should require explicit choice.
- Body scrolling should be locked while open.
- Modal must include:
  - Title (required)
  - Optional description
  - Close control (icon button) when appropriate

### Layout rules

- Width:
  - small confirms: `max-w-md`
  - forms: `max-w-2xl`
- Padding: `p-6` panel, overlay `p-4 md:p-6`
- Scroll:
  - If content is long, panel should scroll; header/footer remain visible if needed.

### Motion rules (consistent)

Dialog open:
- panel fade + slight scale (subtle)
- duration ~200–250ms
Dialog close:
- slightly faster, ~150–200ms

Do not use different animations per modal.

---

## Forms

### Labels and required fields

- Every input must have a `<label>` tied via `htmlFor`.
- Required fields show `*` with a red tone.
- Placeholder text is muted and never used as the only label.

### Input styling (standard)

- Container: full width.
- Border: `border-[--color-border]`
- Radius: `rounded-lg`
- Focus: `focus-visible:ring-2 focus-visible:ring-[--color-primary]` + `focus:border-transparent`
- Disabled: reduced opacity + prevent interactions.

### Validation and error patterns

- Field error: 1 line below field in red, e.g. `text-sm text-red-600`.
- Form error banner (submit failure): top of form, red tinted background.
- Error text should be:
  - specific (“Budget must be at least $1”)
  - actionable (“Try again” / “Contact support” only if relevant)

---

## Dropdowns / Select menus

Dropdowns must look and behave consistently across the app. In this codebase we currently prefer **native `<select>`** for simple dropdowns (filters, small enumerations) because it’s accessible by default and fast.

### When to use what

- **Use native `<select>`** when:
  - Options are a small list (roughly <= 20–30)
  - No search is needed
  - Options are stable and simple (enums: role, type, status)
- **Use an autocomplete/combobox** when:
  - There are many options (e.g., hundreds of publishers)
  - Searching is required
  - Options are remote/fetched

### Visual guidelines (must match theme)

- Use the shared `ui/Select` component (don’t hand-style `<select>`).
- The control uses:
  - `bg-[--color-background]` and `text-[--color-foreground]`
  - `border-[--color-border]`
  - hover/pressed surfaces: `--color-surface-hover` / `--color-surface-pressed`
  - focus ring: `--color-primary`
- Avoid `bg-white`, `text-gray-900`, `hover:bg-gray-50`, etc. These will look wrong in dark mode.

### Behavior + accessibility guidelines

- Always include a `<label>` tied via `htmlFor`.
- Keyboard:
  - Tab focuses the control.
  - Arrow keys change selection (native behavior).
- Disabled state must communicate clearly (reduced opacity + non-interactive).
- For filter dropdowns:
  - Include an “All …” option when appropriate (e.g., “All Types”).
  - Changing a filter should not cause focus loss; the UI should feel stable.

### Important note about native dropdown styling

The *opened dropdown list* (the OS-rendered menu) is not fully styleable in a cross-browser way. We rely on:

- `color-scheme` set by theme (light/dark) so native controls render appropriately.
- Token-based styling for the closed control so it matches the rest of the UI.
---

## Error states (page + component)

### Page-level errors (data fetch)

If a page fails to load:
- Provide a short message.
- Provide a back link if it’s a detail view.
- Provide a retry affordance when possible.

### Empty states (not an error)

If there’s simply no data:
- Explain what it means (“No campaigns yet”).
- Provide the next action (Primary: “Create campaign”).

---

## Loading states

Use the right loading UI for the situation:

- **Skeletons** for page-level data loads where layout is known (e.g. marketplace grid).
- **Inline spinners** for background updates (filtering, small transitions).
- **Button loading** for actions (submit, booking).

Rules:
- Avoid layout shift.
- Keep skeleton styling consistent (`.skeleton`).

---

## Notifications / Toasts

Toasts are for:
- Confirming actions (saved, booked, deleted).
- Non-blocking errors that don’t map to a specific field (e.g., “Network error, try again”).

Not for:
- Validation errors (use field errors).
- Blocking confirmations (use dialogs).

Design rules:
- Placement: bottom-right by default (desktop), bottom-center on small screens if needed.
- Stacking: newest on top; limit visible to ~3–5, older dismissed automatically.
- Duration:
  - success/info: 3–5s
  - warning: 5–7s
  - error: persistent or 7–10s, include “Dismiss”
- Each toast has:
  - icon or color accent indicating severity
  - concise title
  - optional description
  - optional action (e.g., “Undo”)

---

## Motion & animations

### Consistent motion tokens

All animations must use shared durations/easing:
- Fast: 120–160ms (pressed/close)
- Standard: 180–240ms (hover/fade)
- Slow: 260–320ms (large panel transitions)

### What should animate

- Dialog open/close (fade + slight scale).
- Cards hover shadow.
- Loading indicators (spinner/skeleton shimmer).

### What should NOT animate

- Layout reflow / element jumping.
- Color changes with long durations.

### Reduced motion

When `prefers-reduced-motion: reduce`:
- disable scale transitions
- keep fades minimal

---

## A/B testing usage guidelines

The project already supports cookie-based A/B tests:
- config registry: `apps/frontend/lib/ab-test-config.ts`
- assignment: `apps/frontend/lib/ab-test.ts`
- hook: `apps/frontend/hooks/use-ab-test.ts`
- tracking: `apps/frontend/lib/analytics.ts`

### What is safe to A/B test

- Visual presentation (CTA styling, copy, layout density)
- Ordering of non-critical UI elements
- Microcopy and instructional text

Avoid A/B testing:
- core business logic or permissions
- anything that can cause user-visible “flicker” or confusing switching mid-session

### Naming convention

- Use kebab-case IDs: `marketplace-cta-style`, `detail-page-layout`
- Keep descriptions user-understandable.

### Tracking rules

- Always track assignment (already done in the hook).
- For meaningful tests, add **conversion tracking** at the moment of success:
  - example conversion types: `booking_confirmed`, `campaign_created`, `filter_applied`

### Guarding against flicker

- Prefer tests that impact **client-only elements** or have a stable initial render.
- If server rendering needs variant selection in the future, move assignment server-side (out of scope for this doc, but keep in mind).

---

## UI review checklist (ship gate)

- Buttons: primary action is clear; min 44px; consistent variants.
- Dialogs: blurred backdrop; focus trap; ESC closes; consistent motion.
- Forms: labels + errors correct; submit failure shown; no placeholder-only fields.
- Loading: skeletons/spinners consistent; no layout shift.
- Errors: actionable, consistent, not overly technical.
- Toasts: used only when appropriate; severity correct.
- A/B tests: tracked, named, and have defined conversions.
- Accessibility: keyboard navigation works; focus-visible is clear; contrast acceptable.

---

## Dark / Light mode (theme system)

This project supports theme switching via **`<html data-theme="light|dark">`** and CSS variable overrides in `apps/frontend/app/globals.css`.

### How it works (implementation)

- A pre-hydration script in `apps/frontend/app/layout.tsx` sets `document.documentElement.dataset.theme` before React hydrates to prevent a light/dark flash.
- `ThemeProvider` persists the user preference in `localStorage` under `anvara.theme` and updates `data-theme`.
- `globals.css` defines:
  - system defaults via `prefers-color-scheme`
  - explicit overrides via `:root[data-theme='light']` and `:root[data-theme='dark']`
  - `color-scheme: light|dark` so native controls (like `<select>`) match the theme

### Authoring rules (how to build theme-safe UI)

- Use semantic tokens for all surfaces/text/borders:
  - background: `--color-background`
  - text: `--color-foreground`, `--color-muted`
  - borders: `--color-border`
  - hover/pressed: `--color-surface-hover`, `--color-surface-pressed`
- Avoid Tailwind grays for surfaces (`bg-gray-50`, `bg-white`, etc.). If you need a neutral surface state, use the tokens above.
- Keep brand tokens stable unless design explicitly requires different brand colors per theme.
