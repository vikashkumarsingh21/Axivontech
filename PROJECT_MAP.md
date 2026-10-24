# Axivon Technologies — Comprehensive Project Architecture & Route Map

**Generated Date:** 2026-10-24T06:25:11.515Z  
**System Stack:** Next.js 16.2.9 (App Router, Turbopack) | React 19.2.4 | Prisma ORM 5.22.0 | PostgreSQL (Neon Serverless) | Tailwind CSS v4 | jose (JWT) | bcryptjs  
**Application Port:** `http://localhost:3000`  
**Total Database Models:** 82  
**Total Page Routes:** 186  
**Total API Endpoints:** 253  
**Detected Form / Input Interfaces:** 72  

---

## 1. Authentication & Role Definitions

### 1.1 Architecture & Auth Method
- **Method:** Stateless JWT via HTTP-only cookie (`axivon_session`)
- **Crypto Library:** `jose` with HS256 HMAC signing
- **Session Duration:** 7 days standard
- **Downstream Headers:** Edge middleware injects verified `x-user-id` and normalized `x-user-role` into upstream request headers while stripping spoofed client headers.
- **Normalization Engine:** `src/lib/auth/roles.ts` provides canonical role mapping (e.g. `BROKER` is canonically normalized to `BUSINESS_PARTNER`).

### 1.2 User Roles & Access Hierarchies
| Role Key | Canonical Name | Target Dashboard URL | Purpose & Privileges |
|---|---|---|---|
| `FOUNDER` | Platform Founder | `/executive/dashboard` | Highest privilege; executive analytics, governance, org settings, user/role management |
| `CO_FOUNDER` | Co-Founder (Tech / Ops) | `/executive/dashboard` | Executive access with department-specific executive scoping |
| `ADMIN` | System Administrator | `/admin/dashboard` | Operations, HR, CRM, Content CMS, Attendance policies, approvals, user management |
| `EMPLOYEE` | Standard Employee | `/employee/dashboard` | Daily attendance, check-in/out, breaks, task tracking, work reports, leave requests, support |
| `BUSINESS_PARTNER` | Business Partner / Broker | `/broker/dashboard` | Project submission, milestone tracking, contracts, invoices/payments, commissions, QA issue reporting |
| `BROKER` | Legacy Alias | `/broker/dashboard` | Normalized to `BUSINESS_PARTNER` |
| `CLIENT` | Direct Client | `/client/dashboard` | Client project dashboard, deliverables, contracts, payment receipts |

---

## 2. Environment Variables & Third-Party Integrations

### 2.1 Configured Variables (.env)
- `DATABASE_URL`: PostgreSQL connection pooler (Neon)
- `NODE_ENV`: `development`
- `SESSION_SECRET`: Min 32-character secret key for JWT verification
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile public key
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile private verification key
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: Google reCAPTCHA v2 checkbox site key
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA v2 secret key

### 2.2 Missing / Optional Variables (.env.example vs .env)
- `RESEND_API_KEY`: Missing. *(Fallback active: Logs emails directly to local server console)*
- `RESEND_FROM`: Missing. *(Defaults to notifications@axivon.dev)*
- `EMAIL_WEBHOOK_URL` & `EMAIL_WEBHOOK_SECRET`: Missing. *(Optional secondary webhook)*
- `STORAGE_PROVIDER`: Missing. *(Defaults to LOCAL filesystem in `/public/uploads`)*
- `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`: Missing. *(S3 / R2 storage)*
- `GOOGLE_SHEETS_LEAD_WEBHOOK_URL`: Missing. *(Optional background Google Sheet lead export)*
- `CRON_SECRET`: Missing. *(Used to secure scheduled background jobs)*
- `SENTRY_DSN` & `NEXT_PUBLIC_ANALYTICS_ID`: Missing. *(Optional telemetry)*

