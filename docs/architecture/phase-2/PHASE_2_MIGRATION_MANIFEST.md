# PHASE 2 — MIGRATION MANIFEST

This manifest locks in the final DB destination for all 66 models during the ETL phase.

## CORE (26 Models)
Organization, User, Role, Permission, UserRole, RolePermission, Session, AuditLog, SecurityEvent, OrganizationSetting, Notification, BackgroundJob, EmailLog, EmailTemplate, CommunicationTemplate, UserPreference, Activity, Document, DocumentVersion, DocumentPermission, PartnerDocument, PaymentSettings, KnowledgeDocument, ChatKnowledgeGap, ChatFeedback, PortfolioProject.

## CLIENT (16 Models)
PartnerProject, PartnerProjectMilestone, PartnerProjectMember, PartnerContract, PartnerContractVersion, PartnerPayment, Lead, LeadActivity, FollowUp, LeadNote, LeadMeeting, PipelineStage, Opportunity, Proposal, CrmClient, ClientContact.

## EMPLOYEE (18 Models)
Attendance, AttendanceBreak, AttendancePolicy, RegularizationRequest, Holiday, Task, TaskComment, WorkReport, LeaveRequest, Project, ProjectMember, ExecutiveProfile, ApprovalRequest, Reminder, Announcement, AutomationWorkflow, AutomationExecution, QaIssue.

## BROKER (6 Models)
BrokerProfile, CommissionRule, Commission, BusinessPartnerApplication, ApplicationMeeting, ApplicationStatusHistory.

**Integrity Checked:** 66 models mapped. 0 duplicates. 0 missing.
