# API Contract: Broker, Client & Admin Integration

This contract specifies all integrated API endpoints linking the **Business Partner / Broker Portal**, **Admin CRM Portal**, and **Client Portal** in Axivon Technologies.

---

## 1. Authentication & Security Headers

| Header | Type | Description |
|---|---|---|
| `Cookie: axivon_session` | JWT | HTTP-only session cookie verifying caller identity and role |
| `x-user-id` | String | Downstream user ID injected strictly by Edge middleware |
| `x-user-role` | String | Canonical normalized role (`ADMIN`, `BUSINESS_PARTNER`, `CLIENT`, `FOUNDER`) |

---

## 2. Partner Application & Status Inquiry

### 2.1 Submit Partner Application
- **Method:** `POST`
- **Route:** `/api/v1/business-partner/apply`
- **Auth:** Public (Rate-limited, Honeypot & reCAPTCHA protected)
- **Request Body:**
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543210",
    "country": "India",
    "city": "Mumbai",
    "occupation": "Tech Consultant",
    "yearsOfExperience": 6,
    "motivation": "Looking to partner with Axivon for enterprise software delivery.",
    "privacyPolicyAcknowledged": true
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "applicationId": "BPA-2026-A1B2C3",
    "message": "Application submitted successfully."
  }
  ```

### 2.2 Public Application Status Check
- **Method:** `POST`
- **Route:** `/api/v1/public/business-partner/applications/status`
- **Auth:** Public (Rate-limited: 10 req/15min)
- **Request Body:**
  ```json
  {
    "applicationId": "BPA-2026-A1B2C3",
    "email": "jane@example.com"
  }
  ```
- **Response (200):** Safe projection (excludes internal reviewer notes, staff names)
  ```json
  {
    "success": true,
    "application": {
      "applicationId": "BPA-2026-A1B2C3",
      "fullName": "Jane Doe",
      "status": "UNDER_REVIEW",
      "createdAt": "2026-10-25T10:00:00.000Z",
      "reviewedAt": null,
      "meetings": []
    }
  }
  ```

### 2.3 Admin Application Internal Notes
- **Method:** `GET` / `POST`
- **Route:** `/api/v1/admin/business-partner/applications/[id]/notes`
- **Auth:** Admin (`business_partner_application.view` / `.review`)
- **Storage:** `OrganizationSetting` key `bpa_notes:[id]`
- **POST Request Body:**
  ```json
  {
    "note": "Candidate has direct enterprise client contacts in BFSI."
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "note": {
      "id": "NOTE-1792922759-4f2a",
      "note": "Candidate has direct enterprise client contacts in BFSI.",
      "authorId": "admin_user_id",
      "authorName": "Admin Reviewer",
      "createdAt": "2026-10-25T10:15:00.000Z"
    }
  }
  ```

---

## 3. Account Provisioning, Activation & Account Controls

### 3.1 Create Partner Account (from Approved Application)
- **Method:** `POST`
- **Route:** `/api/v1/admin/business-partner/applications/[id]/create-account`
- **Auth:** Admin
- **Behavior:**
  - Creates `User` (`status: PENDING_ACTIVATION`, `mustChangePassword: true`, `activationToken`)
  - Creates `BrokerProfile` (`partnerId`, `referralCode`)
  - Connects role `BUSINESS_PARTNER`
  - Enqueues `PARTNER_ACCOUNT_ACTIVATION` email with activation link
- **Response (201):**
  ```json
  {
    "message": "Partner account created successfully",
    "partnerId": "AXP-2026-8A3F12",
    "referralCode": "AXP-JANE-47E1"
  }
  ```

### 3.2 Partner Account Activation
- **Method:** `POST`
- **Route:** `/api/v1/public/business-partner/activate`
- **Auth:** Public (Token-based)
- **Request Body:**
  ```json
  {
    "token": "4a73f8e1-...",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "partnerId": "AXP-2026-8A3F12",
    "referralCode": "AXP-JANE-47E1"
  }
  ```

### 3.3 Admin Broker Actions (Resend Activation / Suspend / Reactivate)
- **Method:** `POST`
- **Route:** `/api/v1/admin/brokers/[id]/actions`
- **Auth:** Admin (`users:write`)
- **Actions:**
  - `resend_activation`: Regenerates activation token, re-dispatches email.
  - `suspend`: Sets `status: INACTIVE`, sets `inactiveAt: now()`. Blocks all portal requests with 403.
  - `reactivate`: Sets `status: ACTIVE`, clears `inactiveAt`. Restores portal access.
- **Request Body:**
  ```json
  {
    "action": "suspend",
    "reason": "Compliance review in progress."
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Broker account has been suspended."
  }
  ```

---

## 4. Admin Broker Dossier, KYC & Commission Override

### 4.1 Admin Broker Dossier
- **Method:** `GET`
- **Route:** `/api/v1/admin/brokers/[id]`
- **Auth:** Admin (`users:read`)
- **Identifier:** Supports lookup by `User.id`, `BrokerProfile.id`, or `BrokerProfile.partnerId`.
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "...", "name": "...", "email": "...", "status": "ACTIVE" },
      "profile": { "partnerId": "AXP-2026-...", "referralCode": "AXP-..." },
      "kyc": {
        "panNumber": "ABCDE1234F",
        "gstNumber": null,
        "payoutMethod": "BANK_TRANSFER",
        "payoutDetails": { "bankName": "HDFC", "accountNumber": "1234567890", "ifsc": "HDFC0001234" },
        "status": "VERIFIED"
      },
      "commissionConfig": { "customRate": 12.5 },
      "stats": { "totalLeads": 5, "totalProjects": 3, "totalEarned": 150000, "eligibleCommission": 45000 },
      "leads": [...],
      "projects": [...],
      "contracts": [...],
      "commissions": [...],
      "internalNotes": [...]
    }
  }
  ```