### 2.3 Third-Party Integrations Summary
| Integration | Provider / Protocol | Implementation Details | Fallback / Local Behavior |
|---|---|---|---|
| **Email Service** | Resend API / HTTP Webhook | `src/lib/email/service.ts` | Logs email subject & HTML preview to stdout |
| **Payment Gateways** | Manual Bank & UPI Snapshot | `src/app/api/v1/admin/payment-settings` | Offline bank wire / UPI QR UTR verification flow |
| **SMS Gateway** | None (Not integrated) | Handled via transactional emails & in-app notifications | N/A |
| **Object Storage** | Local Disk / AWS S3 | `src/app/api/v1/admin/content/media/upload` | Writes files directly to `public/uploads/` |
| **CAPTCHA / Bot Defense** | Cloudflare Turnstile + Google reCAPTCHA v2 | `src/lib/captcha/` | Dev dummy tokens pass verification |
| **AI / Assistant** | Google Generative AI (Gemini) | `@google/generative-ai`, `src/lib/portal-ai` | Portal AI Assistant and chat completions |

---

## 3. Database Schema Models (82 Models)

```
 1. Organization
 2. User
 3. BrokerProfile
 4. PartnerProject
 5. PartnerProjectMilestone
 6. PartnerProjectMember
 7. QaIssue
 8. PartnerDocument
 9. PartnerContract
10. PartnerContractVersion
11. PartnerPayment
12. PaymentSettings
13. Role
14. Permission
15. UserRole
16. RolePermission
17. Session
18. AuditLog
19. Attendance
20. AttendanceBreak
21. AttendancePolicy
22. RegularizationRequest
23. Holiday
24. Task
25. TaskComment
26. WorkReport
27. LeaveRequest
28. Notification
29. Announcement
30. Document
31. Project
32. ProjectMember
33. ExecutiveProfile
34. ApprovalRequest
35. SecurityEvent
36. OrganizationSetting
37. EmailLog
38. EmailTemplate
39. Reminder
40. BackgroundJob
41. AutomationWorkflow
42. AutomationExecution
43. UserPreference
44. Lead
45. LeadActivity
46. FollowUp
47. LeadNote
48. LeadMeeting
49. PipelineStage
50. Opportunity
51. Proposal
52. CrmClient
53. ClientContact
54. DocumentVersion
55. DocumentPermission
56. Activity
57. CommunicationTemplate
58. KnowledgeDocument
59. ChatKnowledgeGap
60. ChatFeedback
61. PortfolioProject
62. CommissionRule
63. Commission
64. BusinessPartnerApplication
65. ApplicationMeeting
66. ApplicationStatusHistory
67. ClientReview
68. LoginPagePoster
69. JobPosting
70. CareerApplication
71. CareersPageSetting
72. WebsiteSetting
73. WebsiteFaq
74. WebsiteService
75. WebsiteIndustry
76. WebsiteArticle
77. MediaAsset
78. LegalPolicy
79. PolicyVersion
80. PrivacyRequest
81. UserConsentRecord
82. EmailChangeRequest
```

---

## 4. Application Routes by Role

### 4.1 Admin Portal (52 Pages)
```
/admin
/admin/activity
/admin/ai/knowledge
/admin/analytics
/admin/announcements
/admin/attendance
/admin/automations
/admin/business-partners/applications
/admin/business-partners/applications/[id]
/admin/calendar
/admin/careers
/admin/careers/applications
/admin/careers/settings
/admin/content
/admin/content/about
/admin/content/blog
/admin/content/demo-projects
/admin/content/faqs
/admin/content/homepage
/admin/content/industries
/admin/content/legal
/admin/content/login-posters
/admin/content/login_posters
/admin/content/media
/admin/content/seo
/admin/content/services
/admin/crm/brokers
/admin/crm/clients
/admin/crm/commissions
/admin/crm/dashboard
/admin/crm/documents
/admin/crm/follow-ups
/admin/crm/general-leads
/admin/crm/leads
/admin/crm/leads/[id]
/admin/crm/partner-projects
/admin/crm/partner-projects/[id]
/admin/crm/payments
/admin/crm/pipeline
/admin/crm/proposals
/admin/dashboard
/admin/documents
/admin/employees
/admin/leave
/admin/notifications
/admin/projects
/admin/reports
/admin/reviews
/admin/settings
/admin/settings/payment
/admin/tasks
/admin/work-reports
```

