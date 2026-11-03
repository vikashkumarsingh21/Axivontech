# Axivon Mobile Design System (App Mode)

> **Status:** ACTIVE  
> **Applies to:** Android App & Web App Mode (`data-app="true"`)  
> **Accent Palette:** Option A (Muted Emerald-Sage)

---

## 1. Principles
1. **Mobile-First & Purpose-Built:** Every screen is designed for one-handed thumb interaction with a 56px bottom tab bar and card lists instead of truncated desktop tables.
2. **Layered Warm-Graphite Surfaces:** High visual comfort for extended shifts with dark surfaces, eliminating harsh contrast and pure black (#000000) or pure white (#FFFFFF) glare.
3. **Calm Single Accent:** Accent color (`#4F9D83`) is used with restraint on active indicators, primary CTAs, and status pills.
4. **WCAG 2.1 AA+ Compliance:** All text combinations exceed 4.5:1 contrast ratios (primary text `#EDEBE6` achieves 13.8:1 on `#1A1A1B`).
5. **Pixel Discipline:** No horizontal scrolling, minimum 44px touch targets, tabular numerals for time/metrics, and native safe area insets.

---

## 2. Design Tokens

### Color Palette
| Token | Value | Role / Usage |
| :--- | :--- | :--- |
| `--app-bg-page` | `#121212` | Root page background |
| `--app-bg-card` | `#1A1A1B` | Primary cards, list items, sheets |
| `--app-bg-raised` | `#232324` | Secondary buttons, input backgrounds, active states |
| `--app-border` | `#2E2E30` | Standard card and separator borders (1px) |
| `--app-border-subtle` | `#242426` | Inner dividers, secondary boundaries |
| `--app-text-primary` | `#EDEBE6` | Headings, card titles, key values (13.8:1 contrast) |
| `--app-text-secondary` | `#B3AFA6` | Subtitles, labels, descriptions (7.6:1 contrast) |
| `--app-text-muted` | `#827E76` | Timestamps, inactive states, hints |
| `--app-accent` | `#4F9D83` | Primary action button, active tab indicator, key accent |
| `--app-accent-hover` | `#438770` | Pressed/active state on buttons |
| `--app-accent-bg` | `#162721` | Tinted background for accent chips and active items |
| `--app-accent-border` | `#27483C` | Border for accent chips and focused inputs |
| `--app-accent-text` | `#A2D9C7` | Text on tinted accent chips |
| `--app-status-error` | `#C85555` | Missed check-ins, validation errors, reject actions |
| `--app-status-warning` | `#D4A359` | Pending reviews, regularization requests |
| `--app-status-info` | `#5B9BB8` | Announcements, notifications |

### Typography Scale
- **App Title / Page Heading:** `22px` / Font-weight: `600` / Line-height: `1.25`
- **Section Heading:** `17px` / Font-weight: `600` / Line-height: `1.3`
- **Body Regular:** `15px` / Font-weight: `400` / Line-height: `1.45`
- **Input Text:** `16px` / Font-weight: `400` *(Enforces 16px min to prevent iOS/Android viewport zoom)*
- **Caption / Meta:** `12px` / Font-weight: `500` / Line-height: `1.4`
- **Micro Badge:** `11px` / Font-weight: `600` / Tracking: `0.02em`
- **Tabular Figures:** `font-variant-numeric: tabular-nums` on all timers, stats, and monetary values.

### Geometry & Sizing
- **Card Border Radius:** `14px`
- **Button Border Radius:** `10px`
- **Input Border Radius:** `10px`
- **Chip / Pill Radius:** `9999px`
- **Page Horizontal Gutter:** `16px`
- **Top App Bar Height:** `56px` + `env(safe-area-inset-top)`
- **Bottom Tab Bar Height:** `56px` + `env(safe-area-inset-bottom)`
- **Minimum Touch Target:** `44px` height and width

---

## 3. Motion & Transitions
- **Standard Transition:** `150ms – 200ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Tap Feedback:** `:active { transform: scale(0.98); }`
- **Bottom Sheet Entry:** Slide up from `translateY(100%)` to `translateY(0)` over `200ms`
- **Pull to Refresh:** Smooth spring physics with rotation spinner
- **Reduced Motion Support:** `@media (prefers-reduced-motion: reduce)` zeroes transitions and disables transforms.

---

## 4. Component Patterns
1. **`MobileTopBar`:** Compact 56px header displaying the current role/page, back navigation on sub-screens, unread notification indicator, and user profile avatar.
2. **`MobileTabBar`:** 56px bottom navigation with 5 fixed tabs (4 role-specific + 1 "More" tab), unread dot indicators, and automatic hiding when mobile virtual keyboard is displayed.
3. **`MobileMoreSheet`:** Accessible bottom sheet containing secondary navigation links, support shortcuts, and logout.
4. **`CardList` & `ResponsiveTable`:** Converts wide multi-column desktop tables into compact mobile cards with primary title, 2–3 key data points, and status chip.
5. **`StickyActionFooter`:** Fixed bottom container ensuring form submit buttons remain easily reachable above the bottom tab bar.
6. **`BottomSheet`:** Slide-up container for filters, forms, and item detail views with touch drag handle.
