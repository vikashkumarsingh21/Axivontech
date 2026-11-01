# Owner Decisions & Operational Rules — Axivon Technologies

**Document Version:** 2.0  
**Effective Date:** November 2026  
**Status:** Documented with safe production defaults; awaiting owner confirmation if any rule requires amendment.  

---

# PART I: Public Website Content Rewrite & Brand Standards

The following decisions relate to visible public-site content across the Home, About, Services, Pricing, Industries, Portfolio, Careers, Contact, and Reviews pages.

---

### Decision 1: Careers Email Mailbox Configuration
- **Question:** Is `careers@axivontech.in` an active, monitored email mailbox / Google Workspace alias, or should career inquiries go directly to `info@axivontech.in`?
- **Current State:** References exist for both `info@axivontech.in` and `careers@axivontech.in`.
- **Default Used:** Keep `careers@axivontech.in` for the career application form and speculative submissions, with fallback contact to `info@axivontech.in`.
- **Action Required by Owner:** Confirm whether `careers@axivontech.in` receives incoming emails, or if you prefer all recruitment mail routed to `info@axivontech.in`.

---

### Decision 2: Delivery Timelines on Pricing & Service Pages
- **Question:** Are the typical project timelines in `src/config/pricing.ts` approved for client expectations?
  - **Starter Package:** 7 – 10 business days
  - **Business Package:** 2 – 3 weeks
  - **Growth Package:** 3 – 5 weeks
  - **Custom / Mobile / AI:** 4 – 12+ weeks
- **Current State:** Previously tagged with `[draft — edit in pricing.ts]` in the UI.
- **Default Used:** Removed all `[draft]` strings from the UI. Kept these exact ranges, explicitly qualified with: *"Typical delivery time. Exact timeline depends on feature scope, asset availability, and review turnaround."*
- **Action Required by Owner:** Review these ranges. If you want tighter or looser commitments, reply with revised figures.

---

### Decision 3: Client Reviews & Initial Testimonial
- **Question:** The database currently contains 1 approved review:
  > *"Axivon technology provided me a smoothly running website for my company ,with a budget friendly cost."*  
  > — **Ankit kumar**, Founder, Prignou.online (Service: Website Development, 5 Stars)  
  However, the public instruction specifies: *"Reviews: none published yet."*
- **Default Used:** Rendered the verified honest empty state on `/reviews`:
  > *"We are a new company and have no public reviews yet. If you have worked with us, you can share your experience below."*  
  Kept the review submission form fully functional.
- **Action Required by Owner:** Confirm whether you want Ankit Kumar's review from Prignou.online displayed live on `/reviews` and the Home page, or if you prefer to launch with the empty state until more reviews are collected.

---

### Decision 4: Blog Article Authorship Attribution
- **Question:** The 3 comprehensive blog articles previously had fictional bylines: *"Axivon Solutions Team"* (Articles 1 & 2) and *"Axivon Robotics & Embedded Lab"* (Article 3).
- **Default Used:** Attributed author to **"Axivon Technologies"** with official company avatar.
- **Action Required by Owner:** Confirm whether any of these articles should be personally bylined by Founder Vikash Kumar (e.g. *"Vikash Kumar, Founder & Technical Director"*).

---

### Decision 5: Blog Article Publication Dates
- **Question:** All 3 articles in `src/data/blog-posts.ts` currently carry the exact same date: *"September 10, 2026"*.
- **Default Used:** Display authentic editorial metadata (e.g. *"Published in 2026"* or commit history date) rather than a uniform static date stamp.
- **Action Required by Owner:** Provide specific calendar publication dates if preferred.

---

### Decision 6: Multilingual Support Offerings
- **Question:** Pricing add-ons previously featured `"Gujarati / Hindi version add-on"`.
- **Default Used:** Replaced regional-specific wording with: `"Hindi & Regional Language Localization — Multi-language interface setup for wider Indian audience reach."` Removed state-specific SEO keywords.
- **Action Required by Owner:** Confirm which languages Axivon actively offers for client website localization.

---

### Decision 7: Open Job Roles vs General Application
- **Question:** `src/data/careers.ts` previously listed 3 intern positions as `"Open"`, but company status confirms 0 active vacancies today.
- **Default Used:** Set open positions counter to **0**, replaced the open jobs grid with a welcoming **Speculative & Internship Application Form** for future developer cohorts.
- **Action Required by Owner:** Confirm when the next internship or junior developer hiring batch will open.

---

### Decision 8: Third-Party Technology Stack References
- **Question:** Earlier marketing text listed tools not present in `package.json` (e.g., Remix, Contentful, Stripe, Sentry, Pinecone, Kubernetes).
- **Default Used:** Strictly limited core stack descriptions to verified codebase dependencies (Next.js 16, React 19, TypeScript, Tailwind CSS v4, PostgreSQL, Prisma ORM, Node.js, Google Gemini AI API). Third-party tools are categorized honestly as *"Integrations we support on request"*.
- **Action Required by Owner:** Confirm if any external tools are core offerings.

---

# PART II: Broker Partner Program & Operational Governance

The following rules govern the Broker Partner referral and commission system.

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

### 5. Client Direct-Contact Policy
* **Landing Page Copy:** *"Zero Client Handling"* vs *"Optional client liaison"*
* **Rule:** Brokers are never required to handle technical delivery, scope negotiations, or customer service.
* **Default Used in System:** Axivon handles 100% of the client relationship, contracts, invoicing, and technical execution. Brokers may participate in the introductory kickoff call at their discretion.

---

### 6. Inactive Accounts & Expiration of Referral Attribution
* **Question:** How long does a broker retain attribution for an introduced lead who does not immediately sign?
* **Default Used in System:** **180 days (6 months)** attribution window from initial introduction. If the lead executes a contract within 180 days, commission is credited to the introducing broker.

---

### 7. Performance Thresholds & Commission Rate Floor
* **Question:** Can a broker's commission rate fall below 15% if monthly referral volume decreases?
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