### 4.2 Executive Portal (Founder & Co-Founder) (10 Pages)
```
/executive
/executive/approvals
/executive/audit
/executive/company
/executive/dashboard
/executive/people
/executive/people/[id]
/executive/projects
/executive/reports
/executive/settings
```

### 4.3 Employee Portal (14 Pages)
```
/employee/announcements
/employee/attendance
/employee/calendar
/employee/dashboard
/employee/documents
/employee/leave
/employee/notifications
/employee/onboarding
/employee/profile
/employee/projects
/employee/settings
/employee/support
/employee/tasks
/employee/work-reports
```

### 4.4 Broker / Business Partner Portal (17 Pages)
```
/broker-program/terms
/broker-terms
/broker/commissions
/broker/dashboard
/broker/documents
/broker/leads
/broker/notifications
/broker/onboarding
/broker/profile
/broker/projects
/broker/projects/[id]
/business-partner
/business-partner-terms
/business-partner/activate
/business-partner/apply
/business-partner/dashboard
/business-partner/policy
```

### 4.5 Client Portal (10 Pages)
```
/client/activate
/client/dashboard
/client/documents
/client/invoices
/client/notifications
/client/profile
/client/projects
/client/projects/[id]
/client/support
/client/uat
```

### 4.6 Public & Informational Pages (58 Pages)
```
/
/about
/account-inactive
/blog
/blog/[slug]
/careers
/careers/[slug]
/careers/privacy
/contact
/demo-projects
/demo-projects/[slug]
/demo-projects/business/corporatepro
/demo-projects/ecommerce/novacart
/demo-projects/ecommerce/novacart/account
/demo-projects/ecommerce/novacart/admin
/demo-projects/ecommerce/novacart/cart
/demo-projects/ecommerce/novacart/category/[slug]
/demo-projects/ecommerce/novacart/checkout
/demo-projects/ecommerce/novacart/login
/demo-projects/ecommerce/novacart/order-confirmation
/demo-projects/ecommerce/novacart/products/[slug]
/demo-projects/ecommerce/novacart/register
/demo-projects/ecommerce/novacart/search
/demo-projects/ecommerce/novacart/shop
/demo-projects/ecommerce/novacart/wishlist
/demo-projects/education/edusmart
/demo-projects/fitness/fitzone
/demo-projects/food/foodiehub
/demo-projects/healthcare/medicare
/demo-projects/real-estate/estatevista
/demo-projects/saas/leadpilot
/demo-projects/saas/leadpilot/activities
/demo-projects/saas/leadpilot/calendar
/demo-projects/saas/leadpilot/companies
/demo-projects/saas/leadpilot/contacts
/demo-projects/saas/leadpilot/deals
/demo-projects/saas/leadpilot/leads
/demo-projects/saas/leadpilot/reports
/demo-projects/saas/leadpilot/settings
/demo-projects/saas/leadpilot/tasks
/industries
/login
/logout
/partner-program/terms
/portfolio
/portfolio/[slug]
/reviews
/services
/services/ai-solutions
/services/automation
/services/cloud-solutions
/services/custom-software-development
/services/digital-marketing
/services/mobile-app-development
/services/robotics-iot
/services/seo-services
/services/ui-ux-design
/services/web-development
```

### 4.7 Other Application Pages (25 Pages)
```
/acceptable-use-policy
/accessibility
/ai-privacy-notice
/ai-usage
/application-demos/ecommerce
/careers-privacy
/cookie-policy
/cookie-preferences
/disclaimer
/intellectual-property
/lead/[referralCode]
/legal
/legal/company-information
/payment-terms
/preferences
/privacy-policy
/privacy-requests
/project/start/[referralCode]
/refund-cancellation-policy
/reminders
/security-policy
/service-delivery-policy
/terms
/terms-and-conditions
/verify-email-change
```

---

## 5. API Endpoints Map (253 Endpoints)

