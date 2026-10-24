# Axivon Technologies — Verified Test Credentials Matrix

**Updated Date:** 2026-10-24  
**Local Test Origin:** `http://localhost:3000`  
**Authentication Standard:** Stateless JWT session cookie (`axivon_session`) via `/api/v1/auth/login`  
**CAPTCHA Dev Bypass:** Cloudflare Turnstile dummy token `1x00000000000000000000AA` / Google reCAPTCHA test keys  

---

## 1. System Role Accounts

| Role Name | Canonical Role | Test Email | Password | Primary Portal URL | Creation Method | Verification Status |
|---|---|---|---|---|---|---|
| **System Administrator** | `ADMIN` | `admin@axivon.dev` | `AxivonAdmin@2024` | `/admin/dashboard` | Seed / DB | Verified (200 OK) |
| **Platform Founder** | `FOUNDER` | `founder@axivon.dev` | `AxivonFounder@2024` | `/executive/dashboard` | Seed / DB | Verified (200 OK) |
| **Tech Co-Founder** | `CO_FOUNDER` | `tech.cofounder@axivon.dev` | `AxivonCoFounder@2024` | `/executive/dashboard` | Seed / DB | Verified (200 OK) |
| **Standard Employee** | `EMPLOYEE` | `qa.employee@axivon.dev` | `AxivonEmployee@2024` | `/employee/dashboard` | Admin API (`/api/v1/admin/employees`) | Verified (200 OK) |
| **Business Partner / Broker** | `BUSINESS_PARTNER` | `qa.broker@axivon.dev` | `AxivonBroker@2024` | `/broker/dashboard` | Admin API (`/api/v1/admin/brokers`) | Verified (200 OK) |
| **Direct Client** | `CLIENT` | `qa.client@axivon.dev` | `AxivonClient@2024` | `/client/dashboard` | DB Upsert / Activation Flow | Verified (200 OK) |

---

## 2. Additional Existing Test Accounts

| Email | Role | Status | Notes |
|---|---|---|---|
| `ops.cofounder@axivon.dev` | `CO_FOUNDER` | `ACTIVE` | Operations Co-Founder |
| `vk0102103@gmail.com` | `EMPLOYEE` | `ACTIVE` | Employee account |
| `mantrakhandelwaljee@gmail.com` | `EMPLOYEE` | `ACTIVE` | Employee account |
| `bhardwajvinay400@gmail.com` | `EMPLOYEE` | `ACTIVE` | Employee account |
| `shaiksuhana2424@gmail.com` | `EMPLOYEE` | `ACTIVE` | Employee account |

---

## 3. Account Provisioning Bug Notes
1. **Client Account Provisioning:** There is no direct "Create Client" form in the Admin UI or standalone Admin API; client accounts are created indirectly during project initialization via `/api/v1/admin/partner-projects/[id]/start` with status `PENDING_ACTIVATION`, requiring activation via `/client/activate`.
2. **Broker Referral Code Generation:** Broker accounts created via `/api/v1/admin/brokers` have `referralCode: null` initially until first login or explicit generation via `/api/v1/broker/referral/generate`.
