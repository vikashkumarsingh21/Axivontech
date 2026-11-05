# AxivonTech — Complete Backend API Inventory

Generated: 2026-11-05T10:56:00.233Z
Total API Routes Discovered: **315**

### Summary by Module

| Module | Route Count |
|---|---|
| Admin | 123 |
| AI Chat / Assistant | 5 |
| Analytics | 7 |
| Auth | 8 |
| Automations | 9 |
| Broker | 31 |
| Client | 13 |
| CRM | 19 |
| Department Manager | 7 |
| Documents | 5 |
| Employee | 20 |
| Executive | 18 |
| Internal / Cron | 4 |
| Notifications | 7 |
| Other | 11 |
| Public | 21 |
| Reminders | 2 |
| User Profile / Settings | 5 |
| **Total** | **315** |

## Complete API Endpoint Directory

| Module | Endpoint | Method(s) | Purpose | Authentication | Authorized Roles | Current Status |
|---|---|---|---|---|---|---|
| Admin | `/api/v1/admin/ai/knowledge` | GET, POST | GET/POST ai knowledge | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE knowledge [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/feedback` | GET | GET knowledge feedback | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/gaps` | GET | GET knowledge gaps | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/gaps/[id]` | PATCH | PATCH gaps [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/seed` | POST | POST knowledge seed | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/settings` | GET, PUT | GET/PUT knowledge settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/ai/knowledge/upload` | POST | POST knowledge upload | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/announcements` | GET, POST | GET/POST admin announcements | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/announcements/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE announcements [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/app/settings` | GET, PATCH | GET /api/v1/admin/app/settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/attendance` | GET, POST | GET/POST admin attendance | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER, EMPLOYEE | VERIFIED |
| Admin | `/api/v1/admin/attendance/policies` | GET, PATCH | GET/PATCH attendance policies | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/attendance/regularize` | GET, POST | GET/POST attendance regularize | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/audit` | GET | GET admin audit | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/brokers` | GET, POST | GET/POST admin brokers | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Admin | `/api/v1/admin/brokers/[id]` | GET, PATCH | GET/PATCH brokers [id] | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Admin | `/api/v1/admin/brokers/[id]/actions` | POST | POST [id] actions | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Admin | `/api/v1/admin/brokers/[id]/kyc` | POST | POST [id] kyc | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Admin | `/api/v1/admin/brokers/[id]/notes` | GET, POST | GET/POST [id] notes | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Admin | `/api/v1/admin/business-partner/applications` | GET | GET business-partner applications | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/business-partner/applications/[id]` | GET, PUT | GET/PUT applications [id] | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/business-partner/applications/[id]/create-account` | POST | POST [id] create-account | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/business-partner/applications/[id]/meetings` | POST | POST [id] meetings | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/business-partner/applications/[id]/notes` | GET, POST | GET/POST [id] notes | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/business-partner/applications/check-email` | GET | GET applications check-email | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/calendar` | GET | GET admin calendar | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/calendar/holidays` | POST | POST calendar holidays | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/calendar/holidays/[id]` | PATCH, DELETE | PATCH/DELETE holidays [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/calendar/settings` | GET, PATCH | GET/PATCH calendar settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/calendar/sync` | POST | POST calendar sync | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/careers/applications` | GET | GET careers applications | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/careers/applications/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE applications [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/careers/jobs` | GET, POST | GET/POST careers jobs | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/careers/jobs/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE jobs [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/careers/settings` | GET, PATCH | GET/PATCH careers settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/careers/stats` | GET | GET careers stats | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/commission-rules` | GET, POST | GET/POST admin commission-rules | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/commission-rules/[id]` | PATCH | PATCH commission-rules [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/commissions` | GET | GET admin commissions | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/commissions/[id]` | PATCH | PATCH commissions [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/blog` | GET, POST | GET/POST content blog | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/blog/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE blog [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/faqs` | GET, POST | GET/POST content faqs | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/faqs/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE faqs [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/industries` | GET, POST | GET/POST content industries | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/industries/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE industries [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/media` | GET, POST | GET/POST content media | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/media/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE media [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/media/upload` | POST | POST media upload | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/services` | GET, POST | GET/POST content services | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/services/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE services [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/settings` | GET, PUT | GET/PUT content settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/content/summary` | GET | GET content summary | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/dashboard/summary` | GET | GET dashboard summary | Session Cookie / JWT | PARTNER, ADMIN, FOUNDER, CO_FOUNDER, BROKER, CLIENT | VERIFIED |
| Admin | `/api/v1/admin/demo-projects` | GET, POST | GET/POST admin demo-projects | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/demo-projects/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE demo-projects [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/departments` | GET, POST | GET/POST admin departments | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/departments/[id]` | GET, PATCH | GET/PATCH departments [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/departments/[id]/manager` | POST, DELETE | POST/DELETE [id] manager | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/documents` | GET, POST | GET/POST admin documents | Session Cookie / JWT | CLIENT | VERIFIED |
| Admin | `/api/v1/admin/email/settings` | GET | GET email settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/email/test` | POST | POST email test | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/employees` | GET, POST | GET/POST admin employees | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER, BROKER, PARTNER, CLIENT, EMPLOYEE | VERIFIED |
| Admin | `/api/v1/admin/employees/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE employees [id] | Session Cookie / JWT | FOUNDER, CO_FOUNDER, EMPLOYEE | VERIFIED |
| Admin | `/api/v1/admin/export/history` | GET | GET export history | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER, PARTNER | VERIFIED |
| Admin | `/api/v1/admin/export/partners` | POST | POST export partners | Session Cookie / JWT | PARTNER, ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/export/partners/preview` | POST | POST partners preview | Session Cookie / JWT | PARTNER, ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/jobs` | GET, POST | GET/POST admin jobs | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/leaves` | GET | GET admin leaves | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/leaves/[id]/approve` | POST | POST [id] approve | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/leaves/[id]/reject` | POST | POST [id] reject | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/legal/policies` | GET, POST | GET/POST legal policies | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/legal/policies/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE policies [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/legal/privacy-requests` | GET | GET legal privacy-requests | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/legal/privacy-requests/[id]` | GET, PATCH | GET/PATCH privacy-requests [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/login-posters` | GET, POST | GET/POST admin login-posters | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/login-posters/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE login-posters [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/login-posters/upload` | POST | POST login-posters upload | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/notifications` | GET, POST | GET/POST admin notifications | Session Cookie / JWT | ADMIN | VERIFIED |
| Admin | `/api/v1/admin/notifications/history` | GET | GET notifications history | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/notifications/send` | POST | POST notifications send | Session Cookie / JWT | ADMIN | VERIFIED |
| Admin | `/api/v1/admin/notifications/settings` | GET, PATCH | GET/PATCH notifications settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-contracts` | GET, POST | GET/POST admin partner-contracts | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-contracts/[id]` | GET, PATCH | GET/PATCH partner-contracts [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-documents` | GET, POST | GET/POST admin partner-documents | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-documents/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE partner-documents [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-leads` | GET | GET admin partner-leads | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/partner-payments` | GET | GET admin partner-payments | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-payments/[id]` | GET, PATCH | GET/PATCH partner-payments [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects` | GET | GET admin partner-projects | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]` | GET, PATCH | GET/PATCH partner-projects [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/approve` | POST | POST [id] approve | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/completion` | POST | POST [id] completion | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/delivery` | POST | POST [id] delivery | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/milestones` | GET, POST | GET/POST [id] milestones | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/milestones/[milestoneId]` | PATCH, DELETE | PATCH/DELETE milestones [milestoneId] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/pricing` | POST | POST [id] pricing | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/qa` | GET, POST | GET/POST [id] qa | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/qa/[qaId]` | PATCH | PATCH qa [qaId] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/report` | POST, GET | POST/GET [id] report | Session Cookie / JWT | CLIENT | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/resend-client-activation` | POST | POST [id] resend-client-activation | Session Cookie / JWT | CLIENT | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/review` | POST | POST [id] review | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/start` | POST | POST [id] start | Session Cookie / JWT | CLIENT | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/tasks` | GET, POST | GET/POST [id] tasks | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/tasks/[taskId]` | PATCH | PATCH tasks [taskId] | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/team` | GET, POST, DELETE | GET/POST/DELETE [id] team | Session Cookie / JWT | PARTNER | VERIFIED |
| Admin | `/api/v1/admin/partner-projects/[id]/technical-review` | POST | POST [id] technical-review | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/payment-settings` | GET, POST | GET/POST admin payment-settings | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/projects` | GET, POST | GET/POST admin projects | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/projects/[id]` | PATCH, DELETE | PATCH/DELETE projects [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/reviews` | GET | GET admin reviews | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/reviews/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE reviews [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/security/captcha-status` | GET | GET security captcha-status | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/support/brokers` | GET | GET support brokers | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/support/brokers/[ticketId]` | GET, POST | GET/POST brokers [ticketId] | Session Cookie / JWT | ADMIN, BROKER | VERIFIED |
| Admin | `/api/v1/admin/tasks` | GET, POST | GET/POST admin tasks | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/tasks/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE tasks [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/tasks/[id]/comments` | POST | POST [id] comments | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/templates` | GET, POST | GET/POST admin templates | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/templates/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE templates [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/work-reports` | GET | GET admin work-reports | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Admin | `/api/v1/admin/work-reports/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE work-reports [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| AI Chat / Assistant | `/api/chat` | POST | POST api chat | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| AI Chat / Assistant | `/api/chat/config` | GET | GET chat config | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| AI Chat / Assistant | `/api/chat/feedback` | POST | POST chat feedback | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| AI Chat / Assistant | `/api/v1/portal-ai/chat` | POST | POST portal-ai chat | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| AI Chat / Assistant | `/api/v1/portal-ai/config` | GET | GET portal-ai config | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN, EMPLOYEE, CLIENT, BROKER, PARTNER | VERIFIED |
| Analytics | `/api/v1/analytics/delivery` | GET | GET analytics delivery | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Analytics | `/api/v1/analytics/export` | GET | GET analytics export | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Analytics | `/api/v1/analytics/finance` | GET | GET analytics finance | Session Cookie / JWT | FOUNDER, CO_FOUNDER | VERIFIED |
| Analytics | `/api/v1/analytics/overview` | GET | GET analytics overview | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Analytics | `/api/v1/analytics/partners` | GET | GET analytics partners | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Analytics | `/api/v1/analytics/sales` | GET | GET analytics sales | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Analytics | `/api/v1/analytics/system` | GET | GET analytics system | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Auth | `/api/v1/auth/change-password` | POST | POST auth change-password | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Auth | `/api/v1/auth/email-change/verify` | POST, GET | POST/GET email-change verify | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Auth | `/api/v1/auth/forgot-password` | POST | Initiates an account password reset request. | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Auth | `/api/v1/auth/login` | POST | POST auth login | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Auth | `/api/v1/auth/logout` | POST, GET | POST/GET auth logout | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Auth | `/api/v1/auth/reset-password` | POST | Resets an account password using a validated single-use reset token. | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Auth | `/api/v1/auth/reset-password/validate` | GET | Validates a password reset token without consuming it. | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Auth | `/api/v1/auth/session` | GET | GET /api/v1/auth/session | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Automations | `/api/v1/automations` | GET, POST | GET/POST v1 automations | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Automations | `/api/v1/automations/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE automations [id] | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Automations | `/api/v1/automations/[id]/run` | POST | POST [id] run | Session Cookie / JWT | ADMIN | VERIFIED |
| Automations | `/api/v1/automations/ai-propose` | POST | POST automations ai-propose | Session Cookie / JWT | ADMIN | VERIFIED |
| Automations | `/api/v1/automations/approvals` | GET, POST | GET/POST automations approvals | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Automations | `/api/v1/automations/executions` | GET | GET automations executions | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Automations | `/api/v1/automations/executions/[id]/retry` | POST | POST [id] retry | Session Cookie / JWT | ADMIN | VERIFIED |
| Automations | `/api/v1/automations/scheduler/tick` | POST | POST scheduler tick | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Automations | `/api/v1/automations/templates` | GET, POST | GET/POST automations templates | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Broker | `/api/v1/broker/activity` | GET | GET broker activity | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/analytics/earnings` | GET | GET analytics earnings | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/commissions` | GET | GET broker commissions | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/commissions/[id]` | GET | GET commissions [id] | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/commissions/estimate` | POST | POST commissions estimate | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/commissions/export` | GET | GET commissions export | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/commissions/payout-request` | POST | POST commissions payout-request | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/contracts` | GET | GET broker contracts | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/contracts/[id]/download` | GET, POST | GET/POST [id] download | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/contracts/[id]/upload` | POST | POST [id] upload | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/dashboard` | GET | GET broker dashboard | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/documents` | GET | GET broker documents | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/documents/[id]/read` | POST | POST [id] read | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/drafts` | GET, POST, DELETE | GET/POST/DELETE broker drafts | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/leads` | GET | GET broker leads | Session Cookie / JWT | PARTNER | VERIFIED |
| Broker | `/api/v1/broker/leads/create` | POST | POST leads create | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Broker | `/api/v1/broker/leads/register` | UNKNOWN |  leads register | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/leads/upload` | POST | POST leads upload | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/payments` | GET | GET broker payments | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/payments/[id]` | GET | GET payments [id] | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/payments/[id]/submit` | POST | POST [id] submit | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/profile` | GET, PATCH | GET/PATCH broker profile | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/profile/avatar` | POST | POST profile avatar | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/profile/password` | POST | POST profile password | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/profile/terms` | POST | POST profile terms | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/projects` | GET, POST | GET/POST broker projects | Session Cookie / JWT | PARTNER, BROKER | VERIFIED |
| Broker | `/api/v1/broker/projects/[id]` | GET, PATCH | GET/PATCH projects [id] | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/projects/new` | GET | GET projects new | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/referral/generate` | POST | POST referral generate | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/support` | GET, POST | GET/POST broker support | Session Cookie / JWT | BROKER | VERIFIED |
| Broker | `/api/v1/broker/support/[id]` | GET, POST | GET/POST support [id] | Session Cookie / JWT | BROKER | VERIFIED |
| Client | `/api/v1/client/auth/activate` | POST | POST auth activate | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/documents` | GET | GET client documents | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/invoices` | GET | GET client invoices | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/me` | GET, PATCH | GET/PATCH client me | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/notifications` | GET | GET client notifications | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/notifications/[id]/read` | PATCH | PATCH [id] read | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/projects` | GET | GET client projects | Session Cookie / JWT | CLIENT, ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Client | `/api/v1/client/projects/[id]` | GET | GET projects [id] | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/projects/[id]/documents` | GET | GET [id] documents | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/projects/[id]/documents/[docId]/download` | GET | GET [docId] download | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/projects/[id]/uat` | POST | POST [id] uat | Session Cookie / JWT | CLIENT | VERIFIED |
| Client | `/api/v1/client/support` | GET, POST | GET/POST client support | Session Cookie / JWT | CLIENT, ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Client | `/api/v1/client/uat` | GET | GET client uat | Session Cookie / JWT | CLIENT | VERIFIED |
| CRM | `/api/v1/crm/clients` | GET, POST | GET/POST crm clients | Session Cookie / JWT | CLIENT | VERIFIED |
| CRM | `/api/v1/crm/clients/[id]` | GET, PATCH | GET/PATCH clients [id] | Session Cookie / JWT | CLIENT | VERIFIED |
| CRM | `/api/v1/crm/dashboard/summary` | GET | GET dashboard summary | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/follow-ups` | GET, POST | GET/POST crm follow-ups | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/follow-ups/[id]/complete` | POST | POST [id] complete | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/leads` | GET, POST, DELETE | GET/POST/DELETE crm leads | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/leads/[id]` | GET, PATCH, DELETE | GET/PATCH/DELETE leads [id] | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/leads/[id]/assign` | POST | POST [id] assign | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/leads/[id]/convert` | POST | POST [id] convert | Session Cookie / JWT | PARTNER, CLIENT | VERIFIED |
| CRM | `/api/v1/crm/leads/[id]/meetings` | POST, GET | POST/GET [id] meetings | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/leads/[id]/notes` | POST, GET | POST/GET [id] notes | Session Cookie / JWT | PARTNER | VERIFIED |
| CRM | `/api/v1/crm/leads/[id]/qualify` | POST | POST [id] qualify | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/opportunities` | GET, POST | GET/POST crm opportunities | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/opportunities/[id]` | GET, PATCH | GET/PATCH opportunities [id] | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/opportunities/[id]/loss` | POST | POST [id] loss | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/opportunities/[id]/stage` | POST | POST [id] stage | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/opportunities/[id]/win` | POST | POST [id] win | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/proposals` | GET, POST | GET/POST crm proposals | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| CRM | `/api/v1/crm/proposals/[id]/send` | POST | POST [id] send | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Department Manager | `/api/v1/manager/attendance` | GET | GET manager attendance | Session Cookie / JWT | DEPARTMENT_MANAGER, ADMIN | VERIFIED |
| Department Manager | `/api/v1/manager/dashboard` | GET | GET manager dashboard | Session Cookie / JWT | DEPARTMENT_MANAGER, ADMIN | VERIFIED |
| Department Manager | `/api/v1/manager/employees` | GET | GET manager employees | Session Cookie / JWT | DEPARTMENT_MANAGER, ADMIN | VERIFIED |
| Department Manager | `/api/v1/manager/leave` | GET, PATCH | GET/PATCH manager leave | Session Cookie / JWT | MANAGER | VERIFIED |
| Department Manager | `/api/v1/manager/notifications/send` | POST | POST notifications send | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER, DEPARTMENT_MANAGER, MANAGER | VERIFIED |
| Department Manager | `/api/v1/manager/tasks` | GET, POST | GET/POST manager tasks | Session Cookie / JWT | MANAGER | VERIFIED |
| Department Manager | `/api/v1/manager/work-reports` | GET | GET manager work-reports | Session Cookie / JWT | DEPARTMENT_MANAGER, ADMIN | VERIFIED |
| Documents | `/api/v1/documents` | GET | GET v1 documents | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Documents | `/api/v1/documents/[id]` | GET, PATCH | GET/PATCH documents [id] | Session Cookie / JWT | CLIENT, ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Documents | `/api/v1/documents/[id]/archive` | POST | POST [id] archive | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Documents | `/api/v1/documents/[id]/download` | GET | GET [id] download | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Documents | `/api/v1/documents/[id]/versions` | GET, POST | GET/POST [id] versions | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Employee | `/api/v1/employee/announcements` | GET, POST | GET/POST employee announcements | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/announcements/read` | POST | POST announcements read | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/attendance` | GET, POST | GET/POST employee attendance | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/attendance/regularize` | GET, POST, PATCH | GET/POST/PATCH attendance regularize | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Employee | `/api/v1/employee/calendar` | GET | GET employee calendar | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/dashboard` | GET | GET employee dashboard | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/documents` | GET, POST | GET/POST employee documents | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/documents/acknowledge` | POST | POST documents acknowledge | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/leave` | GET, POST, PATCH | GET/POST/PATCH employee leave | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/me` | GET | GET employee me | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/notifications` | GET, PATCH, DELETE | GET/PATCH/DELETE employee notifications | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/onboarding` | GET | GET employee onboarding | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/profile` | GET, PATCH | GET/PATCH employee profile | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/profile/password` | POST | POST profile password | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/projects` | GET | GET employee projects | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/settings` | GET, PATCH | GET/PATCH employee settings | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/support` | GET, POST, PATCH | GET/POST/PATCH employee support | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/support/reply` | POST | POST support reply | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/tasks` | GET, PATCH, POST | GET/PATCH/POST employee tasks | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Employee | `/api/v1/employee/work-reports` | GET, POST | GET/POST employee work-reports | Session Cookie / JWT | EMPLOYEE | VERIFIED |
| Executive | `/api/v1/executive/approvals` | GET | GET executive approvals | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/approvals/[id]/approve` | POST | POST [id] approve | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/approvals/[id]/reject` | POST | POST [id] reject | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/attendance` | GET | GET executive attendance | Session Cookie / JWT | FOUNDER, CO_FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/audit` | GET | GET executive audit | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/company/overview` | GET | GET company overview | Session Cookie / JWT | FOUNDER, CO_FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/dashboard/summary` | GET | GET dashboard summary | Session Cookie / JWT | FOUNDER, CO_FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/people` | GET | GET executive people | Session Cookie / JWT | FOUNDER, CO_FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/people/[id]` | GET, PATCH | GET/PATCH people [id] | Session Cookie / JWT | FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/people/[id]/password-reset` | POST | POST [id] password-reset | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/people/[id]/role` | PATCH | PATCH [id] role | Session Cookie / JWT | EMPLOYEE, ADMIN, CO_FOUNDER, FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/portfolio/seed` | POST | POST portfolio seed | Session Cookie / JWT | FOUNDER | VERIFIED |
| Executive | `/api/v1/executive/projects` | GET | GET executive projects | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/reports` | GET | GET executive reports | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/reports/[id]/export` | POST | POST [id] export | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/security-events` | GET | GET executive security-events | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/settings` | GET, PATCH | GET/PATCH executive settings | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Executive | `/api/v1/executive/tasks` | GET, POST | GET/POST executive tasks | Session Cookie / JWT | FOUNDER, CO_FOUNDER, ADMIN | VERIFIED |
| Internal / Cron | `/api/internal/cron/process-due-jobs` | POST, GET | Axivon Technologies — Secure External Scheduler Endpoint | Bearer CRON_SECRET | CRON_SYSTEM | VERIFIED |
| Internal / Cron | `/api/v1/cron/cleanup-users` | GET | GET cron cleanup-users | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Internal / Cron | `/api/v1/cron/close-attendance` | GET, POST | Scheduled Cron / Automation Endpoint: /api/v1/cron/close-attendance | Bearer CRON_SECRET | CRON_SYSTEM | VERIFIED |
| Internal / Cron | `/api/v1/cron/reminders` | GET, POST | Axivon Technologies — Central Automated Reminder Engine Cron Endpoint | Bearer CRON_SECRET | CRON_SYSTEM | VERIFIED |
| Notifications | `/api/v1/me/notification-preferences` | GET, PATCH | GET/PATCH me notification-preferences | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Notifications | `/api/v1/me/notifications` | GET | GET me notifications | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Notifications | `/api/v1/notifications` | GET | GET v1 notifications | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Notifications | `/api/v1/notifications/[id]/read` | POST, PATCH | POST/PATCH [id] read | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Notifications | `/api/v1/notifications/device-token` | POST, DELETE | POST/DELETE notifications device-token | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Notifications | `/api/v1/notifications/read-all` | POST | POST notifications read-all | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Notifications | `/api/v1/notifications/unread-count` | GET | GET notifications unread-count | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/dev/auth-broker` | GET | GET dev auth-broker | Session Cookie / JWT | PARTNER | VERIFIED |
| Other | `/api/health` | GET | GET api health | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/ready` | GET | GET api ready | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/activity` | GET | GET v1 activity | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/activity/[entityType]/[entityId]` | GET | GET [entityType] [entityId] | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/announcements` | GET | GET v1 announcements | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/announcements/[id]` | GET | GET announcements [id] | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Other | `/api/v1/app/version` | GET | GET app version | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/jobs` | GET, POST | GET/POST v1 jobs | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/jobs/process` | POST, GET | POST/GET jobs process | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Other | `/api/v1/search` | GET | GET v1 search | Session Cookie / JWT | ADMIN, FOUNDER, CO_FOUNDER | VERIFIED |
| Public | `/api/careers` | POST | POST api careers | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/contact` | POST | POST api contact | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/business-partner/activate` | POST | POST business-partner activate | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/business-partner/applications` | POST, GET | POST/GET business-partner applications | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/business-partner/applications/status` | POST | POST applications status | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/business-partner/applications/verify` | GET | GET applications verify | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/careers/jobs` | GET | GET careers jobs | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/careers/jobs/[slug]` | GET | GET jobs [slug] | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/careers/settings` | GET | GET careers settings | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/careers/upload-resume` | POST | POST careers upload-resume | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/consent` | POST | POST public consent | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/content/faqs` | GET | GET content faqs | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/downloads/ecommerce` | GET | GET downloads ecommerce | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/leads` | POST | POST public leads | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/legal/policies` | GET | GET legal policies | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/legal/policies/[slug]` | GET | GET policies [slug] | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/login-posters` | GET | GET public login-posters | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/privacy-requests` | POST, GET | POST/GET public privacy-requests | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/project-requests` | POST | POST public project-requests | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/referral/validate` | GET | GET referral validate | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Public | `/api/v1/public/reviews` | GET, POST | GET/POST public reviews | Public (Anti-bot / Rate-limited) | PUBLIC | VERIFIED |
| Reminders | `/api/v1/reminders` | GET, POST | GET/POST v1 reminders | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| Reminders | `/api/v1/reminders/[id]` | PATCH, DELETE | PATCH/DELETE reminders [id] | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| User Profile / Settings | `/api/v1/me/preferences` | GET, PATCH | GET/PATCH me preferences | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| User Profile / Settings | `/api/v1/me/profile` | GET, PATCH | GET/PATCH me profile | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| User Profile / Settings | `/api/v1/me/profile/email-change/cancel` | POST | POST email-change cancel | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| User Profile / Settings | `/api/v1/me/profile/email-change/request` | POST | POST email-change request | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
| User Profile / Settings | `/api/v1/preferences` | GET, PATCH | GET/PATCH v1 preferences | Session Cookie / JWT | AUTHENTICATED_USER | VERIFIED |
