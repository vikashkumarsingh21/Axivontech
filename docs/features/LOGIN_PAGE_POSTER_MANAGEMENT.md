# AXIVON ONE — Premium Login Page & Dynamic Poster Management System

## Overview

The AXIVON ONE authentication interface features a premium split-screen design paired with a dynamic, admin-controlled poster carousel system. Administrators can schedule, manage, reorder, preview, and monitor login page announcements and marketing graphics directly from the unified Admin Control Center without touching codebase files or requiring application redeployments.

---

## 1. Architecture & Component Structure

```
axivon-technologies/
├── prisma/
│   ├── schema.prisma                                     # LoginPagePoster model + User relation
│   └── migrations/20261016000000_add_login_page_posters/ # Migration SQL
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   ├── page.tsx                                  # Premium split-screen login page with animated carousel
│   │   │   └── layout.tsx                                # No-index auth metadata
│   │   ├── admin/
│   │   │   └── content/
│   │   │       └── login-posters/
│   │   │           └── page.tsx                          # Full CRUD Admin Poster Management console
│   │   └── api/v1/
│   │       ├── public/
│   │       │   └── login-posters/route.ts                # Public filtered endpoint (time/status eligible)
│   │       └── admin/
│   │           └── login-posters/
│   │               ├── route.ts                          # Admin GET list + POST create with stats
│   │               └── [id]/route.ts                     # Admin GET, PATCH update, DELETE
│   └── components/
│       └── portal/
│           └── AdminSidebar.tsx                          # Integrated "Content Management" menu
└── tests/
    └── login-posters.test.ts                             # Automated unit test suite
```

---

## 2. Database Schema: `LoginPagePoster`

Added to `prisma/schema.prisma` and connected to the `User` model:

```prisma
model LoginPagePoster {
  id            String    @id @default(cuid())
  title         String
  subtitle      String?
  imageUrl      String    @db.Text
  altText       String?
  ctaLabel      String?
  ctaUrl        String?
  displayOrder  Int       @default(0)
  status        String    @default("DRAFT") // DRAFT, ACTIVE, SCHEDULED, INACTIVE
  startsAt      DateTime?
  endsAt        DateTime?
  internalNotes String?   @db.Text
  createdById   String?
  createdBy     User?     @relation("PosterCreator", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status])
  @@index([displayOrder])
}
```

---

## 3. API Endpoints

### 3.1. Public Endpoint: `GET /api/v1/public/login-posters`
- **Access**: Public (unauthenticated)
- **Filters**:
  - `status = "ACTIVE"`
  - `startsAt IS NULL OR startsAt <= NOW()`
  - `endsAt IS NULL OR endsAt >= NOW()`
- **Order**: `displayOrder ASC`, limit 10
- **Security**: Only projects public-safe fields (`id`, `title`, `subtitle`, `imageUrl`, `altText`, `ctaLabel`, `ctaUrl`, `displayOrder`). Omits `internalNotes`, `createdById`, and admin metadata.

### 3.2. Admin Endpoints: `GET /api/v1/admin/login-posters`
- **Access**: Requires `admin:access` permission (FOUNDER, CO_FOUNDER, ADMIN)
- **Response**: All posters with creator relations and aggregated counts:
  ```json
  {
    "posters": [...],
    "stats": {
      "total": 5,
      "active": 3,
      "draft": 1,
      "scheduled": 1,
      "inactive": 0
    }
  }
  ```

### 3.3. Admin Create: `POST /api/v1/admin/login-posters`
- **Validation**: Requires `title` and `imageUrl`
- **Payload**: Accepts title, subtitle, imageUrl, altText, ctaLabel, ctaUrl, displayOrder, status, startsAt, endsAt, internalNotes
- **Audit**: Tracks `createdById` from the authenticated admin session

### 3.4. Admin Item: `GET | PATCH | DELETE /api/v1/admin/login-posters/[id]`
- **PATCH**: Supports partial updates for inline reordering (`displayOrder`), instant status toggling (`ACTIVE` <-> `INACTIVE`), schedule adjustment, and field edits.
- **DELETE**: Permanently removes poster with server-side validation.

---

## 4. UI & UX Features

### 4.1. AXIVON ONE Login Page (`/login`)
- **Split Screen**: 40% left panel for authentication form, 60% right panel for dynamic poster carousel (collapses to full-width form on mobile).
- **Brand Palette**: Clean dark theme (`#0a0a0a`), red brand accents (`red-600`), and `AXIVON ONE` identity badge.
- **Carousel Animation**:
  - Auto-rotates every 6 seconds with progress bar indicator.
  - Pauses timer when user hovers over the slide.
  - Smooth slide transitions via Framer Motion `AnimatePresence`.
  - Manual arrow navigation and dot pagination indicators.
  - Left/Right keyboard navigation support (automatically disabled when typing into inputs).
  - Respects OS `prefers-reduced-motion` settings.
- **Graceful Fallback**: If no posters are active or configured, displays an ambient animated gradient background with glowing orb, subtle matrix grid, and enterprise brand messaging.

### 4.2. Admin Poster Management Console (`/admin/content/login-posters`)
- **Real-time Metrics**: KPI cards for Total, Active, Draft, Scheduled, and Inactive counts.
- **Table Controls**:
  - Live search by title and subtitle.
  - Filter dropdown by status.
  - Order adjustment buttons (Move Up / Down).
  - One-click visibility toggle (Active / Inactive).
  - Modal form for creating and updating posters with live image preview.
  - Scheduled date/time picker with dark mode styling.
  - Safe delete confirmation modal.
- **Sidebar Integration**: Added under "Content Management" directly above "Platform & Governance".

---

## 5. Verification & Testing

- Automated tests in `tests/login-posters.test.ts` verify:
  - Time-based eligibility filtering logic
  - Data projection security (no leakage of internal notes)
  - Validation requirements
  - Status toggle transitions
  - Carousel cyclic rotation math
- TypeScript compilation checked with `npx tsc --noEmit` (0 errors).