### 5.1 Admin & CRM APIs (122 Endpoints)
```
/api/v1/admin/ai/knowledge
/api/v1/admin/ai/knowledge/[id]
/api/v1/admin/ai/knowledge/feedback
/api/v1/admin/ai/knowledge/gaps
/api/v1/admin/ai/knowledge/gaps/[id]
/api/v1/admin/ai/knowledge/seed
/api/v1/admin/ai/knowledge/settings
/api/v1/admin/ai/knowledge/upload
/api/v1/admin/announcements
/api/v1/admin/announcements/[id]
/api/v1/admin/attendance
/api/v1/admin/attendance/policies
/api/v1/admin/attendance/regularize
/api/v1/admin/audit
/api/v1/admin/brokers
/api/v1/admin/brokers/[id]
/api/v1/admin/business-partner/applications
/api/v1/admin/business-partner/applications/[id]
/api/v1/admin/business-partner/applications/[id]/create-account
/api/v1/admin/business-partner/applications/[id]/meetings
/api/v1/admin/calendar
/api/v1/admin/calendar/holidays
/api/v1/admin/calendar/holidays/[id]
/api/v1/admin/calendar/settings
/api/v1/admin/calendar/sync
/api/v1/admin/careers/applications
/api/v1/admin/careers/applications/[id]
/api/v1/admin/careers/jobs
/api/v1/admin/careers/jobs/[id]
/api/v1/admin/careers/settings
/api/v1/admin/careers/stats
/api/v1/admin/commission-rules
/api/v1/admin/commission-rules/[id]
/api/v1/admin/commissions
/api/v1/admin/commissions/[id]
/api/v1/admin/content/blog
/api/v1/admin/content/blog/[id]
/api/v1/admin/content/faqs
/api/v1/admin/content/faqs/[id]
/api/v1/admin/content/industries
/api/v1/admin/content/industries/[id]
/api/v1/admin/content/media
/api/v1/admin/content/media/[id]
/api/v1/admin/content/media/upload
/api/v1/admin/content/services
/api/v1/admin/content/services/[id]
/api/v1/admin/content/settings
/api/v1/admin/content/summary
/api/v1/admin/dashboard/summary
/api/v1/admin/demo-projects
/api/v1/admin/demo-projects/[id]
/api/v1/admin/documents
/api/v1/admin/employees
/api/v1/admin/employees/[id]
/api/v1/admin/jobs
/api/v1/admin/leaves
/api/v1/admin/leaves/[id]/approve
/api/v1/admin/leaves/[id]/reject
/api/v1/admin/legal/policies
/api/v1/admin/legal/policies/[id]
/api/v1/admin/legal/privacy-requests
/api/v1/admin/legal/privacy-requests/[id]
/api/v1/admin/login-posters
/api/v1/admin/login-posters/[id]
/api/v1/admin/login-posters/upload
/api/v1/admin/notifications
/api/v1/admin/partner-contracts
/api/v1/admin/partner-contracts/[id]
/api/v1/admin/partner-documents
/api/v1/admin/partner-documents/[id]
/api/v1/admin/partner-leads
/api/v1/admin/partner-payments
/api/v1/admin/partner-payments/[id]
/api/v1/admin/partner-projects
/api/v1/admin/partner-projects/[id]
/api/v1/admin/partner-projects/[id]/approve
/api/v1/admin/partner-projects/[id]/completion
/api/v1/admin/partner-projects/[id]/delivery
/api/v1/admin/partner-projects/[id]/milestones
/api/v1/admin/partner-projects/[id]/milestones/[milestoneId]
/api/v1/admin/partner-projects/[id]/pricing
/api/v1/admin/partner-projects/[id]/qa
/api/v1/admin/partner-projects/[id]/qa/[qaId]
/api/v1/admin/partner-projects/[id]/report
/api/v1/admin/partner-projects/[id]/review
/api/v1/admin/partner-projects/[id]/start
/api/v1/admin/partner-projects/[id]/tasks
/api/v1/admin/partner-projects/[id]/tasks/[taskId]
/api/v1/admin/partner-projects/[id]/team
/api/v1/admin/partner-projects/[id]/technical-review
/api/v1/admin/payment-settings
/api/v1/admin/projects
/api/v1/admin/projects/[id]
/api/v1/admin/reviews
/api/v1/admin/reviews/[id]
/api/v1/admin/security/captcha-status
/api/v1/admin/tasks
/api/v1/admin/tasks/[id]
/api/v1/admin/tasks/[id]/comments
/api/v1/admin/templates
/api/v1/admin/templates/[id]
/api/v1/admin/work-reports
/api/v1/admin/work-reports/[id]
/api/v1/crm/clients
/api/v1/crm/clients/[id]
/api/v1/crm/dashboard/summary
/api/v1/crm/follow-ups
/api/v1/crm/follow-ups/[id]/complete
/api/v1/crm/leads
/api/v1/crm/leads/[id]
/api/v1/crm/leads/[id]/assign
/api/v1/crm/leads/[id]/convert
/api/v1/crm/leads/[id]/meetings
/api/v1/crm/leads/[id]/notes
/api/v1/crm/leads/[id]/qualify
/api/v1/crm/opportunities
/api/v1/crm/opportunities/[id]
/api/v1/crm/opportunities/[id]/loss
/api/v1/crm/opportunities/[id]/stage
/api/v1/crm/opportunities/[id]/win
/api/v1/crm/proposals
/api/v1/crm/proposals/[id]/send
```

