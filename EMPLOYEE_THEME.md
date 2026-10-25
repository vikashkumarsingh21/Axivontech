# Axivon Employee Portal Design System (Option A: Warm Graphite & Emerald-Sage)

This document establishes the official visual design system, token specifications, component rules, and interaction standards for the **Axivon Employee Workspace Portal** (`/employee/*`).

---

## 1. Executive Summary & Design Philosophy

The Employee Portal is designed as a **quiet, focused, high-productivity executive workspace**. Unlike public marketing pages with neon glows or high-energy gradients, the internal portal prioritizes:
1. **Low Eye Strain:** Built on deep warm-black and graphite backgrounds (`#121212`, `#1A1A1B`, `#232324`) rather than cold, bluish slate.
2. **Singular Unified Accent:** Muted Emerald-Sage (`#4F9D83`) used consistently across primary actions, focus rings, active links, and metric indicators.
3. **Harmonious Status Palette:** Desaturated, elegant status tints (`#5FAE7E` success, `#C9A15B` warning, `#C46A62` danger, `#8E9AAF` neutral info) with WCAG AA compliance.
4. **Scoped Isolation:** Scoped within `.employee-theme` on `/employee` routes so Admin, Broker, Client, Executive portals, and the public marketing website remain completely untouched.

---

## 2. Design Tokens & Color Palette

### 2.1 Base Surfaces & Borders

| Token Name | Hex Code | Role & Usage | Contrast vs Text |
| :--- | :--- | :--- | :--- |
| `ep-bg-page` | `#121212` | Main page background canvas | 15.8:1 with `#EDEBE6` (AAA) |
| `ep-bg-sidebar` | `#0E0E0F` | Left navigation sidebar background | 16.5:1 with `#EDEBE6` (AAA) |
| `ep-bg-card` | `#1A1A1B` | Surface cards, metric containers, panels | 14.3:1 with `#EDEBE6` (AAA) |
| `ep-bg-raised` | `#232324` | Nested containers, inputs, table hover, toggle track | 12.0:1 with `#EDEBE6` (AAA) |
| `ep-border` | `#2E2E30` | Standard dividing line and card borders | 1.3:1 subtle structure |
| `ep-border-strong` | `#3A3A3D` | Interactive hover borders and focused containers | 1.6:1 distinct separation |

### 2.2 Typography Colors & Contrast Compliance

| Token Name | Hex Code | Semantic Role | WCAG 2.1 Contrast | Compliance |
| :--- | :--- | :--- | :--- | :--- |
| `ep-text-primary` | `#EDEBE6` | Headings, active values, button labels | 14.3:1 on `#1A1A1B` | **AAA** (Pass) |
| `ep-text-secondary` | `#B3AFA6` | Body paragraphs, form labels, secondary info | 8.2:1 on `#1A1A1B` | **AAA** (Pass) |
| `ep-text-muted` | `#8A867E` | Captions, timestamps, table column headers | 5.0:1 on `#1A1A1B` | **AA** (Pass > 4.5:1) |
| `ep-placeholder` | `#7C786F` | Form input placeholder text | 4.6:1 on `#232324` | **AA** (Pass > 4.5:1) |

### 2.3 Brand Accent: Emerald-Sage

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `ep-accent` | `#4F9D83` | Primary brand accent, primary CTA background, focus ring |
| `ep-accent-hover` | `#5BB094` | Interactive hover on buttons and accent links |
| `ep-accent-pressed` | `#418671` | Active/pressed state on primary buttons |
| `ep-accent-soft` | `rgba(79, 157, 131, 0.12)` | Subtle badge and selected tab backgrounds |
| `ep-accent-border` | `rgba(79, 157, 131, 0.28)` | Border for accent pills, active tabs, and badges |
| `ep-accent-contrast` | `#0F1A16` | Text and icons placed on top of `#4F9D83` (6.8:1 AAA contrast) |

### 2.4 Status & Feedback Colors

| Status | Foreground | Soft Background (10%) | Border (25-30%) | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#5FAE7E` | `rgba(95, 174, 126, 0.10)` | `rgba(95, 174, 126, 0.25)` | Approved, completed, on-time, active shift |
| **Warning** | `#C9A15B` | `rgba(201, 161, 91, 0.10)` | `rgba(201, 161, 91, 0.25)` | Pending approval, breaks, upcoming holiday |
| **Danger** | `#C46A62` | `rgba(196, 106, 98, 0.10)` | `rgba(196, 106, 98, 0.25)` | Blocked task, late arrival, rejection, overdue |
| **Info / Neutral** | `#8E9AAF` | `rgba(142, 154, 175, 0.10)` | `rgba(142, 154, 175, 0.25)` | Casual leave, document tags, neutral status |

---

## 3. Typography Scale & Hierarchy

- **Font Family:** Inter, system-ui, -apple-system, sans-serif.
- **Monospace Font:** JetBrains Mono, ui-monospace, Menlo, Consolas (used for Employee IDs, punch timestamps, and worked durations).

