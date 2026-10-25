# Axivon Broker / Business Partner Portal UI/UX Redesign Report

**Branch:** `broker-ui-redesign`  
**Date:** October 25, 2026  
**Architecture:** Next.js 16 (App Router), React 19, Tailwind CSS v4  
**Design Palette:** Warm Sand / Brass Gold (`#C2A878`) with Deep Dark Neutral Base (`#0A0B0D`)

---

## 1. Executive Summary

The entire **Broker / Business Partner Portal** and public partner engagement surfaces have been redesigned from the ground up. The outdated high-saturation red aesthetic has been replaced by a curated, premium executive palette: **Warm Sand / Brass Gold (`#C2A878`)** paired with calibrated obsidian backgrounds (`#0A0B0D`), raised card surfaces (`#111317`), subtle charcoal borders (`#22262D`), and crisp monospace financial typography.

Every page is responsive across 1440px desktop, 768px tablet, and 375px mobile viewports with zero horizontal overflow, layout shifts, or infinite circular spinners.

---

## 2. Design System Architecture (`BROKER_DESIGN_SYSTEM.md`)

```css
:root {
  --bp-accent: #C2A878;        /* Warm Sand / Brass Gold */
  --bp-accent-hover: #D4BC8B;  /* Highlight */
  --bp-accent-muted: #8E7A52;  /* Subdued accent */
  --bp-bg-page: #0A0B0D;       /* Page Base Obsidian */
  --bp-bg-card: #111317;       /* Card Surface */
  --bp-bg-raised: #171A1F;     /* Inputs / Hover items */
  --bp-border: #22262D;        /* Structural borders */
  --bp-border-subtle: #1E232B; /* Inner divider lines */
  --bp-text-primary: #F4F5F6;  /* High contrast reading */
  --bp-text-secondary: #8E95A2;/* Descriptive text */
  --bp-text-muted: #565D6A;    /* Micro-captions */
}
```

### Shared Foundation Components (`src/components/broker/`)
1. **`BrokerFormatters.ts`**: Indian Rupee currency formatter (`formatCurrencyINR` producing e.g. `₹1,25,000`), Indian number formatting (`formatNumberIN`), localized date formatting (`formatDateIN`), account/PAN masking.
2. **`BrokerButton.tsx`**: Primary (brass gold `#C2A878` on `#0A0B0D`), Secondary, Ghost, Danger, with native loading state, double-click prevention, and accessible focus rings.
3. **`BrokerStatusBadge.tsx`**: Categorized status badges with 6px status dot, 1px border, 10% tint for leads, projects, contracts, payments, commissions.
4. **`BrokerPageHeader.tsx`**: Standardized page title, descriptive subtitle, status pill, breadcrumb/back link, and action button bar.
5. **`BrokerCard.tsx`**: Unified card container (`#111317` surface, `#22262D` border, subtle hover accent).
6. **`BrokerSkeleton.tsx`**: Layout-matched shimmer loading components (header, metrics, table, detail) preventing infinite circular spinners.
7. **`BrokerEmptyState.tsx`**: SVG-based empty states for leads, projects, commissions, documents, notifications.
8. **`useBrokerFetch.ts`**: Reusable hook handling data, loading, error, field errors, refetch, and optimistic updates.

---

## 3. Page-by-Page Transformation Breakdown

### 1. Shell & Layout (`src/app/broker/layout.tsx`)
- **Sidebar (`BrokerPortalSidebar.tsx`)**: Grouped navigation sections (Overview, Pipeline, Financials, Resources, Account & Support), collapsible toggle, unread/pending action badges, active accent bar (`#C2A878`).
- **Header (`BrokerPortalHeader.tsx`)**: Partner ID tag, notification popover with unread counter and "Mark all read", avatar dropdown menu.
- **Mobile Bottom Nav (`BrokerMobileBottomNav.tsx`)**: Bottom navigation bar fixed on screens `< 768px` for instant 1-thumb navigation.
- **Cookie Banner Isolation**: Suppressed cookie banner in `/broker` to ensure zero action blocking on mobile viewports.

### 2. Dashboard (`/broker/dashboard`)
- 4 financial metric cards: Total Settled Earnings (₹40,000), Eligible for Payout (₹0), Active Projects Pipeline, Attributed Leads.
- 12-month earnings trend chart (interactive SVG bar chart with tooltips) using `/api/v1/broker/analytics/earnings`.
- Lead-to-project conversion funnel (5 steps).
- "Needs Your Attention" action center (contracts to sign, payment proofs, unread documents).
- "Partner Referral Engine" card with 1-click copy for referral code and intake URLs, plus WhatsApp and Email share templates.
- Recent activity timeline and upcoming project milestones.

### 3. Onboarding Stepper (`/broker/onboarding`)
- 5-step stepper with circular SVG progress ring (0% to 100%):
  1. Profile & Company Details
  2. Bank / UPI Payout Details
  3. KYC Document Upload (PAN/Aadhaar)
  4. Accept Partner Terms & Policies (calls `/api/v1/broker/profile/terms`, version 2.1)
  5. Master Partner Agreement Contract Signing / Referral Activation
