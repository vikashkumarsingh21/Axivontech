# AXIVON ONE — FEATURE FUNCTIONALITY AUDIT

**Document ID:** `AXIVON-AUDIT-FEATURES-2026-10`  
**Platform Version:** AXIVON ONE v0.1.0 (`axivontech.in`)  
**Audit Executed:** October 22, 2026  
**Auditing Entity:** Senior Technical Architecture & Quality Assurance Audit Team  

---

## 1. Feature Classification Standard

Features are evaluated against the complete functional chain:
$$\text{UI Layer} \longrightarrow \text{User Interaction} \longrightarrow \text{Validation} \longrightarrow \text{API / Action} \longrightarrow \text{Authorization} \longrightarrow \text{Database Persistence} \longrightarrow \text{Response} \longrightarrow \text{UI Feedback}$$

Status Classifications:
* **VERIFIED WORKING:** Full end-to-end chain tested and verified passing with actual tests.
* **PARTIALLY WORKING:** Core behavior operates, but edge conditions, subsidiary workflows, or secondary integrations are incomplete.
* **BROKEN:** Reproducible defect prevents expected behavior.
* **UI ONLY / NOT FULLY INTEGRATED:** UI components exist, but backend API or database persistence is absent or mocked.
* **NOT IMPLEMENTED:** Planned capability not present in the current codebase.
* **BLOCKED:** Verification could not proceed due to missing production credentials or inaccessible external services.
* **NOT TESTED:** Feature exists but was not exercised by automated or manual test runs.

---

## 2. Public-Facing Digital Presence

