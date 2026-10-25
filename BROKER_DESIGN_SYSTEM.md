# Axivon Broker / Business Partner Portal Design System

**Version:** 2.0  
**Status:** Approved (Option 1: Warm Sand / Brass Gold)  
**Target:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion  

---

## 1. Visual Philosophy & Foundations

The Broker / Business Partner Portal is engineered as a **trustworthy, calm, business-like partner workspace** where independent brokers and strategic corporate partners track high-value leads, monitor project delivery, and manage financial payouts. 

The aesthetic is built around:
1. **Layered Near-Black Depth:** Avoiding harsh pure `#000000` pitch black; instead employing deep charcoal and slate surfaces (`#0A0B0D` page base, `#111317` card containers, `#171A1F` raised table rows) with crisp 1px structural dividers (`#22262D`).
2. **One Calm Accent (Warm Brass Gold):** `#C2A878` provides a prestigious, bespoke wealth management feel. It replaces loud AI neon gradients with refined, desaturated elegance.
3. **Restrained Semantic Statuses:** Muted status indicators (emerald for verified/completed, amber for pending review, brick-red for rejected, sky-blue for sent/in-progress) presented as small 6px indicator dots, thin 1px borders, and low-opacity (10%) tinted pill backgrounds.
4. **Financial Clarity & Tabular Numerals:** All currency amounts formatted in Indian numbering (`₹1,25,000` via `en-IN` locale) rendered in tabular monospace font to guarantee clean vertical alignment in ledgers and dashboard panels.

---

## 2. Color Palette & Token Architecture

### CSS Custom Properties (`:root`)
```css
/* Base Surfaces */
--bp-bg-page:       #0A0B0D;   /* Viewport base */
--bp-bg-card:       #111317;   /* Primary container / card */
--bp-bg-raised:     #171A1F;   /* Table rows, elevated modules, hover */
--bp-bg-inset:      #0E1013;   /* Form inputs, code blocks, telemetry */

/* Structural Borders */
--bp-border:        #22262D;   /* Primary 1px structural border */
--bp-border-2:      #2C313A;   /* Secondary border / nested divider */

/* Typography */
--bp-text-1:        #E6E8EB;   /* Primary text / main metric values */
--bp-text-2:        #8B94A1;   /* Secondary text / labels / descriptions */
--bp-text-3:        #566171;   /* Inactive metadata / tertiary */

/* Brand Accent — Warm Brass Gold */
--bp-accent:        #C2A878;   /* Primary CTA, active nav bar, focus ring */
--bp-accent-hover:  #D4BE92;   /* Hover state */
--bp-accent-dark:   #A88E5E;   /* Pressed / active fill */
--bp-accent-soft:   rgba(194, 168, 120, 0.12); /* Selected tabs, badge backgrounds */
--bp-accent-border: rgba(194, 168, 120, 0.28); /* Active outlines, pill borders */
--bp-accent-bg:     #1E1A14;   /* High-contrast badge background */
```

### Tailwind CSS v4 Theme Bridge
```css
@theme inline {
  --color-bp-accent: #C2A878;
  --color-bp-accent-hover: #D4BE92;
  --color-bp-accent-dark: #A88E5E;
  --color-bp-bg-page: #0A0B0D;
  --color-bp-bg-card: #111317;
  --color-bp-bg-raised: #171A1F;
  --color-bp-bg-inset: #0E1013;
  --color-bp-border: #22262D;
  --color-bp-border-2: #2C313A;
  --color-bp-text-1: #E6E8EB;
  --color-bp-text-2: #8B94A1;
  --color-bp-text-3: #566171;
}
```

---

## 3. Typography & Numerical Formatting

- **Font Sans:** `var(--font-inter)` / system fallbacks for all headings, labels, and paragraph copy.
- **Font Mono:** `var(--font-mono)` with `tabular-nums` for all currency amounts, lead codes (`LD-20261024-0005`), project codes (`PRJ-20261024-0005`), timestamps, and financial calculations.
- **Currency Helper:**
  ```typescript
  export function formatCurrencyINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  ```

---

## 4. Spacing, Borders & Radius

- **Spacing Grid:** 8px baseline (`p-2`, `p-3`, `p-4`, `p-6`, `gap-2`, `gap-4`, `gap-6`).
- **Corner Radii:**
  - Cards & Modals: `rounded-xl` (12px)
  - Inputs, Buttons & Pills: `rounded-lg` (8px)
  - Badges & Avatars: `rounded-full`
- **Borders:** 1px solid borders (`border border-[#22262D]`), avoiding heavy drop shadows.

---

## 5. Component Standards (`src/components/broker/`)

1. `<BrokerPageHeader title="..." subtitle="..." breadcrumb={[...]} actions={...} />`
2. `<BrokerMetricCard title="..." value="..." change="..." subtitle="..." icon={...} />`
3. `<BrokerStatusBadge status="..." variant="..." />`
4. `<BrokerButton variant="primary" | "secondary" | "ghost" | "danger" loading={...} disabled={...} />`
5. `<BrokerSkeletonTable rows={5} columns={4} />`
6. `<BrokerSkeletonCard />`
7. `<BrokerEmptyState title="..." description="..." icon={...} action={...} />`
8. `<BrokerErrorState message="..." onRetry={...} />`
9. `<BrokerDrawer isOpen={...} onClose={...} title="...">`

---

## 6. Motion & Micro-interactions

- **Durations:** 150ms – 250ms with `ease-out`.
- **Page Mount:** Fade + slide up 8px (`opacity: 0, y: 8` -> `opacity: 1, y: 0`).
- **Interactive States:** Hover border brighten (`border-[#2C313A]`), subtle elevation transition.
- **Loading:** Skeleton pulse matching final layout shape; zero infinite circular spinners.
- **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce`.
