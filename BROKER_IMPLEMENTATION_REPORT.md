# Broker / Partner Lead Management System - Final Report

## 1. Files Created
- `src/app/api/v1/admin/brokers/route.ts` - Admin API to manage/create Brokers
- `src/app/api/v1/admin/brokers/[id]/route.ts` - Admin API to update Brokers
- `src/app/api/v1/broker/profile/route.ts` - Broker API to fetch profile and stats
- `src/app/api/v1/broker/referral/generate/route.ts` - Broker API to securely generate `AXV-BRK-XXXXXX`
- `src/app/api/v1/public/project-requests/route.ts` - Flow B: Confirmed Project onboarding via referral
- `src/app/admin/crm/brokers/page.tsx` - Admin CRM Brokers UI Table
- `src/app/broker/dashboard/page.tsx` - Broker Dashboard showing stats, leads, and referral links
- `src/app/broker/onboarding/page.tsx` - Initial Broker screen for generating referral code
- `src/app/broker/layout.tsx` - Custom layout with profile check middleware logic for Brokers
- `src/components/portal/BrokerSidebar.tsx` - Specialized sidebar component for the Broker Portal
- `src/app/lead/[referralCode]/page.tsx` - Flow A: Public lead collection via referral link
- `src/app/project/start/[referralCode]/page.tsx` - Flow B: Public confirmed project onboarding via referral link
- `scripts/seed-broker.ts` - Seed script mapping `BROKER` role and permissions

## 2. Files Modified
- `prisma/schema.prisma` - Added `BrokerProfile` model linking to `User`. Added `brokerProfile` relation field.
- `src/middleware.ts` - Extended role-based routing. `isBrokerRoute` ensures Brokers can access `/broker` but are denied from `/admin` and `/employee`. Conversely, normal users are denied from `/broker`.
- `src/app/api/v1/auth/login/route.ts` - Added `BROKER` to the role hierarchy array to correctly assign session payloads upon login.
- `src/app/api/v1/public/leads/route.ts` - Updated existing public lead API to accept an optional `referralCode` parameter, resolve it to an `ownerId`, and strictly map it to the Lead while tracking it via AuditLogs and LeadActivities.
- `src/components/portal/AdminSidebar.tsx` - Added the `Brokers` route under the CRM section for Admins.

## 3. Database Changes
Added a new model `BrokerProfile` representing a 1:1 relationship with the `User` table to keep authentication unified. 
```prisma
model BrokerProfile {
  id           String  @id @default(cuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  referralCode String? @unique
  
  companyName  String?
  designation  String?
  // ... location fields
}
```
Existing `Lead` and `Opportunity` models already included `ownerId` which correctly references `User.id`, meaning data associations work natively with existing models.

## 4. Roles and Permissions
- **New Role**: `BROKER`
- **New Permissions**: `broker:profile`, `broker:leads`, `broker:projects`.
- Applied standard RBAC rules using `requirePermission(brokerId, "broker:profile")`.

## 5. Security & Isolation Workflows
- **Middleware Boundary**: Brokers are strictly confined to `/broker/*` and `/api/v1/broker/*`.
- **Referral Generation**: `referralCode` is generated server-side using `crypto.randomBytes()`. It checks for uniqueness and strictly rejects if the Broker already generated a code.
- **Form Anti-Tampering**: On public forms (Flow A and B), the `referralCode` is passed server-side via the URL path and verified against the database. If invalid, the submission is rejected. The user cannot manipulate the `ownerId` directly.
- **Admin Isolation**: Admin APIs restrict creation and updates using the `users:write` permission.

## 6. Audit Logging & Notifications
- Reused existing `db.auditLog.create` for:
  - `BROKER_CREATED`
  - `BROKER_UPDATED`
  - `REFERRAL_CODE_GENERATED`
- Reused existing `db.notification.createMany` and `db.leadActivity.create` to alert Admins when public leads/project requests are submitted.
- Reused existing `EmailService.send` for fallback notifications.

## 7. Testing and Build
- Validated Prisma Client generation (`npx prisma generate`).
- Validated Database push operations safely.
- TypeScript checked for missing imports and mismatched types across the newly implemented UI forms and APIs.
- Next.js production build triggered successfully.
