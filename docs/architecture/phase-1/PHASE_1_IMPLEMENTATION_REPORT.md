# PHASE 1 — AXIVON ONE MULTI-DATABASE FOUNDATION REPORT

## 1. Architecture Decisions

| Domain Decision | Selected Owner | Reason | Status |
|-----------------|----------------|--------|--------|
| **PartnerProject** | **CLIENT DB** | The project belongs to the end-client. Brokers simply originate it, and employees execute it. | FINALIZED |
| **Lead / CRM** | **CLIENT DB** | Pre-sales (Lead) converts into post-sales (PartnerProject, CrmClient). Keeping them in the same DB preserves transactional integrity during conversion. | FINALIZED |
| **Task** | **EMPLOYEE DB** | Tasks drive employee operations, attendance, and work reports. PartnerProject ID is a cross-domain soft link. | FINALIZED |
| **PartnerDocument**| **CORE DB** | Core DB acts as the central registry for files, accessible to Admins, Brokers, and Clients. | FINALIZED |
| **PartnerContract**| **CLIENT DB** | Contracts and payments tie directly to the PartnerProject lifecycle. | FINALIZED |
| **PaymentSettings**| **CORE DB** | System-wide payment configurations are master data. | FINALIZED |

## 2. Model Ownership

Every Prisma model has been assigned an authoritative DB. The exact 66 models found in `prisma/schema.prisma` have been partitioned without duplication.

* **CORE**: 26 models (User, Role, Permissions, Organization, Session, AuditLog, Notifications, KnowledgeDocument, PartnerDocument, etc.)
* **CLIENT**: 16 models (PartnerProject, PartnerContract, PartnerPayment, Lead, Opportunity, CrmClient, etc.)
* **EMPLOYEE**: 18 models (Attendance, Task, WorkReport, LeaveRequest, Project, QaIssue, etc.)
* **BROKER**: 6 models (BrokerProfile, Commission, BusinessPartnerApplication, etc.)
* **CROSS-DOMAIN (Unassigned)**: 0
* **TOTAL**: 66 models

## 3. Prisma Architecture Foundation

The original monolithic `prisma/schema.prisma` remains intact and drives the live application. In parallel, the Phase 2 foundational schemas have been successfully built and validated.

- **Schema Locations**: 
  - `prisma/core/schema.prisma`
  - `prisma/client/schema.prisma`
  - `prisma/employee/schema.prisma`
  - `prisma/broker/schema.prisma`
- **Generators**: Each schema outputs to its own dedicated path:
  - `node_modules/@prisma/client/core`
  - `node_modules/@prisma/client/client`
  - `node_modules/@prisma/client/employee`
  - `node_modules/@prisma/client/broker`
- **Environment Variables**: `CORE_DATABASE_URL`, `CLIENT_DATABASE_URL`, `EMPLOYEE_DATABASE_URL`, and `BROKER_DATABASE_URL` have been designated.

## 4. Cross-Database Architecture

- **ID References**: Cross-database `@relation` constraints have been replaced by standard `@index` String fields (Soft Links). For example, `Task` (in Employee DB) simply stores `partnerProjectId String? @index`.
- **Service Boundaries**: The application will perform sequential data fetching and map arrays in memory.
- **Authorization**: Core DB handles JWT generation. Future microservices or API routes will validate JWTs statelessly and query the Core DB if raw user details are needed.

## 5. Distributed Transaction Strategy

The most significant cross-domain transaction boundary is **Project Approval & Setup**. In Phase 2, this must migrate from a `db.$transaction` to an Event-Driven / Saga pattern. 
- *Conversion of Lead to Client*: Will remain perfectly transactional because CRM was mapped to the Client DB.
- *Application Approval*: Will use an Outbox/Webhooks to link Broker DB to Core DB.

## 6. Cascade Delete Strategy

Cross-database referential actions are impossible in Postgres. Therefore:
1. `User` deletion becomes an application-level Soft Delete (`status = "DELETED"`).
2. Deleting a `PartnerProject` requires the Client API to orchestrate DELETE calls to the Employee API (for internal tasks) and Broker API (for pending commissions).

## 7. Migration Plan (Phase 2 Strategy)

Phase 2 data migration must follow a strictly ordered ETL flow during a required maintenance window:
1. Copy Core models (Users, Orgs) to CORE DB.
2. Copy HR models to EMPLOYEE DB.
3. Copy CRM/Client models to CLIENT DB.
4. Copy Broker models to BROKER DB.
5. Project/Commission join models last.

## 8. Validation Sign-Off

| Step | Status | Evidence |
|------|--------|----------|
| **Prisma Validate (Core)** | PASS | Script successfully validated schema syntax |
| **Prisma Validate (Client)** | PASS | Script successfully validated schema syntax |
| **Prisma Validate (Employee)** | PASS | Script successfully validated schema syntax |
| **Prisma Validate (Broker)** | PASS | Script successfully validated schema syntax |
| **Prisma Generate** | PASS | 4 clients successfully output to `node_modules` |
| **TypeScript Checks** | PASS | `npx tsc --noEmit` completed |
| **Existing Application** | PASS | The monolith configuration remains 100% operational |
| **Production Data** | UNCHANGED | Zero production data modified or migrated |

**PHASE 1 IS COMPLETE AND READY FOR PHASE 2 ETL IMPLEMENTATION.**