### 5.2 Executive APIs (18 Endpoints)
```
/api/v1/executive/approvals
/api/v1/executive/approvals/[id]/approve
/api/v1/executive/approvals/[id]/reject
/api/v1/executive/attendance
/api/v1/executive/audit
/api/v1/executive/company/overview
/api/v1/executive/dashboard/summary
/api/v1/executive/people
/api/v1/executive/people/[id]
/api/v1/executive/people/[id]/password-reset
/api/v1/executive/people/[id]/role
/api/v1/executive/portfolio/seed
/api/v1/executive/projects
/api/v1/executive/reports
/api/v1/executive/reports/[id]/export
/api/v1/executive/security-events
/api/v1/executive/settings
/api/v1/executive/tasks
```

### 5.3 Employee APIs (16 Endpoints)
```
/api/v1/employee/announcements
/api/v1/employee/attendance
/api/v1/employee/attendance/regularize
/api/v1/employee/calendar
/api/v1/employee/dashboard
/api/v1/employee/documents
/api/v1/employee/leave
/api/v1/employee/me
/api/v1/employee/notifications
/api/v1/employee/onboarding
/api/v1/employee/profile
/api/v1/employee/profile/password
/api/v1/employee/projects
/api/v1/employee/support
/api/v1/employee/tasks
/api/v1/employee/work-reports
```

### 5.4 Broker / Partner APIs (13 Endpoints)
```
/api/v1/broker/commissions
/api/v1/broker/commissions/payout-request
/api/v1/broker/contracts/[id]/download
/api/v1/broker/contracts/[id]/upload
/api/v1/broker/documents
/api/v1/broker/documents/[id]/read
/api/v1/broker/leads
/api/v1/broker/leads/create
/api/v1/broker/payments/[id]/submit
/api/v1/broker/profile
/api/v1/broker/projects
/api/v1/broker/projects/[id]
/api/v1/broker/referral/generate
```

### 5.5 Client APIs (13 Endpoints)
```
/api/v1/client/auth/activate
/api/v1/client/documents
/api/v1/client/invoices
/api/v1/client/me
/api/v1/client/notifications
/api/v1/client/notifications/[id]/read
/api/v1/client/projects
/api/v1/client/projects/[id]
/api/v1/client/projects/[id]/documents
/api/v1/client/projects/[id]/documents/[docId]/download
/api/v1/client/projects/[id]/uat
/api/v1/client/support
/api/v1/client/uat
```