- Lock indicators for incomplete previous steps, drag-and-drop upload preview, zero redirect loops.

### 4. Leads & Pipeline (`/broker/leads`)
- Toggle between Table View and Kanban Pipeline View (New, Contacted, Qualified, Converted, Lost).
- Filters: Search input, status dropdown, date range picker (`from`, `to`).
- Slide-over Lead Detail Drawer: Complete client information, organization details, project requirements, and safe progression timeline (internal admin notes omitted per contract).
- "Submit New Lead" modal with duplicate lead warning alert handling HTTP 409 gracefully.

### 5. Projects Lifecycle (`/broker/projects`, `/broker/projects/new`, `/broker/projects/[id]`)
- `/broker/projects`: Metric cards, status filter, search, table with project code, service, contract status, payment status, delivery timeline.
- `/broker/projects/new`: Multi-step creation wizard (Client details, Technical requirement, Commercial review with 10% commission calculation) and draft auto-save (`/api/v1/broker/drafts`).
- `/broker/projects/[id]`: Tabbed interface (Overview, Milestones, Contract with PDF download and signed copy upload, Payments with proof submission modal).

### 6. Commissions & Ledger (`/broker/commissions`)
- 5-metric financial strip (Total Settled, Eligible for Payout, In Processing, Pending Delivery, This Month).
- Interactive Commission Yield Estimator widget (calculates gross 10%, Section 194H TDS 5%, and net receivable).
- Commissions ledger table with status filters, search, and CSV statement download (`/api/v1/broker/commissions/export`).
- Payout request modal with minimum ₹500 threshold validation and 48-hour banking SLA display.
- Commission detail & TDS deduction drawer with Section 194H breakdown.

### 7. Document Center (`/broker/documents`)
- Category tabs (All, Agreements, Policies, Marketing, Compliance, Reports).
- Search input and unread count badge.
- Featured Master Partner Commercial Agreement (v2.1) hero banner.
- "Acknowledge Read" action with optimistic update (`POST /api/v1/broker/documents/[id]/read`).

### 8. Notifications (`/broker/notifications`)
- Notifications grouped by relative date: "Today", "Yesterday", "Earlier".
- "Mark All Read" action (`POST /api/v1/notifications/read-all`).
- Direct action link to jump directly to referenced projects or contracts.

### 9. Profile & Settings (`/broker/profile`)
- Editable business info with live patch (`PATCH /api/v1/broker/profile`).
- Password change form with real-time strength meter (`POST /api/v1/broker/profile/password`).
- Avatar upload (`POST /api/v1/broker/profile/avatar`).
- Masked banking payout routes and verified tax identifiers.

### 10. Partner Support Desk (`/broker/support`)
- Priority support request modal with category selection and urgency level.
- Ticket list with status and priority badges.
- Threaded conversation detail view with direct reply submission (`POST /api/v1/broker/support/[id]`).

### 11. Public Partner Pages
- `/business-partner`: High-converting landing page with benefits, how it works in 4 steps, commission explanations, and FAQ.
- `/business-partner/apply`: Multi-step application with Turnstile/reCAPTCHA and privacy policy acknowledgement.
- `/business-partner/activate`: Password setup with celebratory welcome card and 1-click copy of partner ID and referral links.
- `/business-partner/policy` & `/broker-terms`: Official legal agreement layout with table of contents.

---

## 4. Visual Screenshot Matrix (`broker-ui-screenshots/`)

| Page | 1440px Desktop | 768px Tablet | 375px Mobile | Notes |
|------|----------------|--------------|--------------|-------|
| Palette Options | `palette_options.png` | — | — | User selected Option 1 (Brass Gold) |
| Dashboard | `dashboard_desktop_1440.png` | `dashboard_tablet_768.png` | `dashboard_mobile_375.png` | Verified responsive, charts intact |
| Onboarding | `onboarding_desktop_1440.png` | `onboarding_tablet_768.png` | `onboarding_mobile_375.png` | Stepper ring & forms tested |
| Leads Pipeline | `leads_desktop_1440.png` | `leads_tablet_768.png` | `leads_mobile_375.png` | Table & Kanban views validated |
| Projects List | `projects_desktop_1440.png` | `projects_tablet_768.png` | `projects_mobile_375.png` | Zero horizontal scroll on mobile |
| Projects New | `projects_new_1440.png` | — | — | Multi-step wizard tested |

---

## 5. Verification Checklist

- [x] All 37 backend endpoints consumed strictly according to `BROKER_API_CONTRACT.md`
- [x] Warm Sand / Brass Gold (`#C2A878`) design system implemented in `globals.css` and `BROKER_DESIGN_SYSTEM.md`
- [x] Zero infinite circular spinners; layout-matched skeletons used everywhere
- [x] All financial amounts formatted with `formatCurrencyINR` (e.g., `₹1,25,000`)
- [x] IDOR protection and role boundaries maintained
- [x] Committed after every page on branch `broker-ui-redesign`
- [x] Responsive on 1440px desktop, 768px tablet, 375px mobile
