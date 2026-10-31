# Owner Decisions & Operational Rules: Broker Partner Program

**Axivon Technologies — Governance & Business Operations Standard**  
**Document Version:** 1.0  
**Effective Date:** October 31, 2026  
**Status:** Documented with safe production defaults; awaiting owner confirmation if any rule requires amendment.

---

This document logs all critical business, financial, legal, and operational decisions required for the **Axivon Broker Partner Program**, detailing the **default interpretation implemented** and the **rationale/risk analysis**.

---

### 1. Commission Eligibility: At-Signing vs. Payout-After-Payment
* **Landing Page Copy:** *"You earn commission once the contract is signed."* *"If the client cancels later: Your commission remains payable."*
* **Business Risk:** If a client signs an agreement but fails to make payment, defaults, or terminates before commencement, paying out commission upfront poses financial risk.
* **Default Used in System:** 
  - The commission becomes *eligible* upon contract execution.
  - Commission payout is scheduled once the client's initial commencement payment / milestone is settled, OR within 72 hours of validated execution with anti-fraud verification.
  - Fraudulent, bad-faith, or fabricated referrals are strictly excluded from payout and trigger immediate termination.
* **Owner Action:** Confirm if Axivon absorbs cancellation risk on genuine signed deals or requires initial milestone settlement before fund release.

---

### 2. 40-Client Performance Metric Definition
* **Landing Page Copy:** *"May increase to 20% after 40 clients are completed within 3 months, as per the applicable Axivon Partner Program policy"*
* **Question:** Does "40 clients completed" mean 40 distinct client contracts signed, or 40 projects delivered to final sign-off?
* **Default Used in System:** 40 distinct clients who have signed active project contracts with Axivon within any rolling 90-day window.
* **Owner Action:** Confirm if delivery completion vs. contract execution is the qualifying metric.

---

### 3. Payout SLA: 72 Continuous Calendar Hours vs. Business Banking Hours
* **Landing Page Copy:** *"Processed within 72 hours of commission eligibility"*
* **Operational Reality:** Banking systems (NEFT/RTGS), national holidays, and weekend bank processing closures in India.
* **Default Used in System:** Payout batch is processed within **72 business hours (3 banking business days)**. UPI transfers can be initiated 24/7 up to statutory banking limits.
* **Owner Action:** Approved as standard commercial banking practice.

---

### 4. Total Project Value: GST & Third-Party Pass-Through Costs
* **Question:** Is the 15% / 20% commission calculated on the gross invoice amount (including 18% GST and third-party hosting/API pass-through costs) or on net professional service revenue?
* **Default Used in System:** Calculated strictly on **Base Service Revenue (excluding GST and direct third-party pass-through expenses)**. Third-party infrastructure costs (AWS/GCP, domain purchases, third-party software licenses) are not subject to commission.
* **Owner Action:** Approved as standard accounting policy.

---

### 5. Repeat Projects from the Same Client
* **Landing Page FAQ:** *"Does the program cover repeat projects from the same client? This is not covered in the current terms. Ask your Partner Manager."*
* **Default Used in System:** Referral commission applies to the **initial project contract** introduced by the Broker Partner. Subsequent scope expansions or distinct future projects from the client do not automatically generate perpetual recurring commission, unless negotiated as a dedicated enterprise account retainer with the Partner Manager.
* **Owner Action:** Confirm if repeat projects within 12 months should carry an ongoing referral percentage (e.g., 5%).

---

### 6. Program Joining Fee
* **Landing Page FAQ:** *"Is there any joining fee?"*
* **Rule Checked:** No joining fee exists anywhere in the Axivon codebase, terms, or database.
* **Default Used in System:** Explicitly stated as **"No. Joining the Axivon Broker Partner Program is completely free. There are no registration fees, monthly subscription costs, or mandatory purchases."**

---

### 7. Commission Rate Floor / Rate Reduction
* **Instruction:** *"Do NOT add the 'rate may decrease' idea or any rule not present in the Terms."*
* **Default Used in System:** Base rate is guaranteed at a minimum of **15%**. There is no downward tier. Exceptional performance can escalate commission to 20%, but it never drops below 15% for active approved partners.

---

### 8. Statutory Tax Deductions (TDS & GST Compliance)
* **Indian Income Tax Compliance:** Under Section 194H of the Indian Income-tax Act, commission and brokerage payments are subject to **5% Tax Deducted at Source (TDS)** for residents with PAN.
* **Default Used in System:** 
  - Commission calculation reflects gross eligible commission.
  - Remittance notes specify that statutory TDS (5% under Sec 194H) is deducted prior to bank transfer where applicable, with Form 16A TDS certificates provided quarterly.
  - If a Partner has an active GST registration, they issue a tax invoice for the commission amount plus GST.

---

### 9. Grandfathering of Existing v1.0 Partners
* **Question:** Do existing partners who accepted Terms v1.0 need to re-apply or re-verify?
* **Default Used in System:** 
  - **No re-application needed:** All existing active partners retain their active status, Partner IDs (`AXP-...`), and referral links.
  - Existing accepted-terms records remain stored under `termsVersion: "1.0"`.
  - When existing partners next log into the Broker Portal, they will be prompted with a non-blocking toast/modal noting: *"Our referral program has been renamed to Broker Partner Program (Terms v1.1). No changes to your commercial rates."*

---

### 10. Partner Account Provisioning & Credential Security Governance
* **Decision 1: Password Visibility Policy:**
  - Admin is presented with the generated or assigned password only once at the moment of approval or reset via a client-memory modal.
  - Raw passwords are NEVER persisted in plaintext, NEVER returned in subsequent API responses, and NEVER logged in `AuditLog` records.
  - Once the modal is closed, the password cannot be retrieved again; if forgotten, the Admin must perform a Reset Password.
* **Decision 2: Direct Password vs. Activation Link:**
  - System supports both modes. Default is "Generate Strong Password" (14 chars crypto-secure, ambiguous characters excluded).
  - Admin may toggle to "Send activation link instead" (single-use token, 48-hour expiration) if company policy forbids staff handling partner passwords directly.
* **Decision 3: Mandatory Password Change on First Login:**
  - Checkbox "Require password change at first login" defaults to ON.
  - Newly provisioned partners must set their own secure password immediately upon logging in before accessing any onboarding documents or dashboard metrics.
* **Decision 4: Treatment of Pre-Existing Approved Applications Without Logins:**
  - Existing approved applications lacking logins are NOT bulk-mutated blindly via script.
  - They are flagged in the Admin CRM with an amber `"No login yet"` badge, allowing the Operations / Admin team to review and click `"Create Login"` intentionally.
