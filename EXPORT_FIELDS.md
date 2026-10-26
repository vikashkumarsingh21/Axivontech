# Axivon Technologies — Excel Export Fields Specification (EXPORT_FIELDS.md)

**Generated Date:** 2026-10-26  
**Branch:** `admin-export-client-mgmt`  
**Purpose:** Comprehensive column audit and schema definition for Admin Excel Export System (Applications, Confirmed Partners, and Detailed Single-Partner / Related Data).

---

## 1. Applications Export (`BusinessPartnerApplication`)

Collected from `src/components/partner-application/PartnerApplicationForm.tsx` and the `BusinessPartnerApplication` Prisma model. Every single collected field is included below with zero omissions.

### Column Specification

| # | Column Header | Data Field Path | Field Description | Data Type | Excel Format |
|---|---|---|---|---|---|
| 1 | **Application ID** | `applicationId` | Unique application reference code (e.g. `BP-APP-xxxx`) | String | Text |
| 2 | **Status** | `status` | Current workflow state (`SUBMITTED`, `UNDER_REVIEW`, `MEETING_SCHEDULED`, `APPROVED`, `REJECTED`) | String | Text |
| 3 | **Full Name** | `fullName` | Applicant's full legal name | String | Text |
| 4 | **Email** | `email` | Applicant email address | String | Text |
| 5 | **Email Verified** | `emailVerifiedAt` | Date/time applicant email was confirmed (or "Unverified") | DateTime / String | `YYYY-MM-DD HH:mm` |
| 6 | **Phone** | `phone` | Contact phone number | String | Text |
| 7 | **Country** | `country` | Country of residence | String | Text |
| 8 | **State** | `state` | State / Province | String | Text |
| 9 | **City** | `city` | City / Town | String | Text |
| 10 | **Occupation** | `occupation` | Current occupation / profession | String | Text |
| 11 | **Current Work** | `currentWork` | Current employer / business / freelance practice | String | Text |
| 12 | **Years of Experience** | `yearsOfExperience` | Total years of relevant professional experience | Integer | Integer |
| 13 | **Relevant Experience** | `relevantExperience` | Detailed background and technology / domain experience | String (Text) | Text (Wrap) |
| 14 | **Client Network** | `clientNetwork` | Description of business network, reach, and prospective clients | String (Text) | Text (Wrap) |
| 15 | **10th School** | `education10th.school` | 10th standard school name | String | Text |
| 16 | **10th Board** | `education10th.board` | 10th standard educational board (CBSE/ICSE/State) | String | Text |
| 17 | **10th Year** | `education10th.passingYear` | Year of passing 10th | String / Int | Text |
| 18 | **10th Score** | `education10th.percentage` | Percentage or CGPA achieved in 10th | String | Text |
| 19 | **12th School** | `education12th.school` | 12th standard school/junior college name | String | Text |
| 20 | **12th Board** | `education12th.board` | 12th standard educational board | String | Text |
| 21 | **12th Year** | `education12th.passingYear` | Year of passing 12th | String / Int | Text |
| 22 | **12th Score** | `education12th.percentage` | Percentage or CGPA achieved in 12th | String | Text |
| 23 | **UG Degree** | `educationUndergrad.degree` | Undergraduate degree (e.g. B.Tech, BCA, B.Sc) | String | Text |
| 24 | **UG Branch** | `educationUndergrad.branch` | Major / specialization (e.g. Computer Science) | String | Text |
| 25 | **UG College** | `educationUndergrad.college` | University / institute name | String | Text |
| 26 | **UG Year** | `educationUndergrad.passingYear` | Year of graduation | String / Int | Text |
| 27 | **Motivation** | `motivation` | Statement on why the applicant wants to partner with Axivon | String (Text) | Text (Wrap) |
| 28 | **Expected Contribution** | `contribution` | How the applicant intends to contribute to growth | String (Text) | Text (Wrap) |
| 29 | **Additional Information** | `additionalInfo` | Supplementary notes or portfolio references | String (Text) | Text (Wrap) |
| 30 | **Decision Reason** | `decisionReason` | Reviewer notes / rejection or approval rationale | String (Text) | Text |
| 31 | **Reviewed By** | `reviewedBy.name` | Administrator who evaluated the application | String | Text |
| 32 | **Reviewed At** | `reviewedAt` | Timestamp when application was reviewed | DateTime | `YYYY-MM-DD HH:mm` |
| 33 | **Application Date** | `createdAt` | Submission timestamp in Asia/Kolkata | DateTime | `YYYY-MM-DD HH:mm` |
| 34 | **Last Updated** | `updatedAt` | Last modification timestamp | DateTime | `YYYY-MM-DD HH:mm` |