### 5.6 General Authenticated APIs (64 Endpoints)
```
/api/v1/activity
/api/v1/activity/[entityType]/[entityId]
/api/v1/analytics/delivery
/api/v1/analytics/export
/api/v1/analytics/finance
/api/v1/analytics/overview
/api/v1/analytics/partners
/api/v1/analytics/sales
/api/v1/analytics/system
/api/v1/announcements
/api/v1/announcements/[id]
/api/v1/auth/email-change/verify
/api/v1/auth/login
/api/v1/auth/logout
/api/v1/automations
/api/v1/automations/[id]
/api/v1/automations/[id]/run
/api/v1/automations/ai-propose
/api/v1/automations/approvals
/api/v1/automations/executions
/api/v1/automations/executions/[id]/retry
/api/v1/automations/scheduler/tick
/api/v1/automations/templates
/api/v1/cron/cleanup-users
/api/v1/documents
/api/v1/documents/[id]
/api/v1/documents/[id]/archive
/api/v1/documents/[id]/download
/api/v1/documents/[id]/versions
/api/v1/jobs
/api/v1/jobs/process
/api/v1/me/notification-preferences
/api/v1/me/notifications
/api/v1/me/preferences
/api/v1/me/profile
/api/v1/me/profile/email-change/cancel
/api/v1/me/profile/email-change/request
/api/v1/notifications
/api/v1/notifications/[id]/read
/api/v1/notifications/read-all
/api/v1/notifications/unread-count
/api/v1/portal-ai/chat
/api/v1/portal-ai/config
/api/v1/preferences
/api/v1/public/business-partner/activate
/api/v1/public/business-partner/applications
/api/v1/public/business-partner/applications/verify
/api/v1/public/careers/jobs
/api/v1/public/careers/jobs/[slug]
/api/v1/public/careers/settings
/api/v1/public/careers/upload-resume
/api/v1/public/consent
/api/v1/public/content/faqs
/api/v1/public/downloads/ecommerce
/api/v1/public/leads
/api/v1/public/legal/policies
/api/v1/public/legal/policies/[slug]
/api/v1/public/login-posters
/api/v1/public/privacy-requests
/api/v1/public/project-requests
/api/v1/public/reviews
/api/v1/reminders
/api/v1/reminders/[id]
/api/v1/search
```

### 5.7 Public & Health APIs (7 Endpoints)
```
/api/careers
/api/chat
/api/chat/config
/api/chat/feedback
/api/contact
/api/health
/api/ready
```

---

## 6. Form Interfaces (72 Detected Form/Submission Modules)
```
src/app/admin/ai/knowledge/page.tsx
src/app/admin/announcements/page.tsx
src/app/admin/attendance/page.tsx
src/app/admin/calendar/page.tsx
src/app/admin/crm/brokers/page.tsx
src/app/admin/crm/clients/page.tsx
src/app/admin/crm/commissions/page.tsx
src/app/admin/crm/documents/page.tsx
src/app/admin/crm/follow-ups/page.tsx
src/app/admin/crm/leads/[id]/page.tsx
src/app/admin/crm/leads/page.tsx
src/app/admin/crm/partner-projects/[id]/page.tsx
src/app/admin/crm/pipeline/page.tsx
src/app/admin/crm/proposals/page.tsx
src/app/admin/documents/page.tsx
src/app/admin/employees/page.tsx
src/app/admin/projects/page.tsx
src/app/admin/tasks/page.tsx
src/app/broker/commissions/page.tsx
src/app/broker/projects/[id]/page.tsx
src/app/business-partner/activate/page.tsx
src/app/client/activate/page.tsx
src/app/client/documents/page.tsx
src/app/client/profile/page.tsx
src/app/client/projects/[id]/page.tsx
src/app/client/support/page.tsx
src/app/demo-projects/ecommerce/novacart/admin/page.tsx
src/app/demo-projects/ecommerce/novacart/cart/page.tsx
src/app/demo-projects/ecommerce/novacart/checkout/page.tsx
src/app/demo-projects/ecommerce/novacart/login/page.tsx
src/app/demo-projects/ecommerce/novacart/register/page.tsx
src/app/demo-projects/ecommerce/novacart/search/page.tsx
src/app/demo-projects/saas/leadpilot/activities/page.tsx
src/app/employee/attendance/page.tsx
src/app/employee/leave/page.tsx
src/app/employee/profile/page.tsx
src/app/employee/support/page.tsx
src/app/employee/tasks/page.tsx
src/app/employee/work-reports/page.tsx
src/app/lead/[referralCode]/page.tsx
src/app/login/page.tsx
src/app/privacy-requests/PrivacyRequestsClient.tsx
src/app/project/start/[referralCode]/page.tsx
src/app/reminders/page.tsx
src/components/ReviewForm.tsx
src/components/admin/sidebar/Sidebar.tsx
src/components/careers/CareerApplication.tsx
src/components/chatbot/LeadCapture.tsx
src/components/contact/ContactForm.tsx
src/components/demo-projects/corporatepro/NorthlineContact.tsx
src/components/demo-projects/edusmart/EduSmartAdmissions.tsx
src/components/demo-projects/edusmart/EduSmartContact.tsx
src/components/demo-projects/estatevista/EstateVistaHero.tsx
src/components/demo-projects/estatevista/EstateVistaPrivateTour.tsx
src/components/demo-projects/fitzone/FitZoneClassModal.tsx
src/components/demo-projects/fitzone/FitZoneTrialBooking.tsx
src/components/demo-projects/foodiehub/FoodieHubContact.tsx
src/components/demo-projects/foodiehub/FoodieHubReservation.tsx
src/components/demo-projects/leadpilot/LeadPilotModals.tsx
src/components/demo-projects/medicare/MediCareAppointment.tsx
src/components/demo-projects/medicare/MediCareContact.tsx
src/components/demo-projects/novacart/NovaCartFooter.tsx
src/components/employee/ChangePasswordForm.tsx
src/components/partner-application/PartnerApplicationForm.tsx
src/components/portal-ai/PortalAIAssistant.tsx
src/components/portal/AccountProfileSettings.tsx
src/components/portal/AdminSidebar.tsx
src/components/portal/BrokerSidebar.tsx
src/components/portal/ClientSidebar.tsx
src/components/portal/EmployeeSidebar.tsx
src/components/portal/ExecutiveSidebar.tsx
src/components/portal/PortalHeader.tsx
```