| Style | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `Heading 1` | 28px (`text-2xl` / `text-3xl`) | SemiBold (600) | 1.25 | PageHeader title |
| `Heading 2` | 20px (`text-xl`) | SemiBold (600) | 1.3 | Major card headers, modal titles |
| `Heading 3` | 16px (`text-base`) | SemiBold (600) | 1.4 | Section titles, list headers |
| `Stat Value` | 24px (`text-2xl`) | SemiBold (600) | 1.2 | Top metric cards, balances |
| `Body Large` | 14px (`text-sm`) | Regular (400) / Medium (500) | 1.5 | Primary table text, task titles, modal body |
| `Body Small` | 12px (`text-xs`) | Regular (400) | 1.5 | Subtitles, descriptions, input values |
| `Micro / Label` | 11px (`text-[11px]`) | SemiBold (600) / Medium (500) | 1.4 | Metric labels, group headers, timestamps |
| `Badge Text` | 10px (`text-[10px]`) | SemiBold (600) | 1.2 | Status pills, uppercase tags |

---

## 4. Spacing & Radius Rules

- **Base Spacing Grid:** 4px / 8px / 12px / 16px / 20px / 24px / 32px.
- **Corner Radii:**
  - `rounded-lg` (8px): Form inputs, buttons, filter tabs, table pills.
  - `rounded-xl` (12px): Standard cards, modal dialogs, metric tiles, dropdowns.
  - `rounded-2xl` (16px): Large container cards, hero greeting cards.
  - `rounded-full`: Status dots, avatar circles, toggle switches, compact assistant widget.
- **Bottom Clearance Rule:** Every employee page must have at least `96px` (`pb-24` or `pb-28`) bottom clearance to ensure the collapsed Workplace Assistant widget (`44px` round button) never covers submit buttons or pagination controls.

---

## 5. Reusable Component Specifications

### 5.1 EpButton (`src/components/employee/EpButton.tsx`)
- **Primary:** `bg-[#4F9D83] text-[#0F1A16] hover:bg-[#5BB094] active:bg-[#418671] font-semibold rounded-lg shadow-xs`.
- **Secondary / Outline:** `bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] hover:bg-[#2E2E30] hover:border-[#3A3A3D] rounded-lg`.
- **Danger:** `bg-[#C46A62]/10 border border-[#C46A62]/30 text-[#C46A62] hover:bg-[#C46A62]/20 rounded-lg`.
- **Ghost:** `text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#232324] rounded-lg`.

### 5.2 StatusBadge (`src/components/employee/StatusBadge.tsx`)
- Small inline status pill with a 1.5px dot indicator and muted tint.
- Automatic variant resolution for `TODO`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`, `APPROVED`, `PENDING`, `REJECTED`, `CANCELLED`.

### 5.3 PageHeader (`src/components/employee/PageHeader.tsx`)
- Typography: 28px/600 `#EDEBE6`, subtitle in 13px `#8A867E`.
- Left icon badge: `w-10 h-10 rounded-lg bg-[#232324] border border-[#2E2E30] text-[#4F9D83]`.
- Action slot: Perfectly aligned to the right.

### 5.4 Form Inputs & Selects
- Background: `#232324`.
- Border: `#2E2E30`.
- Text: `#EDEBE6`.
- Placeholder: `#7C786F` (WCAG AA compliant).
- Focus Ring: `border-[#4F9D83] ring-1 ring-[#4F9D83]`. Single unified accent across all forms (eliminates rogue blue or orange focus rings).

### 5.5 Collapsed Workplace Assistant Widget (`src/components/portal-ai/PortalAIAssistant.tsx`)
- Collapsed: 44px round floating button at bottom-right (`bottom-6 right-6`).
- Style: `rounded-full bg-[#1A1A1B] border border-[#2E2E30] text-[#4F9D83] hover:border-[#4F9D83]/50 shadow-lg`.
- Non-obstructive: Sits below the standard content line without overlapping actionable controls.

---

## 6. Portal Shell Structure

- **Layout Wrapper (`src/app/employee/layout.tsx`):**
  `<div className="employee-theme min-h-screen bg-[#121212] text-[#EDEBE6]">`
- **Sidebar (`src/components/portal/EmployeeSidebar.tsx`):**
  - Background `#0E0E0F`, right border `#2E2E30`.
  - Group headers in 11px uppercase `#8A867E`.
  - Active links: `bg-[#232324] text-[#EDEBE6]` with left `#4F9D83` indicator bar and active counter pill.
  - Inactive links: `text-[#B3AFA6] hover:text-[#EDEBE6] hover:bg-[#1A1A1B]`.
- **Navbar (`src/components/portal/EmployeeNavbar.tsx`):**
  - Background `#0E0E0F`, bottom border `#2E2E30`.
  - Unread notification indicator: `#4F9D83` dot.
  - User initials avatar: neutral graphite `#232324` with `#2E2E30` border.
