# Axivon Commerce (NovaCart Edition) — E-Commerce Application & Downloadable Demo

## Executive Summary

**Axivon Commerce** is a production-grade, full-fidelity e-commerce demonstration application engineered by **Axivon Technologies**. It serves a dual purpose:

1. **Live Interactive Web Demonstration**: Discoverable directly within the Axivon corporate platform under the Demo Projects catalogue and Application Demos showcase.
2. **Downloadable Standalone Demo Package**: A clean, zero-dependency Next.js application archive (`axivon-commerce-demo-v1.0.0.zip`) that clients, technical evaluators, and partners can download, run locally in under two minutes, inspect the codebase, and customize.

---

## Key Capabilities & Architecture

### 1. Dual-Tier Isolated Architecture
- **Complete Isolation from Production Data**: The storefront and demo store administration run independently without connecting to Axivon's live PostgreSQL databases or CRM pipelines.
- **Client-Side State Engine**: Cart items, wishlists, promo codes, stock levels, custom created products, and placed demo orders are maintained using browser `localStorage` with defensive fallbacks and hydration safety.
- **One-Click State Reset**: Both the web demo and standalone application include a confirmed **Reset Demo Data** mechanism (`resetDemoStoreData()`) that restores catalog and order data back to factory seed settings.

---

### 2. Customer Storefront Features

- **Responsive Brand Layout & Design System**: Custom porcelain (`#F7F7F2`), charcoal (`#1C1D1A`), and citrus lime (`#D8F16A`) lifestyle aesthetic with generous whitespace and typography.
- **Catalog Browsing & Discovery**:
  - Filterable by 4 distinct lifestyle categories (*Fashion Accessories*, *Bags & Travel*, *Home & Living*, *Tech Accessories*).
  - Multi-attribute sorting by Price (Low to High, High to Low), Newest Arrivals, and Alphabetical order.
  - Interactive search bar with real-time substring matching across titles, descriptions, and tags.
- **Product Detail Experience**:
  - Multi-angle high-resolution photograph carousel.
  - Interactive color variant picker.
  - Dynamic stock status indicator (*In Stock*, *Low Stock*, *Sample Stock Only*).
  - Expandable accordion specifications (Dimensions, Materials, Care instructions, Shipping estimates).
  - Contextual related product recommendations.
- **Cart & Wishlist Engine**:
  - Drawer-less dedicated cart interface with quantity adjusters and line item removal.
  - Free shipping progress threshold indicator (₹2,000 threshold).
  - Promotional discount coupon engine supporting both percentage (`WELCOME10`) and flat amount (`NOVAFIRST`) discounts.
  - Interactive Wishlist with instant "Move to Cart" action.
- **Simulated Checkout Flow**:
  - Step 1: Customer details & shipping address with form validation.
  - Step 2: Shipping method selection (Standard ₹149 vs. Express Courier ₹299 vs. Free Shipping over ₹2,000).
  - Step 3: Payment simulation (Credit/Debit Card, UPI / QR, Cash on Delivery) with explicit test demonstration notices.
- **Order Confirmation & Customer Account**:
  - Real-time order generation with unique ID (`AXV-ORD-...`).
  - Account history view displaying active order status pipeline, tracking numbers, and delivery timelines.

---

### 3. Store Administration Console (`/admin`)

An isolated back-office dashboard designed for store operators and merchandisers:

- **Executive KPI Metrics**:
  - Gross Revenue (₹) calculated dynamically from active orders.
  - Active Orders count and fulfillment rate.
  - Average Order Value (AOV).
  - Total registered demo customers.
- **Catalog Management (CRUD)**:
  - Add New Product modal with category, price, inventory count, color variants, and image selection.
  - Edit existing product titles, descriptions, prices, and stock statuses.
  - Instant stock availability toggle (*In Stock* vs. *Out of Stock*).
  - Delete product action with confirmation.
- **Order Lifecycle Pipeline**:
  - Real-time tabular order feed.
  - Status progression stepper: `PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` (or `CANCELLED`).
  - Comprehensive order inspector modal displaying line items, shipping address, and payment method.
- **Inventory Health Alerts**:
  - Dedicated low-stock and out-of-stock monitor.
  - Quick-action restock updater.
- **Customer Directory**:
  - Customer profile list with contact emails, registered phone numbers, and calculated lifetime spend.
- **Reset Store Data Engine**:
  - Modal with safety confirmation to reset demo orders and products back to the baseline seed.

---

## Public Showcase & Download Distribution

### Showcase Page
- **URL**: `/application-demos/ecommerce`
- **Features**:
  - Visual hero introducing Axivon Commerce.
  - Live storefront preview and Store Admin preview cards.
  - 8-pillar architectural feature grid.
  - Verified package download card featuring real file size, SHA-256 readiness, and version details.
  - Local development quick-start guide.
  - Axivon enterprise custom development consultation CTA.

### Public Download API
- **Endpoint**: `/api/v1/public/downloads/ecommerce`
- **Supported Query Parameters**:
  - `?info=true`: Returns release JSON metadata (version, file size in bytes, release date, framework stack, minimum requirements, feature list).
  - Direct GET: Streams the verified `axivon-commerce-demo-v1.0.0.zip` file directly to the client browser with `Content-Disposition: attachment`.

---

## Standalone Package Specification

| Attribute | Specification |
|---|---|
| **Archive File** | `public/downloads/axivon-commerce-demo-v1.0.0.zip` |
| **Size** | ~4.17 MB (4,370,038 bytes) |
| **Total Files** | 91 files |
| **Framework** | Next.js 15+ / 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **Assets Included** | 52 local lifestyle product images (`/public/images/demo-projects/novacart/`) |
| **Purity** | 0 git history, 0 node_modules, 0 secret keys, 0 production database credentials |
| **Setup Time** | Under 2 minutes via `npm install` and `npm run dev` |

---

## Verification & Automated Testing

The e-commerce demonstration application is covered by unit and integration tests located in `tests/ecommerce-demo.test.ts`:

1. **Catalog Data Integrity**: Validates product models, category distribution, price formatting, and promo code calculations.
2. **Order State & Shopping Workflow**: Validates shipping fee rules, order lifecycle state machine transitions, and structured order generation.
3. **Data Isolation & Security Safeguards**: Confirms that demo customers and orders use demonstrative mock data, and verifies client configurations contain zero production secrets.
4. **Standalone Package Verification**: Asserts that `public/downloads/axivon-commerce-demo-v1.0.0.zip` exists on disk and satisfies minimum size thresholds.

All 158 tests across the Axivon Technologies test suite pass without regression.
