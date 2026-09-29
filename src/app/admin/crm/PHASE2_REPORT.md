# AXIVON ONE: Broker / Partner Lead Management System — Phase 2 Implementation Report

## Overview
The Phase 2 end-to-contract-and-payment workflow has been completely implemented natively within the AXIVON ONE architecture. The system now supports a full bi-directional portal for Admins and Brokers to manage the lifecycle of a Partner Project.

All implementations strictly adhered to existing security boundaries (IDOR protection, JWT role parsing, centralized middleware), design paradigms, UI themes, and API structures. No duplicate systems were created.

## Database & Model Integation
- Maintained the Phase 1 `PartnerProject`, `PartnerContract`, `PartnerPayment`, `PaymentSettings`, and `PartnerDocument` models.
- Integrated successfully without changing existing authentication.

## 1. Back-end Implementations (APIs)

- **Admin Document Management API** (`/api/v1/admin/partner-documents` & `/[id]`):
  - Created POST to share documents with specific brokers or all brokers.
  - Generates `DOCUMENT_UPLOADED` audit log and sends notifications.
- **Admin Contract Management API** (`/api/v1/admin/partner-contracts` & `/[id]`):
  - Created POST to issue contracts. Project state advances to `CONTRACT_SENT`.
  - Created PATCH for verify/reject logic.
  - **Payment Generation**: Upon verifying a contract, automatically creates a `PartnerPayment` instance requiring the default 40% advance, taking an immutable snapshot of current bank/UPI `PaymentSettings` for this specific project.
- **Admin Payment API** (`/api/v1/admin/partner-payments` & `/[id]`):
  - Handles verification of UTR numbers. Verified payments transition the Project state to `PROJECT_CONFIRMED`.
- **Admin Payment Settings API** (`/api/v1/admin/payment-settings`):
  - Upsert functionality for `BANK` and `UPI` instructions.
- **Broker Projects API** (`/api/v1/broker/projects` & `/[id]`):
  - Uses strictly IDOR-protected fetch logic ensuring a broker can only view their own leads and projects.
- **Broker Contract APIs** (`/api/v1/broker/contracts/[id]/upload` & `/download`):
  - Exposes download tracking (for audit trail) and signed contract upload forms (with optional company stamp).
- **Broker Payment APIs** (`/api/v1/broker/payments/[id]/submit`):
  - Accepts screenshot URL, payment method (Bank/UPI), amount, date, and UTR number.

## 2. Front-end Operational UI

### Admin Panel
1. **Document Center** (`/admin/crm/documents`): Complete CRUD UI to manage shared assets with partners. Includes recipient selection.
2. **Payment Settings** (`/admin/settings/payment`): Configuration page to manage active Bank accounts and UPI IDs shown to brokers.
3. **Partner Projects Detail** (`/admin/crm/partner-projects/[id]`): Centralized 4-tab dashboard (`Overview`, `Contract`, `Payment`, `Timeline`). Admin handles the entire project lifecycle here. Includes Send Contract modals, Rejection modals with reasons, and Verify tools.
4. **Partner Payments Master List** (`/admin/crm/payments`): Dedicated table to view all pending/submitted UTR proofs.

### Broker Portal
1. **Enhanced Dashboard** (`/broker/dashboard`): Now calculates and alerts on `Pending Action` items (contracts to sign, payments to submit) and tracks Active projects vs. Confirmed projects.
2. **Projects Master List** (`/broker/projects`): Clear view of all confirmed partner projects and their macro status.
3. **Project Action Center** (`/broker/projects/[id]`):
   - **Contract Tab**: Dedicated flow to download the sent contract, sign it locally, and upload the signed PDF.
   - **Payment Tab**: Dynamically displays the 40% advance calculations. Shows the locked-in Bank and UPI snapshot instructions for that specific project (preventing issues if admin changes global bank details mid-project). Allows form submission of UTR and screenshot proof.
   - **Timeline Tab**: Visual timeline showing project progression from Request -> Sent -> Signed -> Verified -> Paid -> Confirmed.

### Navigational Updates
- Cleanly integrated the new CRM pages into `AdminSidebar` (under CRM & Business Growth).
- Cleanly integrated the Projects page into `BrokerSidebar`.

## 3. Security & Logging
- **Audit Logging**: Fully integrated with the native `db.auditLog.create` system tracking `CONTRACT_SENT`, `CONTRACT_VERIFIED`, `CONTRACT_REJECTED`, `PAYMENT_SUBMITTED`, `PAYMENT_VERIFIED`, `PAYMENT_REJECTED`, `DOCUMENT_UPLOADED`, and `PAYMENT_SETTINGS_UPDATED`.
- **Notifications**: Integrated with `db.notification.create`. Brokers receive alerts when documents are shared, contracts sent, or payments rejected. Admins receive alerts when contracts are signed or payment proofs submitted.

## 4. Stability
- **Build Passed**: Prisma validated perfectly. No emitted errors from `tsc`.
- **UI Architecture**: Components are strictly client-side interactive forms using the existing deep dark-mode and red accent themes.

The Broker / Partner system Phase 2 is completely implemented and ready for operational use.
