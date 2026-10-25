# Broker & Admin Integration Flow

This document maps the end-to-end integration flows across the **Broker / Business Partner Portal**, the **Admin CRM Portal**, and the **Client Portal** in Axivon Technologies.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Public Portals
        A1[Business Partner Application /business-partner/apply]
        A2[Application Status Check /public/.../status]
        A3[Partner Activation /business-partner/activate]
        A4[Lead Referral /lead/referralCode]
        A5[Project Start /project/start/referralCode]
        A6[Client Activation /client/activate]
    end

    subgraph Broker Portal /broker
        B1[Broker Dashboard]
        B2[Broker Profile & KYC]
        B3[Referred Leads]
        B4[Projects & Timeline]
        B5[Contracts & Signed Upload]
        B6[Payments & UTR Submit]
        B7[Commissions & Payout Requests]
        B8[Support Desk]
    end

    subgraph Admin CRM Portal /admin
        C1[Partner Applications Review & Notes]
        C2[Brokers Management & Dossier]
        C3[KYC Review & Commission Override]
        C4[Leads Pipeline]
        C5[Partner Projects & Client Provisioning]
        C6[Partner Contracts Dispatch & Approval]
        C7[Payment Verification]
        C8[Commission Settlement & UTR Recording]
        C9[Partner Support Desk]
    end

    subgraph Database & Job Queue
        DB[(PostgreSQL Neon)]
        JQ[JobRunner / SEND_EMAIL]
        AL[AuditLog Trail]
        NOTIF[In-App Notifications]
    end

    A1 -->|Submit Application| C1
    A2 -->|Inquire Status| DB
    C1 -->|Create Account| JQ
    JQ -->|Activation Link| A3
    A3 -->|Activate Credentials| B1
    B2 -->|Submit PAN & Bank| C3
    C3 -->|Verify KYC| B2
    A4 -->|Referral Intake| C4
    C4 -->|Attributed Lead| B3
    A5 -->|Project Onboarding| C5
    C5 -->|Provision Account| JQ
    JQ -->|Client Token| A6
    C6 -->|Send Contract PDF| B5
    B5 -->|Upload Signed PDF| C6
    C7 -->|Verify Advance Payment| DB
    DB -->|Activate Commission| B7
    B7 -->|Request Payout| C8
    C8 -->|Disburse with UTR| B7
    B8 <-->|Ticket Thread & Replies| C9
```

---

## 2. Step-by-Step Sequence Flows

### Flow 1: Partner Application, Internal Notes & Status Inquiry

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Partner Applicant
    participant PublicAPI as Public API
    participant DB as Neon PostgreSQL
    actor Admin as Admin Staff
    participant AdminUI as Admin Applications UI

    Applicant->>PublicAPI: POST /api/v1/business-partner/apply
    PublicAPI->>DB: Create BusinessPartnerApplication (status: SUBMITTED)
    PublicAPI-->>Applicant: 201 Created { applicationId: "BPA-..." }

    Applicant->>PublicAPI: POST /api/v1/public/business-partner/applications/status
    Note over Applicant,PublicAPI: Safe projection (no internal notes or staff identities)
    PublicAPI->>DB: Query by applicationId & email
    PublicAPI-->>Applicant: 200 OK { status: "SUBMITTED", meetings: [] }

    Admin->>AdminUI: View /admin/business-partners/applications/[id]
    AdminUI->>DB: Fetch application details
    Admin->>AdminUI: Add internal confidential note
    AdminUI->>DB: POST .../notes (OrganizationSetting: bpa_notes:[id])
    Admin->>AdminUI: Update status: UNDER_REVIEW / MEETING_SCHEDULED / APPROVED
    AdminUI->>DB: Update application & create ApplicationStatusHistory
```

---