### 4.2 Admin KYC Review
- **Method:** `POST`
- **Route:** `/api/v1/admin/brokers/[id]/kyc`
- **Auth:** Admin (`users:write`)
- **Request Body:**
  ```json
  {
    "action": "approve",
    "reason": "Bank account verified with penny drop."
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "kycStatus": "VERIFIED",
      "kycRemarks": "Bank account verified with penny drop.",
      "verifiedAt": "2026-10-25T11:00:00.000Z"
    }
  }
  ```

---

## 5. Referral Leads & Project Onboarding

### 5.1 Public Referral Lead Intake
- **Method:** `POST`
- **Route:** `/api/v1/public/leads`
- **Auth:** Public (Rate-limited, reCAPTCHA protected)
- **Parameters:** `referralCode` in body
- **Attribution:** Resolves `BrokerProfile`, sets `ownerId: brokerUser.id`, `source: "PARTNER"`.
- **Duplicate Check:** Identifies 30-day matching email/phone.

### 5.2 Public Project Onboarding
- **Method:** `POST`
- **Route:** `/api/v1/public/project-requests`
- **Auth:** Public (Rate-limited, reCAPTCHA protected)
- **Parameters:** `referralCode` in body
- **Attribution:** Creates `PartnerProject` linked to `brokerProfileId`. Notifies broker & admin.

### 5.3 Admin Resend Client Activation
- **Method:** `POST`
- **Route:** `/api/v1/admin/partner-projects/[id]/resend-client-activation`
- **Auth:** Admin (`users:write`)
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Activation link generated and email sent to client@acme.com",
    "activationLink": "http://localhost:3000/client/activate?token=..."
  }
  ```

---

## 6. Contracts, Payments & Commissions

### 6.1 Broker Contract Download
- **Method:** `GET`
- **Route:** `/api/v1/broker/contracts/[id]/download`
- **Auth:** Broker (IDOR verified)

### 6.2 Broker Signed Contract Upload
- **Method:** `POST`
- **Route:** `/api/v1/broker/contracts/[id]/upload`
- **Auth:** Broker (IDOR verified, PDF format strictly validated)

### 6.3 Advance Payment Verification & Commission Trigger
- **Method:** `PATCH`
- **Route:** `/api/v1/admin/partner-payments/[id]`
- **Body:** `{ "action": "verify" }`
- **Behavior:**
  - Verifies payment status
  - Checks for broker custom commission override in `broker_ext:[profileId]` or active global rule
  - Creates/activates `Commission` (status: `ELIGIBLE`)
  - Updates `PartnerProject` status: `PROJECT_CONFIRMED`
  - Sends notifications to broker

### 6.4 Commission Settlement & UTR Recording
- **Method:** `PATCH`
- **Route:** `/api/v1/admin/commissions/[id]`
- **Body:** `{ "action": "pay", "payoutReference": "UTR-9876543210" }`
- **Enforcement:** Strictly rejects duplicate UTR numbers across all settled commissions.

---

## 7. Partner Support Desk

### 7.1 Admin Support Queue
- **Method:** `GET`
- **Route:** `/api/v1/admin/support/brokers?status=OPEN&priority=HIGH`
- **Auth:** Admin (`users:read`)

### 7.2 Admin Ticket Reply & Resolution
- **Method:** `POST`
- **Route:** `/api/v1/admin/support/brokers/[ticketId]`
- **Auth:** Admin (`users:write`)
- **Body:**
  ```json
  {
    "message": "Your commission payment has been approved and scheduled for settlement.",
    "status": "RESOLVED"
  }
  ```
- **Notification:** Automatically pushes in-app notification to broker.
