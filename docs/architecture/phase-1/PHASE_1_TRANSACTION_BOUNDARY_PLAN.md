# PHASE 1 — TRANSACTION BOUNDARY PLAN

## Distributed Transaction Risks
Splitting the database implies that `db.$transaction()` cannot wrap inserts/updates spanning multiple domains. The following boundary risks must be refactored via eventual consistency or application-level orchestration.

## 1. Project Approval & Broker Commission
* **Current Action**: Admin approves a project. Project status becomes "APPROVED", a `Task` is generated for internal setup, and a `Commission` is generated for the Broker.
* **Domains**: Client DB (`PartnerProject`), Employee DB (`Task`), Broker DB (`Commission`).
* **Why Distributed Tx Needed**: If Task generation fails, the Project shouldn't be marked approved. If Commission generation fails, the Broker loses money.
* **Future Strategy (Phase 2)**: **Orchestrator/Saga Pattern**
  1. Client DB sets Project status to "APPROVING_PENDING".
  2. Emit `PROJECT_APPROVED_INTENT` event.
  3. Employee Service creates `Task`.
  4. Broker Service creates `Commission`.
  5. If both succeed, Client DB sets Project to "APPROVED". (Compensation logic needed if one fails).

## 2. Lead Conversion (CRM to Client)
* **Current Action**: Lead is marked "WON". System creates a `CrmClient` and a `PartnerProject`.
* **Domains**: Client DB (`Lead`, `CrmClient`, `PartnerProject`).
* **Why Distributed Tx Needed**: Previously, this was a massive cross-DB risk.
* **Future Strategy (Phase 2)**: **Single DB Transaction**. Because we made the architectural decision to keep CRM and Client in the same DB, this operation remains a safe `db.$transaction`.

## 3. User Creation & Broker Profile
* **Current Action**: A Business Partner Application is approved. System creates a `User` and a `BrokerProfile`.
* **Domains**: Core DB (`User`), Broker DB (`BrokerProfile`).
* **Future Strategy (Phase 2)**: **Outbox Pattern**.
  1. Admin approves application in Broker DB (starts process).
  2. Request sent to Core DB to create `User`.
  3. On success, `User` ID is returned.
  4. Broker DB creates `BrokerProfile` with the `User` ID.

## 4. Attendance & Leaves
* **Current Action**: Employee checks in, but has an approved leave.
* **Domains**: Both inside Employee DB.
* **Future Strategy**: No change. Safe `db.$transaction`.