### 2.1 Public Homepage & Navigation
* **Portal:** Public Website
* **Route / Page:** `/` ([`src/app/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/page.tsx))
* **Main Components:** `Navbar`, `Hero`, `Services`, `Process`, `Portfolio`, `IndustriesWeServe`, `WhyChooseUs`, `ClientReviews`, `CTA`, `Footer`, `ChatWidget`
* **Related APIs:** `/api/v1/public/content/faqs`, `/api/v1/public/reviews`, `/api/chat`
* **Related DB Models:** `WebsiteSetting`, `WebsiteService`, `WebsiteFaq`, `ClientReview`, `Organization`
* **Auth / Roles:** Public Visitor (Unauthenticated)
* **Expected Behavior:** Renders brand narrative, service overview, client testimonials, SEO schema tags, and floating chat assistant.
* **Actual Observed Behavior:** Page compiles cleanly (Turbopack SSG), renders reactive components, loads dynamic reviews, and handles responsive breakpoints.
* **Tests Executed:** `tests/website-reliability-step1.test.ts`, `tests/seo-analytics-step5.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 2.2 Contact & Inquiry Submission Form
* **Portal:** Public Website
* **Route / Page:** `/contact` ([`src/app/contact/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/contact/page.tsx))
* **Main Components:** `ContactForm`, `GoogleRecaptchaWidget`
* **Related APIs:** `/api/contact` ([`src/app/api/contact/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/contact/route.ts))
* **Related DB Models:** `Lead`, `EmailLog`
* **Auth / Roles:** Public Visitor
* **Expected Behavior:** Submits visitor name, email, phone, message, verifies CAPTCHA token, creates CRM `Lead` with `brokerProfileId: null`, logs email dispatch.
* **Actual Observed Behavior:** Server-side Zod validation verifies email/phone formats, rejects empty payloads (HTTP 400), creates `Lead` in database, handles email transport errors gracefully without dropping the lead.
* **Tests Executed:** `tests/contact-form-submission.test.ts`, `tests/website-reliability-step1.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 2.3 Business Partner Application
* **Portal:** Public Website / Business Partner Hub
* **Route / Page:** `/business-partner/apply` ([`src/app/business-partner/apply/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/business-partner/apply/page.tsx))
* **Main Components:** `PartnerApplicationForm`
* **Related APIs:** `/api/v1/public/business-partner/applications`
* **Related DB Models:** `BusinessPartnerApplication`, `ApplicationStatusHistory`
* **Auth / Roles:** Public Visitor
* **Expected Behavior:** Accepts candidate application, company information, business experience, validates CAPTCHA, creates application with `PENDING` status.
* **Actual Observed Behavior:** Form submits cleanly, persists record with hashed verification token, transitions to confirmation screen.
* **Tests Executed:** `tests/phase3-platform-integration-audit.test.ts`, `tests/universal-form-protection.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 2.4 Broker Referral Landing & Lead Capture
* **Portal:** Public Website
* **Route / Page:** `/lead/[referralCode]` ([`src/app/lead/[referralCode]/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/lead/[referralCode]/page.tsx)) & `/project/start/[referralCode]`
* **Main Components:** `LeadCaptureForm`, `ProjectInquiryForm`
* **Related APIs:** `/api/v1/public/leads`, `/api/v1/public/project-requests`
* **Related DB Models:** `Lead`, `BrokerProfile`, `User`
* **Auth / Roles:** Public Visitor
* **Expected Behavior:** Validates `referralCode` against active brokers, attributes created `Lead` to `brokerProfile.id`, prevents direct client contamination.
* **Actual Observed Behavior:** Correctly extracts `referralCode`, attaches broker attribution to `Lead.brokerProfileId`, rejects invalid or inactive referral codes.
* **Tests Executed:** `tests/phase4-broker-direct-financial-safeguards.test.ts`, `tests/lead-generation-step2.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 2.5 Careers & Recruitment Gating
* **Portal:** Public Website
* **Route / Page:** `/careers` & `/careers/[slug]`
* **Main Components:** `CareerApplication`, `JobPostingList`
* **Related APIs:** `/api/careers`, `/api/v1/public/careers/jobs`
* **Related DB Models:** `JobPosting`, `CareerApplication`, `CareersPageSetting`
* **Auth / Roles:** Public Visitor
* **Expected Behavior:** Shows active job openings; allows resume upload; respects database recruitment toggle (`isCareersPageEnabled()`). When recruitment is disabled, application submissions are rejected with HTTP 403.
* **Actual Observed Behavior:** Verified that disabling recruitment via `CareersPageSetting` strictly blocks submissions with HTTP 403. File upload rejects non-PDF/DOCX formats.
* **Tests Executed:** `tests/careers.test.ts` (13 tests)
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

---

## 3. Organization Administration Portal (`/admin`)

### 3.1 Workforce Attendance Live Monitor & History
* **Portal:** Admin Portal
* **Route / Page:** `/admin/attendance` ([`src/app/admin/attendance/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/admin/attendance/page.tsx))
* **Main Components:** `AttendanceLiveMonitor`, `CompanyAttendanceHistory`, `AttendancePolicyModal`
* **Related APIs:** `/api/v1/admin/attendance`, `/api/v1/admin/attendance/policies`
* **Related DB Models:** `Attendance`, `AttendanceBreak`, `AttendancePolicy`, `User`, `LeaveRequest`
* **Auth / Roles:** `ADMIN`, `FOUNDER`, `CO_FOUNDER`
* **Expected Behavior:** Displays live working headcount, employees on break, completed shifts, and multi-day company attendance history.
* **Actual Observed Behavior:** Computes real-time working statuses, handles unclosed historical sessions (>24h), maps approved leave requests, and allows policy adjustments.
* **Tests Executed:** `tests/attendance-complete-system.test.ts` (24 tests)
* **Test Result:** **PASS** (Resolved time-drift test fixture via timer virtualization)
* **Status:** **VERIFIED WORKING**

