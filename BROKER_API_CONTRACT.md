# Axivon Broker / Business Partner API Contract

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Authentication:** HTTP-only JWT Cookie Session (`role: BUSINESS_PARTNER` or `BROKER` normalized)  
**Standard Response Envelope:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    details?: any;
  };
}
```

---

## 1. Authentication & Security Context

All `/api/v1/broker/*` endpoints require an active session for a user with role `BUSINESS_PARTNER` or `BROKER`.
- If unauthenticated: HTTP 401 `{ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }`
- If wrong role (e.g., `EMPLOYEE`, `CLIENT`): HTTP 403 `{ success: false, error: { code: "FORBIDDEN_NOT_BROKER", message: "Access denied: Business Partner / Broker credentials required." } }`
- If account suspended: HTTP 403 `{ success: false, error: { code: "ACCOUNT_INACTIVE", message: "Your partner account is currently inactive or suspended." } }`
- If broker profile missing: HTTP 404 `{ success: false, error: { code: "BROKER_PROFILE_NOT_FOUND" } }`

---

## 2. Broker Profile & Onboarding

### `GET /api/v1/broker/profile`
- **Description:** Returns profile, business information, masked payout details, and onboarding checklist progress.
- **Response `data`:**
  ```json
  {
    "profile": {
      "id": "cuid...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+91 9876543210",
      "avatarUrl": "https://...",
      "address": "123 Commercial St",
      "status": "ACTIVE",
      "createdAt": "2026-10-01T00:00:00.000Z",
      "brokerProfile": {
        "id": "cuid...",
        "partnerId": "BP-202610-0001",
        "referralCode": "AXP-JANE-1234",
        "companyName": "Jane Ventures",
        "designation": "Partner",
        "whatsapp": "+91 9876543210",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "website": "https://janeventures.com",
        "panNumberMasked": "AB••••••1F",
        "gstNumber": "29ABCDE1234F1Z5",
        "payoutMethod": "BANK_TRANSFER",
        "payoutDetails": {
          "accountHolder": "Jane Doe",
          "accountNumberMasked": "••••••••9012",
          "bankName": "HDFC Bank",
          "ifsc": "HDFC0001234",
          "upiIdMasked": null
        }
      },
      "onboarding": {
        "completionPercentage": 100,
        "isCompleted": true,
        "checklist": {
          "profileDetails": true,
          "payoutDetails": true,
          "kycDocuments": true,
          "termsAccepted": true,
          "contractSigned": true
        },
        "termsAcceptedAt": "2026-10-15T10:00:00.000Z"
      },
      "fieldPermissions": {
        "editable": ["name", "phone", "whatsapp", "address", "companyName", "designation", "city", "state", "country", "website", "panNumber", "gstNumber", "payoutMethod", "payoutDetails"],
        "readOnly": ["id", "email", "status", "partnerId", "referralCode", "createdAt"]
      }
    }
  }
  ```

### `PATCH /api/v1/broker/profile`
- **Description:** Updates editable profile and payout settings.
- **Request Body:** Partial JSON of editable fields:
  `{ companyName, phone, whatsapp, address, city, state, country, website, panNumber, gstNumber, payoutMethod, payoutDetails: { accountHolder, accountNumber, ifsc, bankName, upiId } }`
- **Response:** `{ success: true, data: { profile, message: "Profile updated successfully." } }`

### `POST /api/v1/broker/profile/password`
- **Request Body:** `{ currentPassword: "...", newPassword: "..." }`
- **Response:** `{ success: true, data: { message: "Password updated successfully." } }`

### `POST /api/v1/broker/profile/terms`
- **Request Body:** `{ termsVersion: "2.1", agreed: true }`
- **Response:** `{ success: true, data: { termsAccepted: true, termsVersion: "2.1", termsAcceptedAt: "..." } }`

---

## 3. Referral Engine & Leads

### `POST /api/v1/broker/referral/generate`
- **Description:** Idempotently retrieves or creates the broker's unique referral code and shareable templates.
- **Response `data`:**
  ```json
  {
    "referralCode": "AXP-QA-475B0E",
    "referralLink": "https://axivontech.in/lead/AXP-QA-475B0E",
    "projectStartLink": "https://axivontech.in/project/start/AXP-QA-475B0E",
    "shareTemplates": {
      "whatsapp": "Partner with Axivon Technologies... https://axivontech.in/lead/AXP-QA-475B0E",
      "email": {
        "subject": "Exclusive Technology Partner Invitation",
        "body": "..."
      }
    }
  }
  ```

### `GET /api/v1/public/referral/validate?code=...`
- **Response:** HTTP 200 `{ success: true, data: { valid: true, partnerName, companyName, partnerId } }` or HTTP 404.

### `GET /api/v1/broker/leads`
- **Query Params:** `page`, `limit`, `search`, `status`, `from`, `to`, `sortBy`, `sortOrder`
- **Response `data`:** Array of leads:
  ```json
  [
    {
      "id": "cuid...",
      "leadCode": "LD-20261024-0005",
      "name": "Jane Doe Client",
      "email": "client@example.com",
      "phone": "+91 9988776655",
      "companyName": null,
      "serviceInterest": "WEB_DEVELOPMENT",
      "status": "NEW",
      "budget": 500000,
      "timeline": null,
      "createdAt": "2026-10-24T19:20:00.000Z",
      "activities": [
        { "id": "...", "type": "LEAD_CREATED", "title": "New lead received via PARTNER", "createdAt": "..." }
      ]
    }
  ]
  ```

---

## 4. Projects Lifecycle

### `GET /api/v1/broker/projects/new`
- **Description:** Static schema and metadata endpoint. HTTP 200. Prevents route collision with `[id]`.

### `GET /api/v1/broker/projects`
- **Query Params:** `page`, `limit`, `status`, `search`
- **Response `data`:** Array of projects with safe summaries.

### `POST /api/v1/broker/projects`
- **Request Body:**
  ```json
  {
    "projectName": "Apex Logistics Cloud Platform",
    "clientName": "Apex Logistics Inc",
    "clientEmail": "contact@apexlogistics.com",
    "clientPhone": "+91 9888877777",
    "requiredService": "WEB_DEVELOPMENT",
    "detailedRequirement": "Full-scale fleet management tracking system.",
    "expectedTimeline": "8 weeks",
    "projectBudget": "400000",
    "companyName": "Apex Logistics Inc",
    "industry": "LOGISTICS",
    "city": "Bengaluru",
    "state": "Karnataka",
    "country": "India"
  }
  ```
- **Response:** HTTP 201 `{ success: true, data: { id, projectCode, projectName, status: "PROJECT_REQUESTED", ... } }`

### `GET /api/v1/broker/projects/[id]`
- **Response `data`:** Project details, milestones, contract version info, payment requirement, commission status. Strips internal company margins and developer cost.

### `DELETE /api/v1/broker/projects/[id]`
- **Description:** Allows broker to cancel project only if status is `PROJECT_REQUESTED` or `PENDING_REVIEW`.

---

## 5. Contracts & Milestone Payments

### `GET /api/v1/broker/contracts`
- **Description:** Lists partner contracts for the broker's confirmed projects.

### `GET /api/v1/broker/contracts/[id]/download`
- **Description:** Secure download endpoint. Transitions contract to `DOWNLOADED`. Returns `{ fileUrl, versionNumber, contractName }`.

### `POST /api/v1/broker/contracts/[id]/upload`
- **Request Body:** `{ versionId, signedFileUrl, signingConfirmed: true, notes: "..." }`
- **Response:** Transitions contract status to `UNDER_REVIEW`.

### `GET /api/v1/broker/payments` & `GET /api/v1/broker/payments/[id]`
- **Description:** Details of advance or milestone payments for projects.

### `POST /api/v1/broker/payments/[id]/submit`
- **Request Body:** `{ paymentMethod: "BANK" | "UPI", amountPaid: 200000, transactionId: "UTR...", proofFileUrl: "https://...", additionalNotes: "..." }`
- **Response:** Transitions payment to `SUBMITTED`.

---

## 6. Commissions & Payouts

### `GET /api/v1/broker/commissions`
- **Query Params:** `page`, `limit`, `status`, `search`, `from`, `to`
- **Response `data`:**
  ```json
  {
    "summary": {
      "totalEarned": 40000,
      "pending": 0,
      "eligible": 0,
      "requested": 0,
      "paid": 40000,
      "thisMonth": 40000
    },
    "commissions": [
      {
        "id": "cuid...",
        "partnerProjectId": "cuid...",
        "projectValue": 400000,
        "commissionType": "PERCENTAGE",
        "commissionRate": 10,
        "commissionAmount": 40000,
        "currency": "INR",
        "status": "PAID",
        "payoutRequestedAt": "2026-10-24T19:24:00.000Z",
        "paidAt": "2026-10-24T19:25:00.000Z",
        "payoutReference": "BANK-UTR-123456"
      }
    ]
  }
  ```

### `GET /api/v1/broker/commissions/[id]`
- **Description:** Details and breakdown with estimated 5% Section 194H TDS deduction:
  ```json
  {
    "commission": { ... },
    "tds": {
      "applicable": true,
      "ratePercentage": 5,
      "section": "194H",
      "estimatedDeduction": 2000,
      "netPayable": 38000
    }
  }
  ```

### `POST /api/v1/broker/commissions/payout-request`
- **Request Body:** `{ commissionId: "...", payoutMethod?: "BANK_TRANSFER", payoutDetails?: { ... }, notes?: "..." }`
- **Rules:** Minimum threshold ₹500. Must be in `ELIGIBLE` status. Transitions to `REQUESTED` with 48h SLA `payoutDueAt`.

### `GET /api/v1/broker/commissions/export`
- **Query Params:** `from`, `to`, `status`
- **Response:** Returns CSV file attachment (`text/csv`) with RFC-4180 headers: `Commission ID, Project Code, Project Name, Project Value, Rate (%), Gross Commission, TDS (5%), Net Payable, Status, ...`

---

## 7. Documents & Notifications

### `GET /api/v1/broker/documents`
- **Query Params:** `category`, `search`, `page`, `limit`
- **Response `data`:** `{ documents: [...], categories: [...], unreadCount: number }`.
- **Note:** `isRead` and `readAt` are tracked per-broker in multi-tenant isolation.

### `POST /api/v1/broker/documents/[id]/read`
- **Description:** Acknowledges document read without affecting other brokers.

### `GET /api/v1/notifications`
- **Query Params:** `page`, `limit`, `unreadOnly`
- **Endpoints:** `GET /notifications/unread-count`, `POST /notifications/[id]/read`, `POST /notifications/read-all`.

---

## 8. Dashboard & Add-On Features

### `GET /api/v1/broker/dashboard`
- **Description:** Aggregated payload:
  ```json
  {
    "stats": {
      "leads": { "TOTAL": 5, "NEW": 2, "QUALIFIED": 3 },
      "projects": { "TOTAL": 2, "PENDING": 1, "CONFIRMED": 1 },
      "earnings": { "totalEarned": 40000, "pending": 0, "eligible": 0, "requested": 0, "paid": 40000, "thisMonth": 40000 }
    },
    "pendingActions": [
      { "id": "action-contract", "type": "CONTRACT_SIGN", "title": "...", "link": "..." }
    ],
    "referral": { "referralCode": "AXP-...", "totalClicks": 0, "totalLeads": 5 },
    "recentMilestones": [ ... ],
    "recentActivity": [ ... ]
  }
  ```

### `GET /api/v1/broker/analytics/earnings`
- **Description:** Returns 12-month earnings trend, 5-step conversion funnel, and top service types breakdown.

### `POST /api/v1/broker/commissions/estimate`
- **Request Body:** `{ budget: 600000, serviceType: "WEB_DEVELOPMENT" }`
- **Response:** `{ estimate: { grossCommission: 60000, estimatedTds: 3000, netCommission: 57000, rule: { ... } } }`

### `GET /api/v1/broker/activity`
- **Description:** Unified broker activity timeline across leads, projects, payments, commissions.

### `GET` & `POST /api/v1/broker/support`
- **Description:** List or submit broker support tickets.
- **`GET` & `POST /api/v1/broker/support/[id]`:** Thread details and broker reply posting.

### `GET`, `POST`, `DELETE /api/v1/broker/drafts`
- **Description:** Auto-save drafts for `PROJECT` and `LEAD` forms.
