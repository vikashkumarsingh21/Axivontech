# Employee Portal Design System

## Philosophy & Foundations
The Employee Portal design system provides a high-focus, distraction-free, sophisticated dark environment tailored for daily operational workflow. Built specifically for Next.js 16, React 19, and Tailwind CSS v4.

---

## 1. Color Palette

### Base Surfaces
- **Page Background (`--ep-bg`)**: `#0B0D10` (`var(--bg-base)`) - Deep blue-tinted void base.
- **Card Surface (`--ep-card`)**: `#111317` - Primary container for modules and widgets.
- **Elevated / Hover Surface (`--ep-raised`)**: `#171A1F` - Table rows, hover states, secondary containers.
- **Inset Surface**: `#0F1215` / `#10151B` - Form inputs, code blocks, and embedded telemetry wells.

### Borders
- **Primary Border (`--ep-border`)**: `#1E2530` - Default structural divider and card border.
- **Secondary Border (`--ep-border-2`)**: `#22262D` - Subtle nested borders, inner row separators.

### Typography
- **Primary Text (`--ep-text-1`)**: `#E6E8EB` - Headers, primary labels, main numerical metrics.
- **Secondary Text (`--ep-text-2`)**: `#8B94A1` - Body descriptions, subheaders, active metadata.
- **Muted Text (`--ep-text-3`)**: `#566171` - Inactive icons, timestamps, secondary placeholders.

### Brand Accent: Muted Teal
- **Primary Accent (`--ep-accent`)**: `#5FA8A0` - Primary actions, active navigation, focus rings.
- **Hover Accent (`--ep-accent-hover`)**: `#6DB8B0` - Interactive hover state.
- **Dark Accent (`--ep-accent-dark`)**: `#4A8A83` - Gradient fills and pressed states.
- **Soft Accent Background (`--ep-accent-soft`)**: `rgba(95, 168, 160, 0.10)` - Selected tabs, badges.
- **Accent Border (`--ep-accent-border`)**: `rgba(95, 168, 160, 0.25)` - Pill borders, active outlines.
- **Accent Dark Background (`--ep-accent-bg`)**: `#0D2220` - High-contrast badge backgrounds.

### Semantic Status
- **Success**: `#34D399` (`emerald-400`) - Completed tasks, present attendance, approved leaves.
- **Error**: `#F87171` (`red-400`) - Overdue milestones, rejected submissions, urgent priority.
- **Warning**: `#FBBF24` (`amber-400`) - Due today, pending approvals, medium priority.
- **Info**: `#67C5D8` (`cyan-400`) / Teal (`#5FA8A0`) - In progress, general notices.

---

## 2. Typography & Spatial System
- **Heading Font**: `var(--font-heading)` (`Manrope`, system fallbacks)
- **Body Font**: `var(--font-sans)` (`Inter`, system fallbacks)
- **Code/Telemetry**: `var(--font-mono)`
- **Grid Units**: 8px baseline (`p-2`, `p-4`, `p-6`, `gap-3`, `gap-4`, `gap-6`).
- **Border Radius**: 10px-12px (`rounded-xl`) for cards, 8px (`rounded-lg`) for small interactive elements, 16px (`rounded-2xl`) for hero widgets.

---

## 3. Motion & Micro-interactions
- Library: `framer-motion` (v12)
- Entry Animation: Gentle stagger `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}`.
- Lists: `AnimatePresence` for dynamic adds/removes.
- Shimmer Skeleton: Pulse animations for zero layout shifts during data resolution (`animate-pulse`).

---

## 4. Shared Employee Components
- `<PageHeader title="..." subtitle="..." action={...} />`
- `<SkeletonCard />`
- `<StatusBadge variant="info|success|warning|error|neutral|purple" />`
- `<EpButton variant="primary|secondary|ghost|danger" size="sm|md|lg" />`