---

## 2. Confirmed Partners Export (`BrokerProfile` & `User`)

Covers activated brokers and business partners working with Axivon. Extracted from `User`, `BrokerProfile`, and `OrganizationSetting` (`broker_ext:${brokerProfile.id}`).

### Column Specification

| # | Column Header | Data Field Path | Field Description | Data Type | Excel Format |
|---|---|---|---|---|---|
| 1 | **Partner ID** | `brokerProfile.partnerId` | System Partner ID (e.g. `AXV-BP-1001`) | String | Text |
| 2 | **Referral Code** | `brokerProfile.referralCode` | Unique referral identifier (e.g. `AXVREF1234`) | String | Text |
| 3 | **Partner Name** | `user.name` | Full legal name | String | Text |
| 4 | **Email** | `user.email` | Primary registered work email | String | Text |
| 5 | **Phone** | `user.phone` | Primary phone number | String | Text |
| 6 | **WhatsApp** | `brokerProfile.whatsapp` | WhatsApp contact number | String | Text |
| 7 | **Account Status** | `user.status` | `ACTIVE`, `INACTIVE`, `SUSPENDED` | String | Text |
| 8 | **Company Name** | `brokerProfile.companyName` | Partner agency / corporate entity | String | Text |
| 9 | **Designation** | `brokerProfile.designation` | Partner title / designation | String | Text |
| 10 | **Website** | `brokerProfile.website` | Company or professional website | String | Text |
| 11 | **City** | `brokerProfile.city` | Operating city | String | Text |
| 12 | **State** | `brokerProfile.state` | Operating state / province | String | Text |
| 13 | **Country** | `brokerProfile.country` | Operating country | String | Text |
| 14 | **Address** | `user.address` | Registered office or postal address | String | Text |
| 15 | **Onboarding State** | Computed | `COMPLETED` (100%) or `IN_PROGRESS` (X%) | String | Text |
| 16 | **Terms Accepted** | `broker_ext.termsAccepted` | `YES` / `NO` agreement compliance | String | Text |
| 17 | **Terms Accepted At** | `broker_ext.termsAcceptedAt` | Exact timestamp when terms were accepted | DateTime | `YYYY-MM-DD HH:mm` |
| 18 | **KYC Status** | Computed / `broker_ext` | `VERIFIED`, `PENDING_REVIEW`, `NOT_UPLOADED` | String | Text |
| 19 | **PAN Number** | `broker_ext.panNumber` | Permanent Account Number (**Masked** by default: `••••••••12`) | String | Text |
| 20 | **GST Number** | `broker_ext.gstNumber` | Goods & Services Tax identification number | String | Text |
| 21 | **Payout Method** | `broker_ext.payoutMethod` | `BANK_TRANSFER` or `UPI` | String | Text |
| 22 | **Account Holder** | `broker_ext.payoutDetails.accountHolder` | Beneficiary name registered with bank | String | Text |
| 23 | **Bank Name** | `broker_ext.payoutDetails.bankName` | Bank institution name | String | Text |
| 24 | **Account Number** | `broker_ext.payoutDetails.accountNumber` | Bank account number (**Masked** by default: `••••••••1234`) | String | Text |
| 25 | **IFSC Code** | `broker_ext.payoutDetails.ifsc` | Bank IFSC branch code | String | Text |
| 26 | **UPI ID** | `broker_ext.payoutDetails.upiId` | UPI VPA (**Masked** by default: `vi•••@okicici`) | String | Text |
| 27 | **Total Leads** | CRM Aggregate | Count of all leads generated by partner | Integer | Integer |
| 28 | **Active Projects** | CRM Aggregate | Count of currently active client projects | Integer | Integer |
| 29 | **Total Projects** | CRM Aggregate | Count of all completed + active projects | Integer | Integer |
| 30 | **Total Commission Earned (₹)** | Commission Aggregate | Sum of approved + paid commissions | Float | Currency `₹#,##0.00` |
| 31 | **Total Commission Paid (₹)** | Commission Aggregate | Sum of paid commissions | Float | Currency `₹#,##0.00` |
| 32 | **Pending Commission (₹)** | Commission Aggregate | Sum of pending/eligible commissions | Float | Currency `₹#,##0.00` |
| 33 | **Created Date** | `user.createdAt` | Account creation timestamp | DateTime | `YYYY-MM-DD HH:mm` |
| 34 | **Last Login / Updated** | `user.updatedAt` | Account modification timestamp | DateTime | `YYYY-MM-DD HH:mm` |

