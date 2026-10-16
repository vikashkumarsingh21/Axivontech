# Axivon ONE — Enterprise Design System Specification

**Version:** 2.0  
**Status:** Adopted & Implemented  
**Author:** Design Systems Architecture Team  

---

## 1. Design Principles

1. **Enterprise Clarity First:** High data density without visual clutter. Generous whitespace, precise typography, and subtle borders over heavy drop shadows.
2. **Neutral Foundation, Brand Accent:** The interface is built on calm, neutral slates (`slate-50` to `slate-900`). Color is applied intentionally for semantics and brand accent (Axivon Crimson `#DC2626`).
3. **No Blue Dominance:** Blue is reserved strictly for informational metadata tags where necessary; it never serves as the primary visual accent or active indicator.
4. **Zero Consumer Emojis:** Product UI uses Lucide SVG icons with consistent stroke weights ($1.75\text{px} - 2.2\text{px}$). Emojis are strictly banned from navigational elements, status indicators, and modal headers.
5. **Universal Responsiveness:** Every layout must function fluidly from $360\text{px}$ mobile screens to $2560\text{px}$ ultrawide displays.

---

## 2. Color Palette & Design Tokens

```
Foundation Canvas:      #0B0D10 (Tailwind bg-[#0B0D10] / var(--bg-base))
Sidebar Surface:        #0E1116 (Tailwind bg-[#0E1116] / var(--bg-sidebar))
Surface / Cards:        #151A21 (Tailwind bg-[#151A21] / var(--bg-panel))
Surface Subdued:        #101318 (Tailwind bg-[#101318] / var(--bg-surface))
Elevated Surface:       #1B222B (Tailwind bg-[#1B222B] / var(--bg-panel-2))
Elevated Hover:         #202833 (Tailwind bg-[#202833] / var(--bg-panel-hover))
Input / Field Surface:  #10151B (Tailwind bg-[#10151B] / var(--bg-input))
Dividers & Borders:     #1E2530 (Tailwind border-[#1E2530] / var(--border-1))
Borders Interactive:    #29313B (Tailwind border-[#29313B] / var(--border-2))

Text Primary:           #F3F5F7 (Tailwind text-[#F3F5F7] / var(--text-1))
Text Secondary:         #A7B0BC (Tailwind text-[#A7B0BC] / var(--text-2))
Text Subtle / Muted:    #7E8997 (Tailwind text-[#7E8997] / var(--text-3))
Text Dim:               #566171 (Tailwind text-[#566171] / var(--text-4))

Brand Accent Primary:   #10B981 (Tailwind bg-emerald-500 / text-emerald-400 / var(--portal-accent))
Brand Accent Hover:     #059669 (Tailwind bg-emerald-600 / var(--portal-accent-hover))
Brand Accent Subtle:    rgba(16, 185, 129, 0.1) (Tailwind bg-emerald-500/10 border-emerald-500/25)
Brand Focus Ring:       rgba(16, 185, 129, 0.2)
Executive Accent:       #D6B779 (Champagne Gold for Executive / Founder badges)

Semantic Success:       #34D399 (bg-emerald-500/10 / text-emerald-400 / border-emerald-500/20)
Semantic Warning:       #FBBF24 (bg-amber-500/10 / text-amber-400 / border-amber-500/20)
Semantic Danger:        #F87171 (bg-red-500/10 / text-red-400 / border-red-500/20)
Semantic Neutral:       #A7B0BC (bg-[#1B222B] / text-[#A7B0BC] / border-[#29313B])
```

---

## 3. Typography Hierarchy

- **Font Family:** `Inter`, `Geist Sans`, system-ui, `-apple-system`, `sans-serif`
- **Monospace Family (Data/Codes):** `JetBrains Mono`, `Fira Code`, `monospace`