### 3.2 CRM Lead Conversion & Project Creation
* **Portal:** Admin Portal
* **Route / Page:** `/admin/crm/leads/[id]`
* **Main Components:** `LeadDetailCard`, `ConvertLeadModal`
* **Related APIs:** `/api/v1/crm/leads/[id]/convert`
* **Related DB Models:** `Lead`, `PartnerProject`, `User`, `CrmClient`
* **Auth / Roles:** `ADMIN`, `CRM_MANAGER`
* **Expected Behavior:** Converts qualified lead into CRM client and `PartnerProject`. If the lead originated from a direct public inquiry, `brokerProfileId` is strictly set to `null`.
* **Actual Observed Behavior:** Creates `PartnerProject` with unique `projectCode`, creates client user account with `activationToken`, sets broker attribution strictly according to lead source.
* **Tests Executed:** `tests/phase4-broker-direct-financial-safeguards.test.ts`, `tests/admin-crm-audit.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 3.3 Dynamic Commission Rule Engine
* **Portal:** Admin Portal
* **Route / Page:** `/admin/crm/commissions` ([`src/app/admin/crm/commissions/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/admin/crm/commissions/page.tsx))
* **Main Components:** `CommissionRuleManager`, `CommissionLedgerTable`
* **Related APIs:** `/api/v1/admin/commissions`, `/api/v1/admin/commission-rules`
* **Related DB Models:** `CommissionRule`, `Commission`, `BrokerProfile`
* **Auth / Roles:** `ADMIN`, `FINANCE`
* **Expected Behavior:** Allows configuration of tiered commission rules (Fixed INR or Percentage). Evaluates active rule dynamically upon project payment.
* **Actual Observed Behavior:** Calculates accurate commission based on project deal value and active rule, ignoring disabled rules.
* **Tests Executed:** `tests/phase4-broker-direct-financial-safeguards.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 3.4 Commission Settlement & Bank UTR Safeguard
* **Portal:** Admin Portal
* **Route / Page:** `/admin/crm/commissions`
* **Main Components:** `SettlementModal`, `UtrVerificationInput`
* **Related APIs:** `/api/v1/admin/commissions/[id]` ([`src/app/api/v1/admin/commissions/[id]/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/admin/commissions/[id]/route.ts))
* **Related DB Models:** `Commission`
* **Auth / Roles:** `ADMIN`, `FINANCE`
* **Expected Behavior:** Marks commission as `PAID` only when a valid, non-empty, unique Bank Transaction Reference (UTR) is provided. Rejects duplicate UTR numbers across settled records.
* **Actual Observed Behavior:** Enforces UTR non-empty check; queries existing `PAID` commissions for matching `payoutReference`; throws HTTP 400 on duplicate UTR.
* **Tests Executed:** `tests/phase4-broker-direct-financial-safeguards.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

---

## 4. Employee Workspace Portal (`/employee`)

### 4.1 Attendance Punch Clock & Breaks
* **Portal:** Employee Portal
* **Route / Page:** `/employee/attendance` ([`src/app/employee/attendance/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/employee/attendance/page.tsx))
* **Main Components:** `PunchClockWidget`, `BreakControlWidget`, `DailyProgressRing`
* **Related APIs:** `/api/v1/employee/attendance` ([`src/app/api/v1/employee/attendance/route.ts`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/api/v1/employee/attendance/route.ts))
* **Related DB Models:** `Attendance`, `AttendanceBreak`, `User`
* **Auth / Roles:** `EMPLOYEE`
* **Expected Behavior:** Allows punch-in once per day; start/end multiple breaks; check-out; computes net minutes vs employee-specific target (`requiredDailyMinutes`). Supports cross-midnight check-outs.
* **Actual Observed Behavior:** Rejects duplicate check-in (HTTP 400); prevents check-out without check-in (HTTP 400); accurately deducts breaks; allows night-shift check-out when check-in occurred the previous evening.
* **Tests Executed:** `tests/attendance-complete-system.test.ts`, `tests/employee-portal.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 4.2 Task Management & Work Reporting
* **Portal:** Employee Portal
* **Route / Page:** `/employee/tasks` & `/employee/work-reports`
* **Main Components:** `TaskKanbanBoard`, `DailyReportForm`
* **Related APIs:** `/api/v1/employee/tasks`, `/api/v1/employee/work-reports`
* **Related DB Models:** `Task`, `WorkReport`, `User`
* **Auth / Roles:** `EMPLOYEE`
* **Expected Behavior:** Employees view assigned tasks, update task progress, and submit daily work reports linked to their user account.
* **Actual Observed Behavior:** Task status transitions persist correctly; daily reports require summary and work items; employees cannot view other employees' tasks.
* **Tests Executed:** `tests/employee-portal-complete-e2e.test.ts`, `tests/task-assignment-notification.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