---

## 3. Related Data Sheets Specification (Optional / Detailed Single-Partner Export)

When exporting a single partner or when the admin selects **"Include related data"**, the workbook contains these additional sheets:

### Sheet: "Leads"
1. `Lead Code` (e.g. `AXV-LD-1002`)
2. `Partner ID` / `Referral Code`
3. `Lead Name`
4. `Email`
5. `Phone`
6. `Company Name`
7. `Service Interest`
8. `Pipeline Status` (`NEW`, `CONTACTED`, `MEETING`, `QUALIFIED`, `CONVERTED`, `LOST`)
9. `Qualification Status`
10. `Estimated Budget (₹)`
11. `Created At`

### Sheet: "Projects"
1. `Project Code` (e.g. `AXV-PRJ-2001`)
2. `Project Name`
3. `Partner ID`
4. `Client Name`
5. `Client Email`
6. `Client Company`
7. `Required Service`
8. `Project Budget`
9. `Final Value (₹)`
10. `Status` (`PROJECT_REQUESTED`, `CONTRACT_SIGNED`, `IN_PROGRESS`, `COMPLETED`, etc.)
11. `QA Status`
12. `Progress %`
13. `Expected Delivery Date`
14. `Started At`
15. `Completed At`

### Sheet: "Commissions"
1. `Commission ID`
2. `Partner ID` / `Partner Name`
3. `Project Code`
4. `Project Name`
5. `Project Value (₹)`
6. `Commission Type` (`PERCENTAGE` / `FIXED`)
7. `Rate (%)`
8. `Commission Amount (₹)`
9. `Status` (`PENDING`, `ELIGIBLE`, `APPROVED`, `PAID`, `CANCELLED`)
10. `Approved At`
11. `Approved By`
12. `Paid At`
13. `Paid By`
14. `Payout Reference / UTR`

### Sheet: "Payouts"
1. `Payment ID`
2. `Partner ID`
3. `Project Code`
4. `Project Price (₹)`
5. `Advance Amount (₹)`
6. `Remaining Amount (₹)`
7. `Payment Method` (`BANK` / `UPI`)
8. `Amount Paid (₹)`
9. `Transaction ID / UTR`
10. `Payment Date`
11. `Status` (`PENDING`, `SUBMITTED`, `VERIFIED`, `REJECTED`)
12. `Created At`

---

## 4. Security & Masking Rules

1. **Default Masking Policy:**
   - Bank Account Number: Mask all except last 4 digits (e.g., `••••••••5678`).
   - UPI ID: Mask handle prefix (e.g., `ab•••@oksbi`).
   - PAN Number: Mask middle digits (e.g., `AB••••••1Z`).
   - Aadhaar / ID: Mask all except last 4 digits (`••••••••1234`).
2. **Unmasking Requirements (`export:sensitive`):**
   - Active user role must be `ADMIN`, `FOUNDER`, or `CO_FOUNDER`.
   - Separate checkbox in modal explicitly checked: *"Export unmasked financial & tax records"*.
   - Mandatory admin re-authentication: Current admin password must be validated via `POST` payload before unmasked records are released.
   - Comprehensive audit logging recording `unmasked: true`, admin user ID, IP address, and record count.
3. **Excel Formula Injection Neutralization:**
   - Any string value starting with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically sanitized with a leading single quote (`'`) to prevent CSV/Excel DDE formula injection exploits.
4. **Volume Cap:**
   - Hard limit of 20,000 rows with cursor-based batching (1,000 rows per batch) to prevent memory exhaustion and server crashes.
