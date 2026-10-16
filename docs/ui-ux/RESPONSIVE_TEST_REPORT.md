# Axivon ONE — Responsive & Cross-Device Test Report

**Date:** October 16, 2026  
**QA Lead:** Frontend Quality & Compatibility Engineering  
**Scope:** Mobile ($360\text{px} - 639\text{px}$), Tablet ($640\text{px} - 1023\text{px}$), Desktop ($1024\text{px} - 1920\text{px}$)  

---

## 1. Responsive Viewport Matrix

| Viewport Category | Screen Width Range | Layout Strategy | Navigation State |
|---|---|---|---|
| **Mobile Portrait** | $360\text{px} - 479\text{px}$ | Single column, full-width cards, compact padding (`p-4`) | Off-canvas sliding drawer (`z-50`), Hamburger toggle |
| **Mobile Landscape** | $480\text{px} - 639\text{px}$ | 2-column KPI grid, compact table cells | Off-canvas drawer, truncated breadcrumbs |
| **Tablet Portrait** | $640\text{px} - 767\text{px}$ | 2-column KPI grid, horizontal scroll tables | Drawer navigation with backdrop blur |
| **Tablet Landscape**| $768\text{px} - 1023\text{px}$| 2/3-column grids, inline filter bars | Drawer navigation (`lg:hidden`), header search active |
| **Desktop Standard**| $1024\text{px} - 1439\text{px}$| 4-column KPI grids, sticky sidebar, fixed top header | Permanent left sidebar (`w-64`), full search bar |
| **Large Displays** | $1440\text{px} - 2560\text{px}$| Constrained max width (`max-w-7xl mx-auto`), high density | Permanent sidebar, expanded tables and kanban boards |

---

## 2. Component-Level Responsive Verification

### 2.1. Navigation Sidebars (`AdminSidebar`, `EmployeeSidebar`, `BrokerSidebar`, `ExecutiveSidebar`, `ClientSidebar`)
- **Desktop Behavior ($ \ge 1024\text{px}$):**
  - Rendered statically as a permanent flex column.
  - Smooth scrollbar within `nav` container prevents whole-page horizontal jitter.
- **Mobile Drawer Behavior ($ < 1024\text{px}$):**
  - Rendered with `fixed inset-y-0 left-0 z-50` and CSS transition `duration-300 ease-in-out`.
  - Backdrop overlay (`bg-slate-900/60 backdrop-blur-xs`) dismisses sidebar upon click.
  - Links automatically trigger `onClose` callback to dismiss drawer upon route transition.
  - Window `resize` event listener automatically closes the drawer when expanding to desktop width.

### 2.2. Portal Header (`PortalHeader`)
- **Breadcrumb Adaptation:**
  - Hidden on screens $< 640\text{px}$ to preserve room for portal title and action icons.
  - Full breadcrumb hierarchy rendered on $\ge 640\text{px}$.
- **Search Bar Adaptation:**
  - Collapses into a clean magnifying glass icon button on mobile.
  - Expands into an interactive input with `Ctrl+K` keyboard pill on tablet landscape and desktop ($\ge 768\text{px}$).
- **Profile Avatar:**
  - Initials circle ($32\times32\text{px}$) with user name and role label displayed on desktop; icon-only on mobile to avoid header overflow.

### 2.3. Data Tables & Grids
- **Horizontal Scrolling:**
  - All data tables are wrapped in `<div className="overflow-x-auto">`.
  - Column headers use `whitespace-nowrap` to prevent awkward word wrapping.
  - Sticky table headers maintain visibility during vertical scrolling.
- **KPI Summary Reflow:**
  - Structured with `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
  - Zero overflow on $360\text{px}$ viewports.

### 2.4. Touch Target Compliance
- All interactive buttons, nav links, and dropdown items meet the recommended $44\times44\text{px}$ or $36\text{px}$ touch target minimums with appropriate padding.

---

## 3. Test Execution Summary

| Test Scenario | Status | Notes |
|---|---|---|
| Open/Close Mobile Drawer (Admin, Employee, Broker, Executive, Client) | **PASS** | Smooth 300ms transition, backdrop dismissal verified |
| Route transition from Drawer Link | **PASS** | Drawer dismisses immediately upon clicking link |
| Window resize from mobile to desktop | **PASS** | Drawer state cleans up automatically |
| Table horizontal pan on $375\text{px}$ iPhone viewport | **PASS** | No layout blowout, sticky headers intact |
| Modal centering and scroll lock | **PASS** | Body scroll locked, modal dialog scrollable on small screens |