| Level | Size | Weight | Tracking | Class | Usage |
|---|---|---|---|---|---|
| **Display / H1** | $24\text{px} / 1.5\text{rem}$ | Bold (700) | `-0.025em` | `text-2xl font-bold tracking-tight` | Page titles |
| **Section / H2** | $18\text{px} / 1.125\text{rem}$ | Semibold (600) | `-0.015em` | `text-lg font-semibold tracking-tight` | Card & section headings |
| **Subsection / H3**| $14\text{px} / 0.875\text{rem}$ | Semibold (600) | `normal` | `text-sm font-semibold` | Table headers & group titles |
| **Body Default** | $14\text{px} / 0.875\text{rem}$ | Regular (400) | `normal` | `text-sm text-slate-600` | Paragraphs & content text |
| **Caption / Meta** | $12\text{px} / 0.75\text{rem}$ | Medium (500) | `0.01em` | `text-xs text-slate-500` | Timestamps & hints |
| **Micro / Tag** | $10\text{px} / 0.625\text{rem}$| Bold (700) | `0.05em` | `text-[10px] font-bold uppercase tracking-wider` | Role & status pills |

---

## 4. Core Component Specifications

### 4.1. Button (`src/components/ui/Button.tsx`)
- **Variants:**
  - `primary` / `default`: Emerald `#10B981`, hover `#059669`, dark foreground `#04130E`, subtle shadow.
  - `secondary`: Dark surface `#1B222B`, `border-[#29313B]`, `text-[#A7B0BC]`, hover `bg-[#202833] text-[#F3F5F7]`.
  - `outline`: Transparent background, `border-[#29313B]`, `text-[#A7B0BC]`, hover `bg-[#202833] text-[#F3F5F7]`.
  - `ghost`: Transparent background, hover `bg-[#202833]`, `text-[#7E8997] hover:text-[#F3F5F7]`.
  - `danger`: Red subtle background `bg-red-500/10 text-red-400 border border-red-500/20`.
- **Sizes:** `sm` ($32\text{px}$), `default` / `md` ($36\text{px}$), `lg` ($40\text{px}$), `icon` ($36\times36\text{px}$).
- **States:** Built-in SVG `Loader2` for `isLoading`, keyboard focus outline, disabled states.

### 4.2. Card (`src/components/ui/Card.tsx`)
- Deep indigo dark surface (`bg-[#151A21] border border-[#29313B] rounded-xl shadow-xs text-[#F3F5F7]`).
- Supports both props-based configuration (`title`, `description`, `action`, `footer`) and compound subcomponents:
  - `<CardHeader>`
  - `<CardTitle>`
  - `<CardDescription>`
  - `<CardContent>`
  - `<CardFooter>`

### 4.3. Badge (`src/components/ui/Badge.tsx`)
- Non-blue semantic variants: `success`, `warning`, `danger`, `neutral`, `brand`, `info`.
- Built-in slot for Lucide SVG icons.
- Micro and default sizing with rounded pill borders.

### 4.4. Input (`src/components/ui/Input.tsx`)
- Deep field background (`bg-[#10151B]`) with `border-[#29313B] text-[#F3F5F7]`.
- Integrated slots for `leftIcon` and `rightIcon`.
- Emerald focus ring (`focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20`) and label validation messages.

### 4.5. Modal (`src/components/ui/Modal.tsx`)
- Accessible dialog (`role="dialog" aria-modal="true"`).
- Smooth Framer Motion backdrop fade and modal scale animation.
- Escape key listener, click-outside dismissal, and background scroll locking.

### 4.6. EmptyState (`src/components/ui/EmptyState.tsx`)
- Standardized placeholder for zero-data views.
- Center-aligned Lucide icon in subtle container, title, description, and primary/secondary action buttons.
- 100% emoji-free.

### 4.7. PortalHeader (`src/components/portal/PortalHeader.tsx`)
- Sticky top navigation bar ($64\text{px}$ height) with `backdrop-blur-md`.
- Mobile hamburger drawer toggle.
- Breadcrumb navigation and role badge pill.
- Global search shortcut (`Ctrl+K`) triggering search modal.
- Notification bell with real-time ping indicator.
- User profile avatar dropdown with account details and sign-out form.

---

## 5. Iconography Standard

- **Library:** `lucide-react`
- **Stroke Width:** `1.75` for default states, `2.2` for active navigation items.
- **Icon Sizing:**
  - Micro / Inline: $12\times12\text{px}$ (`w-3 h-3`)
  - Navigation: $16\times16\text{px}$ (`w-4 h-4`)
  - Standard Action: $18\times18\text{px}$ (`w-4.5 h-4.5` or `w-5 h-5`)
  - Feature / Hero Containers: $24\times24\text{px}$ (`w-6 h-6`)
