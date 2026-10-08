# PHASE 1 — MULTI-DATABASE ARCHITECTURE DECISIONS

## Overview
This document finalizes the database ownership for all ambiguous and cross-domain models identified during the Phase 0 audit.

## Decision Summary

| Decision | Selected Owner | Reason | Confidence | Status |
|----------|----------------|--------|------------|--------|
| **PartnerProject** | **CLIENT DB** | The ultimate goal is client delivery. The client logs in to view project milestones and status. Broker involvement is a referral mechanism. | HIGH | FINALIZED |
| **Lead / CRM** | **CLIENT DB** | Leads convert into `PartnerProject`s and `CrmClient`s. Keeping pre-sales and post-sales in the same database preserves referential integrity during the critical conversion step. | HIGH | FINALIZED |
| **Task** | **EMPLOYEE DB** | Tasks are the fundamental unit of work for employees, tying directly to WorkReports and Attendance. Cross-references to `partnerProjectId` will become soft links. | HIGH | FINALIZED |
| **PartnerDocument** | **CORE DB** | Documents are shared across Admin, Broker, and Client boundaries. Centralizing the document registry in Core avoids duplication. | MEDIUM | FINALIZED |
| **PartnerContract** & **Payment** | **CLIENT DB** | Contracts and payments are bound to the `PartnerProject` lifecycle and the end-client's financial obligations. | HIGH | FINALIZED |
| **PaymentSettings** | **CORE DB** | Global company bank/UPI settings. Used by Admin to display payment instructions to all clients and brokers. | HIGH | FINALIZED |
| **QaIssue** | **EMPLOYEE DB** | QA issues are internal tracking metrics assigned to employees (similar to Tasks) to ensure project quality before Client UAT. | MEDIUM | FINALIZED |

## Explanation of CRM Inclusion in Client DB
During Phase 0, creating a separate CRM Database was considered. However, creating a 5th database introduces massive transaction risk during the `POST /api/v1/crm/leads/[id]/convert` operation. By placing the CRM models (Lead, Opportunity, CrmClient, Proposal) into the **CLIENT DB**, the conversion from Lead to CrmClient and PartnerProject can remain a single transactional ACID operation within PostgreSQL.

## Explanation of Core DB Scope
The CORE database remains the central hub for:
1. **Identity & Auth**: User, Role, Session, Permissions
2. **System Infrastructure**: AuditLog, SecurityEvent, BackgroundJob, Notifications, Email/Communication Templates
3. **Global Config**: Organization, OrganizationSetting, UserPreference
4. **Global Registries**: Document, KnowledgeDocument (AI), PartnerDocument
