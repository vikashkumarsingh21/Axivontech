# PHASE 1 — DATA MIGRATION PLAN

## Overview
This document outlines the strategy for migrating production data from the single monolith PostgreSQL database to the four split databases (Core, Client, Employee, Broker) during Phase 2. 

**IMPORTANT: No production data will be migrated during Phase 1.**

## Staging Validation Requirement
Before touching production, a complete dry-run must be executed in a Staging environment using a snapshot of production data.

## Migration Sequence (ETL Strategy)

### 1. Preparation
- Put the application into Maintenance Mode (downtime is mandatory to prevent data mutation during transfer).
- Provision the 4 new Neon Serverless PostgreSQL databases.
- Run `prisma db push` on all 4 new databases using their respective schemas.

### 2. Extract & Load (Node.js ETL Script)
A custom Node.js script will be written using the Prisma clients to stream data from the monolith to the targets.

**Order of Operations:**
1. **Core Data**: Users, Roles, Permissions, Organizations.
   - *Why first?* Every other database uses `userId`.
2. **Employee Data**: Attendances, Tasks, Leaves.
3. **Client Data (CRM)**: Leads, Opportunities, CrmClients.
4. **Broker Data**: BrokerProfiles, BusinessPartnerApplications.
5. **Client Data (Projects)**: PartnerProjects, Contracts, Payments.
   - *Why last?* PartnerProjects need both `userId` (Core) and `brokerProfileId` (Broker).
6. **Cross-Domain Data**: Commissions, Task relations.

### 3. ID Preservation
- Prisma uses `cuid()` by default for primary keys. 
- The ETL script will explicitly perform `CREATE` operations passing in the existing `id` string.
- This ensures that when foreign keys are converted to soft-link strings, the references will still match perfectly.

### 4. Integrity Validation
After the script completes, automated validation scripts must run:
- Row Count Checks: E.g., `Monolith.User.count() === Core.User.count()`
- Orphan Checks: E.g., Select all `Tasks` in Employee DB and verify their `userId` exists in Core DB.

### 5. Cutover
- Update Vercel production environment variables to use the 4 new database URLs.
- Deploy the Phase 2 code.
- Deactivate Maintenance Mode.
- Keep the old monolith database active (read-only) for 30 days as a rollback snapshot.
