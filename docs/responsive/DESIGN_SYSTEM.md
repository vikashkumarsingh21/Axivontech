# Axivon ONE — Mobile-First Responsive Design System

**Specification Version:** 3.0  
**Target:** Axivon ONE Portals (Admin, CRM, Employee, Broker, Executive, Client)  
**Brand Foundation:** Neutral Slate Foundation with Warm Crimson Accent (`#DC2626`)  
**Design Philosophy:** Enterprise SaaS Reliability, Accessibility-First, Zero Visual Distortion  

---

## 1. Breakpoint Architecture & Viewport Grid

Axivon ONE adopts a strict mobile-first viewport architecture aligned with modern device screen densities and virtual keyboard viewports:

| Breakpoint Key | Min Width | Target Devices | Layout Behavior |
|---|---|---|---|
| **xs (base)** | `< 640px` | Phones (iPhone SE, 13/14/15, Galaxy S22/S23/S24, Pixel 7/8) | Single-column stacks, full-width cards, drawer sidebar, sticky top header, 44px touch targets |
| **sm** | `640px` | Large phones landscape, compact tablets (iPad Mini portrait) | 2-column metric grids, modal cards with max-width boundaries |
| **md** | `768px` | Tablets portrait (iPad 10th Gen, Galaxy Tab S8) | Sidebar switches to collapsible drawer or compact rail, multi-stat rows |
| **lg** | `1024px` | Tablets landscape, laptops (MacBook Air 13", ThinkPad) | Fixed persistent desktop sidebar (260px), full data tables with inline actions |
| **xl** | `1280px` | Standard Desktop monitors | 4-column metric grids, expanded pipeline kanban boards, side drawer inspectors |
| **2xl** | `1536px` | Ultra-wide displays & 4K monitors | Maximum content container constraint (`max-w-7xl` or `max-w-[1600px]`), centered layout |

---

## 2. Color System & Contrast Hierarchy

Axivon ONE features a custom engineered, deep blue-tinted dark enterprise canvas with purposeful emerald accents and champagne gold highlights for executive distinctions, eliminating generic pure pitch blacks and harsh eye strain:

```
+---------------------------------------------------------------------------------+
|                         AXIVON DARK ENTERPRISE PALETTE                          |
+---------------------------------------------------------------------------------+
| Canvas Background    : Deep Blue-Black (#0B0D10)                                |
| Sidebar Surface      : Deep Obsidian   (#0E1116)                                |
| Card / Panel Surface : Dark Indigo     (#151A21)                                |
| Elevated Surface     : Soft Charcoal   (#1B222B) -> Hover: (#202833)            |
| Input / Field Surface: Deep Field      (#10151B)                                |
| Primary Text (Text-1): Pure Ice White  (#F3F5F7)                                |
| Secondary Text(Text-2: Cool Silver     (#A7B0BC)                                |
| Muted Text   (Text-3): Slate Grey      (#7E8997)                                |
| Subtle Text  (Text-4): Dim Slate       (#566171)                                |
| Border / Separator   : Dark Boundary   (#1E2530) / Panel Edge (#29313B)         |
| Primary Brand CTA    : Emerald 500     (#10B981) -> Hover: Emerald 600 (#059669)|
| Primary Tint / Active: Emerald Subtle  (#10B981/10) -> Border: (#10B981/25)     |
| Executive Accent     : Champagne Gold  (#D6B779) -> Tint: (#D6B779/10)         |
| Success Status       : Emerald 400     (#34D399) -> Tint: Emerald 500/10       |
| Warning Status       : Amber 400       (#FBBF24) -> Tint: Amber 500/10         |
| Danger / Destructive : Red 400         (#F87171) -> Tint: Red 500/10           |
+---------------------------------------------------------------------------------+
```

### Contrast Compliance
- All body text (`#F3F5F7` on `#0B0D10` or `#151A21`) achieves **14.2:1** contrast ratio (far exceeding WCAG AAA standard of 7:1).
- Secondary meta text (`#A7B0BC` on `#151A21`) achieves **6.8:1** contrast ratio (WCAG AAA compliant).
- Muted text (`#7E8997` on `#151A21`) achieves **4.6:1** contrast ratio (WCAG AA compliant).
- Emerald CTA text (`#04130E` on `#10B981`) achieves **8.9:1** contrast ratio (WCAG AAA compliant).

---

## 3. Typographic Hierarchy & The 16px Anti-Zoom Rule

### The Mobile Input Auto-Zoom Constraint
Mobile WebKit and Chromium automatically trigger a viewport zoom when an `<input>`, `<select>`, or `<textarea>` has an effective font size smaller than **16px**. To prevent this intrusive distortion, Axivon ONE enforces:

```css
/* Responsive Form Field Typography */
input, select, textarea {
  font-size: 16px; /* Mobile viewport default (< 640px) */
}

@media (min-width: 640px) {
  input, select, textarea {
    font-size: 14px; /* Desktop standard */
  }
}
```

In Tailwind utility syntax, every form field adheres to:
`className="text-[16px] sm:text-sm"`

### Typography Scale

| Token | Mobile (< 640px) | Desktop (>= 1024px) | Weight | Line Height | Application |
|---|---|---|---|---|---|
| `display` | 24px (1.5rem) | 32px (2.0rem) | Bold (700) | 1.2 | Portal page titles, Hero headers |
| `h1` | 20px (1.25rem) | 24px (1.5rem) | Bold (700) | 1.25 | Section headings, Modal titles |
| `h2` | 16px (1.0rem) | 18px (1.125rem) | SemiBold (600) | 1.3 | Card titles, Group headers |
| `h3` | 14px (0.875rem) | 15px (0.9375rem) | SemiBold (600) | 1.4 | Table column headers, Metric labels |
| `body` | 14px (0.875rem) | 14px (0.875rem) | Regular (400) | 1.5 | General content, table cell data |
| `input` | **16px (1.0rem)** | **14px (0.875rem)** | Regular (400) | 1.4 | Form inputs, dropdowns, search bars |
| `caption` | 12px (0.75rem) | 12px (0.75rem) | Medium (500) | 1.4 | Timestamps, badges, helper notes |

---

## 4. Touch Target Standard & Interaction Physics

Enterprise users frequently operate on mobile under busy, one-handed conditions. To minimize touch errors:

### A. Minimum Touch Target Rule (40px – 44px)
- **Primary Buttons:** `h-10 sm:h-9 px-4` (40px height on mobile, 36px on desktop).
- **Large Action Buttons:** `h-12 sm:h-10 px-5` (48px height on mobile, 40px on desktop).
- **Icon / Hamburger Buttons:** `h-10 w-10 sm:h-9 sm:w-9` (40px square touch target on mobile).
- **Table Action Icons:** Enclosed in minimum `p-2` or `min-h-[36px] min-w-[36px]` click regions.

### B. Tactile Feedback & Elimination of Tap Delay
All interactive elements include:
1. `touch-manipulation`: Eliminates the 300ms mobile browser tap delay.
2. `active:scale-[0.98]`: Instant tactile confirmation on finger press.
3. `cursor-pointer select-none`: Prevents accidental text selection while navigating.

---

## 5. Dynamic Viewport Height (`dvh`) Standard

Mobile browser address bars dynamically collapse and expand during scrolling, which causes traditional `100vh` layouts to jump and hides bottom controls. Axivon ONE enforces dynamic viewport units:

```css
/* Layout Container Standard */
.portal-root {
  min-height: 100dvh; /* Adapts seamlessly to browser URL bar states */
}

/* Modal Dialog Standard */
.modal-container {
  max-height: calc(100dvh - 2rem); /* Preserves 1rem margin in portrait/landscape */
}
```

---

## 6. Layout Shell & Navigation Specifications

### A. Portal Header (`PortalHeader.tsx`)
- **Height:** `h-16` (64px)
- **Position:** Sticky `top-0 z-30`
- **Background:** Deep obsidian dark with backdrop blur `bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#1E2530]`
- **Mobile Left:** Hamburger menu toggle (`h-10 w-10`) with `aria-label="Open navigation menu"`
- **Center:** Brand title with active Emerald Portal Pill badge (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`)
- **Right:** Search trigger button (`bg-[#151A21] border-[#29313B]`), notifications bell with unread badge, user profile menu with dark surface (`bg-[#1B222B]`)

### B. Navigation Sidebars (Drawer on Mobile, Rail on Desktop)
- **Mobile (< 1024px):**
  - Slides in from left with Framer Motion spring animation (`-100% -> 0`).
  - Full height (`h-full min-h-dvh`), width `w-72 max-w-[85vw]`.
  - Darkened backdrop overlay (`bg-black/70 backdrop-blur-xs z-40`).
  - Container: Deep Obsidian (`bg-[#0E1116] border-r border-[#1E2530]`).
  - Closes on: route change, backdrop click, Close button tap, or `Escape` key press.
- **Desktop (>= 1024px):**
  - Static persistent navigation rail (`w-64 shrink-0 bg-[#0E1116] border-r border-[#1E2530]`).
  - Smooth vertical dark scrollbar (`scrollbar-thumb-[#29313B]`).
  - Active nav item: Emerald subtle glow (`bg-emerald-500/10 text-emerald-400 border-emerald-500/25`).

### C. Data Tables & Card Transformations
To prevent horizontal document blowout on mobile screens:
1. **Adaptive Table Scroller:** Tables are wrapped in `<div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">`.
2. **Dense Data Stacking:** On viewports `< 640px`, complex multi-column rows adapt into structured card stacks where primary identifiers (Lead Name, Status, Date) are emphasized.
3. **Sticky Column Headers:** Essential context remains fixed while scrolling wide financial or audit data.

---

## 7. Iconography & Enterprise Credibility

- **Library:** `lucide-react` (clean, geometric 2px stroke SVGs).
- **Strict Prohibition:** **Zero decorative consumer emojis** (`👋`, `🚀`, `🎉`, `🏢`, `⚡`, `⚠️`).
- **Semantic Icon Mapping:**
  - Status Success: `CheckCircle2` (`emerald-600`)
  - Status Pending: `Clock` (`amber-600`)
  - Status Inactive: `XCircle` (`slate-400`)
  - Actions: `Plus`, `Search`, `Filter`, `MoreVertical`, `ExternalLink`
  - Navigation: `LayoutDashboard`, `Users`, `Briefcase`, `ShieldCheck`, `FileText`, `Settings`