---

## 5. Broker / Business Partner Portal (`/broker`)

### 5.1 Broker Dashboard & Commission Ledger
* **Portal:** Broker Portal
* **Route / Page:** `/broker/dashboard` & `/broker/commissions`
* **Main Components:** `BrokerStatsOverview`, `CommissionTable`, `RequestPayoutModal`
* **Related APIs:** `/api/v1/broker/commissions`, `/api/v1/broker/commissions/payout-request`
* **Related DB Models:** `Commission`, `BrokerProfile`, `Notification`
* **Auth / Roles:** `BROKER`, `BUSINESS_PARTNER`
* **Expected Behavior:** Broker views referred projects, earned commissions, and submits payout requests. Payout requests calculate 48-hour SLA due date and dispatch notifications to Admin/Finance.
* **Actual Observed Behavior:** Validates broker bank IFSC code format; persists `payoutRequestedAt` and `payoutDueAt` (+48 hours); strictly blocks Broker A from requesting payouts on Broker B's commissions (HTTP 403).
* **Tests Executed:** `tests/phase4-broker-direct-financial-safeguards.test.ts`, `tests/phase3-platform-integration-audit.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

---

## 6. Client Experience Portal (`/client`)

### 6.1 Client Activation & Security
* **Portal:** Client Portal
* **Route / Page:** `/client/activate` ([`src/app/client/activate/page.tsx`](file:///c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies/src/app/client/activate/page.tsx))
* **Main Components:** `AccountActivationForm`, `PasswordCreationInput`
* **Related APIs:** Server Action / Prisma
* **Related DB Models:** `User`, `Session`
* **Auth / Roles:** Public Visitor with valid single-use `activationToken`
* **Expected Behavior:** Client enters password to activate account. Token is wiped immediately upon use; previous active sessions are purged.
* **Actual Observed Behavior:** Rejects expired or reused tokens; updates `passwordHash`; sets `mustChangePassword: false`; clears `activationToken`.
* **Tests Executed:** `tests/phase3-platform-integration-audit.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

### 6.2 Project Delivery & Document Vault IDOR Protection
* **Portal:** Client Portal
* **Route / Page:** `/client/projects/[id]` & `/client/documents`
* **Main Components:** `MilestoneTracker`, `DocumentVault`, `UatApprovalGate`
* **Related APIs:** `/api/v1/client/projects/[id]/documents/[docId]/download`
* **Related DB Models:** `PartnerProject`, `PartnerDocument`, `User`
* **Auth / Roles:** `CLIENT` (Assigned to project)
* **Expected Behavior:** Client can only view and download documents for their assigned project. Delivery reports cannot be downloaded until QA status is `UAT_APPROVED`.
* **Actual Observed Behavior:** Cross-client download attempts return HTTP 404/403; unapproved delivery reports cannot be accessed.
* **Tests Executed:** `tests/idor-security.test.ts`, `tests/phase3-platform-integration-audit.test.ts`
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**

---

## 7. Executive Portal (`/executive`)

### 7.1 Executive Cockpit & Approvals
* **Portal:** Executive Portal
* **Route / Page:** `/executive/dashboard` & `/executive/approvals`
* **Main Components:** `ExecutiveKpiGrid`, `PendingApprovalsList`
* **Related APIs:** `/api/v1/executive/dashboard/summary`, `/api/v1/executive/approvals`
* **Related DB Models:** `ApprovalRequest`, `UserRole`, `Role`
* **Auth / Roles:** `FOUNDER`, `CO_FOUNDER`
* **Expected Behavior:** Top-level executive oversight of finances, headcount, projects, and pending organizational approvals.
* **Actual Observed Behavior:** Accessible only to `FOUNDER` and `CO_FOUNDER` roles; non-executive roles receive HTTP 403.
* **Tests Executed:** `tests/executive-portal.test.ts` (7 tests)
* **Test Result:** **PASS**
* **Status:** **VERIFIED WORKING**