### Flow 2: Account Creation, Activation & Suspension Gate

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant AdminAPI as Admin API
    participant DB as Neon PostgreSQL
    participant Email as JobRunner (Email)
    actor Partner as Business Partner
    participant Portal as Broker Portal (/broker/*)

    Admin->>AdminAPI: POST /api/v1/admin/business-partner/applications/[id]/create-account
    AdminAPI->>DB: Create User (PENDING_ACTIVATION), BrokerProfile, Role BUSINESS_PARTNER
    AdminAPI->>Email: Enqueue PARTNER_ACCOUNT_ACTIVATION with token
    Email-->>Partner: Email with link /business-partner/activate?token=...

    Partner->>PublicAPI: POST /api/v1/public/business-partner/activate { token, password }
    PublicAPI->>DB: Set User ACTIVE, set passwordHash, clear activationToken
    PublicAPI-->>Partner: 200 OK (Account Activated)

    Partner->>Portal: Access /broker/dashboard
    Portal->>DB: requireBroker(req) verifies User ACTIVE
    Portal-->>Partner: Render Dashboard

    Note over Admin,Portal: Admin Suspension Flow
    Admin->>AdminAPI: POST /api/v1/admin/brokers/[id]/actions { action: "suspend" }
    AdminAPI->>DB: Update User status: INACTIVE, inactiveAt: now()
    Partner->>Portal: Request /api/v1/broker/*
    Portal-->>Partner: 403 Forbidden { error: "ACCOUNT_INACTIVE" }
    Portal-->>Partner: Redirect /login?error=account_suspended
```

---

### Flow 3: Broker Onboarding Gate & Admin KYC Review

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Partner
    participant BrokerAPI as Broker Profile API
    participant DB as Neon PostgreSQL
    actor Admin as Admin
    participant AdminKYC as Admin KYC API

    Partner->>BrokerAPI: GET /api/v1/broker/profile
    Note over Partner,BrokerAPI: Check 4-step checklist: Profile, Payout, KYC, Terms
    Partner->>BrokerAPI: PUT /api/v1/broker/profile { panNumber, payoutMethod, payoutDetails }
    BrokerAPI->>DB: Upsert OrganizationSetting broker_ext:[profileId]
    BrokerAPI-->>Partner: 200 OK (Checklist 100%)

    Admin->>AdminKYC: View /admin/crm/brokers/[id] (Tab: KYC & Payout)
    Admin->>AdminKYC: POST /api/v1/admin/brokers/[id]/kyc { action: "approve", reason: "Verified" }
    AdminKYC->>DB: Update broker_ext:[profileId] -> kycStatus: "VERIFIED"
    AdminKYC->>DB: Create Notification for Partner ("KYC Verified")
    AdminKYC-->>Admin: 200 OK { kycStatus: "VERIFIED" }
```

---

### Flow 4: Lead Referral, Project Onboarding & Client Provisioning

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Prospect
    participant PublicRoute as Public Inbound Form
    participant DB as Neon PostgreSQL
    participant AdminUI as Admin CRM
    participant BrokerUI as Broker Portal

    Client->>PublicRoute: Visit /project/start/[referralCode]
    PublicRoute->>DB: Resolve BrokerProfile by referralCode (must be ACTIVE)
    Client->>PublicRoute: Submit Project Onboarding Form
    PublicRoute->>DB: Create PartnerProject (PROJECT_REQUESTED) linked to brokerProfileId
    PublicRoute->>DB: Create In-App Notification for Broker & Admin
    PublicRoute-->>Client: 200 OK { projectCode: "PRJ-..." }

    Admin->>AdminUI: View /admin/crm/partner-projects/[id]
    Admin->>AdminUI: Accept & Start Project (POST .../start)
    AdminUI->>DB: Update PartnerProject status: IN_PROGRESS
    AdminUI->>DB: Create User (Role: CLIENT, status: PENDING_ACTIVATION)
    AdminUI->>DB: Create CrmClient record
    AdminUI->>DB: Enqueue client activation email with token
    AdminUI-->>Client: Email with /client/activate?token=...

    Note over AdminUI: If client misses email, Admin clicks "Resend Client Activation Email"
    Admin->>AdminUI: POST .../resend-client-activation
    AdminUI->>DB: Refresh token & re-dispatch email
```

---

### Flow 5: Contract & Payment Settlement with Commission Activation

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    actor Broker as Broker / Client
    participant DB as Neon PostgreSQL

    Admin->>DB: Send Contract PDF (POST /api/v1/admin/partner-contracts)
    DB->>Broker: Contract available for download (GET .../download)
    Broker->>DB: Upload executed contract PDF (POST .../upload)
    DB->>Admin: Contract status -> SIGNED / UNDER_REVIEW
    Admin->>DB: Approve Contract (PATCH .../contract -> VERIFIED)

    Broker->>DB: Submit Advance Payment UTR (POST /api/v1/broker/payments/[id]/submit)
    DB->>Admin: Payment status -> SUBMITTED
    Admin->>DB: Verify Payment (PATCH /api/v1/admin/partner-payments/[id] { action: "verify" })
    Note over Admin,DB: Check custom commission override in broker_ext or active global rule
    DB->>DB: Create/Update Commission (status: ELIGIBLE)
    DB->>Broker: In-App Notification ("Commission of ₹X is now eligible")

    Broker->>DB: Request Payout (POST /api/v1/broker/commissions/payout-request)
    DB->>Admin: Commission status -> REQUESTED
    Admin->>DB: Settle Payout with UTR (PATCH /api/v1/admin/commissions/[id] { action: "pay", payoutReference: "UTR123" })
    DB->>DB: Commission status -> PAID, paidAt: now()
    DB->>Broker: In-App Notification ("Payout Settled. Ref: UTR123")
```

---

## 3. Entity State Machines

### 3.1 BusinessPartnerApplication Status
- `SUBMITTED` -> `UNDER_REVIEW` -> `MEETING_SCHEDULED` -> `MORE_INFO_REQUESTED` -> `ON_HOLD` -> `APPROVED` | `REJECTED`
- `APPROVED` enables `Create Partner Account`.

### 3.2 User Status (Partner & Client)
- `PENDING_ACTIVATION` -> (via activation token) -> `ACTIVE`
- `ACTIVE` -> (via admin suspend) -> `INACTIVE`
- `INACTIVE` -> (via admin reactivate) -> `ACTIVE`

### 3.3 PartnerProject Status
- `PROJECT_REQUESTED` -> `PRICING_PROPOSED` -> `CONTRACT_PENDING` -> `CONTRACT_UPLOADED` -> `PAYMENT_PENDING` -> `PROJECT_CONFIRMED` -> `IN_PROGRESS` -> `INTERNAL_QA` -> `UAT_READY` -> `UAT_APPROVED` -> `DELIVERED` -> `COMPLETED`

### 3.4 Commission Status
- `PENDING` -> `ELIGIBLE` -> `REQUESTED` -> `PROCESSING` / `APPROVED` -> `PAID`