---

## 7. Key User Workflows

### 7.1 Authentication & Session Life-Cycle
1. User submits email & password on `/login`.
2. Auth endpoint validates bcrypt password hash and fetches assigned `UserRole`.
3. Server generates JWT session cookie `axivon_session` (7 days).
4. Client redirects dynamically via `resolveRoleDashboardUrl`:
   - Admin -> `/admin/dashboard`
   - Founder/Co-Founder -> `/executive/dashboard`
   - Employee -> `/employee/dashboard`
   - Broker/Business Partner -> `/broker/dashboard`
   - Client -> `/client/dashboard`

### 7.2 Employee Attendance & Working Hours Tracking
1. Employee accesses `/employee/attendance`.
2. Check-In action logs timestamp; starts daily 480-minute (8-hour) working window timer.
3. Employee can record breaks (Tea/Lunch) which subtract from gross worked time.
4. Check-Out triggers calculation of Net Worked Time vs Required Time.
5. If shortfall occurs, employee can submit a Regularization Request with justifications.
6. Admin reviews regularization on `/admin/attendance` and approves/rejects.

### 7.3 Task Assignment & Work Reporting Workflow
1. Admin or Manager creates a Task on `/admin/tasks` assigning to an Employee.
2. Employee sees task on `/employee/tasks`, updates task status (TODO -> IN_PROGRESS -> COMPLETED) and posts comments.
3. Employee submits daily Work Report on `/employee/work-reports`.
4. Admin reviews submitted daily work reports on `/admin/work-reports`.

### 7.4 Leave Request & Management Workflow
1. Employee submits leave request on `/employee/leave` (Casual, Sick, Paid, Remote).
2. Admin receives notification and views request on `/admin/leave`.
3. Admin approves or rejects with review notes.
4. Status update cascades to employee portal and triggers notification/email.

### 7.5 Business Partner / Broker Project & Commission Workflow
1. Prospect applies on `/partner-program` or `/broker-program`.
2. Admin reviews application on `/admin/business-partners/applications` and provisions partner account.
3. Partner logs into `/broker/dashboard` and submits a new client project on `/broker/projects/new`.
4. Admin reviews submitted project on `/admin/crm/partner-projects`, assigns project managers, and configures milestones/contracts.
5. Milestone payments are recorded (Bank/UPI transaction UTR verification).
6. Commission is calculated based on `CommissionRule` and credited to Broker profile for payout approval.
