# PHASE 1 — DELETE STRATEGY

## Cascading Delete Failure
In a multi-database architecture, Prisma's `@relation(onDelete: Cascade)` can only operate within the same physical database. When deleting records that have relations across databases, orphans will be created unless explicitly handled.

## Primary Risk: `User` Deletion
Deleting a User in the Core DB will leave the following orphaned:
- **Employee DB**: `Attendance`, `Task`, `WorkReport`, `LeaveRequest`
- **Broker DB**: `BrokerProfile`, `Commission`
- **Client DB**: `PartnerProjectMember`, `Lead` owner, `CrmClient` owner

### Strategy: Soft Deletes Only
Hard deletes across distributed databases are dangerous and computationally expensive (requiring distributed locks or complex sagas). 

**Implementation**:
1. Remove hard delete API routes for Users and Brokers.
2. Introduce a `status: "DELETED"` or `status: "INACTIVE"` string field/enum across entities.
3. When Admin deletes a User (Core DB), the API sets `status = "DELETED"`.
4. A background sync job (or an Event Bus like Kafka/RabbitMQ in the future, or simple HTTP webhooks) broadcasts `USER_SOFT_DELETED`.
5. The Employee, Broker, and Client services listen and update their local references (e.g., anonymizing the name, or marking the `BrokerProfile` as inactive) without actually dropping the SQL row.

## Secondary Risk: `PartnerProject` Deletion
Deleting a project must cascade to:
- **Client DB**: `PartnerContract`, `PartnerPayment` (These are in the same DB, so Prisma `Cascade` works).
- **Employee DB**: `Task`, `QaIssue`
- **Broker DB**: `Commission`

### Strategy: Application-Level Cleanup
If a project is cancelled or deleted:
1. Client DB deletes `PartnerProject`.
2. Client API issues synchronous HTTP DELETE commands (or async jobs) to Employee DB (`DELETE /internal/tasks?projectId=X`) and Broker DB (`DELETE /internal/commissions?projectId=X`).
3. Since these are internal service-to-service calls, they require a secure internal auth token/secret.

## Summary
- **Same Database**: Keep Prisma `@relation(onDelete: Cascade)`.
- **Cross Database**: Switch to Soft Deletes where possible, or use Application-Level Orchestration via asynchronous background jobs to clean up orphans.
