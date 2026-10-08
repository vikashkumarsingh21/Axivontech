# PHASE 1 — FINAL MODEL OWNERSHIP

This document assigns every single Prisma model (exactly 66) currently in the codebase to one authoritative database.

## Final Counts

| Database | Model Count |
|----------|-------------|
| **CORE** | 26 |
| **EMPLOYEE** | 18 |
| **CLIENT** | 16 |
| **BROKER** | 6 |
| **TOTAL** | **66** |

---

## 1. CORE DATABASE (26 Models)
Auth, Security, Global Settings, and Global Document Registries.

1. `Organization`
2. `User`
3. `Role`
4. `Permission`
5. `UserRole`
6. `RolePermission`
7. `Session`
8. `AuditLog`
9. `SecurityEvent`
10. `OrganizationSetting`
11. `Notification`
12. `BackgroundJob`
13. `EmailLog`
14. `EmailTemplate`
15. `CommunicationTemplate`
16. `UserPreference`
17. `Activity`
18. `Document`
19. `DocumentVersion`
20. `DocumentPermission`
21. `PartnerDocument`
22. `PaymentSettings`
23. `KnowledgeDocument`
24. `ChatKnowledgeGap`
25. `ChatFeedback`
26. `PortfolioProject`

## 2. EMPLOYEE DATABASE (18 Models)
Internal Operations, HR, Internal Projects, and Task Execution.

1. `Attendance`
2. `AttendanceBreak`
3. `AttendancePolicy`
4. `RegularizationRequest`
5. `Holiday`
6. `Task` *(Will use soft link to PartnerProject)*
7. `TaskComment`
8. `WorkReport`
9. `LeaveRequest`
10. `Project`
11. `ProjectMember`
12. `ExecutiveProfile`
13. `ApprovalRequest`
14. `Reminder`
15. `Announcement`
16. `AutomationWorkflow`
17. `AutomationExecution`
18. `QaIssue` *(Will use soft link to PartnerProject)*

## 3. CLIENT DATABASE (16 Models)
Client Delivery, Contracts, Payments, and Pre-Sales (CRM).

1. `PartnerProject` *(Will use soft link to BrokerProfile)*
2. `PartnerProjectMilestone`
3. `PartnerProjectMember` *(Will use soft link to User)*
4. `PartnerContract`
5. `PartnerContractVersion`
6. `PartnerPayment`
7. `Lead` *(Will use soft link to User)*
8. `LeadActivity`
9. `FollowUp`
10. `LeadNote`
11. `LeadMeeting`
12. `PipelineStage`
13. `Opportunity`
14. `Proposal`
15. `CrmClient`
16. `ClientContact`

## 4. BROKER DATABASE (6 Models)
Partner Network, Commissions, and Onboarding.

1. `BrokerProfile` *(Will use soft link to User)*
2. `CommissionRule`
3. `Commission` *(Will use soft link to PartnerProject)*
4. `BusinessPartnerApplication`
5. `ApplicationMeeting`
6. `ApplicationStatusHistory`
