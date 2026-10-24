import { db } from "@/lib/db";
export type { LegalPolicyItem, PolicyCategoryMeta } from "./types";
export { LEGAL_CATEGORIES } from "./types";
import type { LegalPolicyItem } from "./types";

export const DEFAULT_LEGAL_POLICIES: LegalPolicyItem[] = [
  {
    id: "policy-privacy",
    slug: "privacy-policy",
    title: "Privacy Policy",
    category: "PRIVACY_DATA",
    summary:
      "Comprehensive information on how Axivon Technologies collects, processes, protects, and retains personal data in compliance with India's Digital Personal Data Protection Act 2023 (DPDP Act) and the Information Technology Act 2000.",
    version: "2.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Legal & Compliance Directorate",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Introduction and Scope

Axivon Technologies ("Axivon", "we", "our", or "us") operates the website **https://axivontech.in** and the **AXIVON ONE** enterprise operational platform. We are committed to processing your personal data transparently, securely, and in strict compliance with the **Digital Personal Data Protection Act, 2023 (DPDP Act)**, the **Information Technology Act, 2000**, and the rules promulgated thereunder.

This Privacy Policy governs your use of our public website, client inquiry forms, customer support AI chatbots, recruitment portals, and authenticated multi-portal workspaces (including Admin, Employee, Client, Broker, and Business Partner interfaces).

## 2. Grounds and Principles of Processing

We adhere to the fundamental data protection principles:
- **Purpose Limitation:** Data is collected solely for explicit, lawful, and specific business purposes.
- **Data Minimization:** We collect only personal data strictly necessary for fulfilling stated purposes.
- **Accuracy and Quality:** We take reasonable steps to maintain accurate and up-to-date information.
- **Storage Limitation:** Personal data is retained only as long as necessary to fulfill operational, contractual, or statutory obligations.
- **Integrity and Confidentiality:** Industry-standard technical and organizational safeguards protect all data against unauthorized access, loss, or alteration.

## 3. Categories of Personal Data We Collect

Depending on your interactions with Axivon, we collect:
1. **Prospective Clients & Inquiries:** Full name, business email address, phone number, company name, service interest, project specifications, and budget ranges submitted via contact and consultation forms.
2. **AI Customer Support & Chatbot:** Conversation transcripts, inquiry summaries, and contact details voluntarily provided during interactive assistance sessions.
3. **Careers and Recruitment:** Candidate name, contact details, curriculum vitae (CV/resume), employment history, education, portfolio links, and communication records.
4. **Business Partners & Brokers:** Official business name, legal entity structure, GSTIN/tax identification (where provided), contact person details, bank disbursement details (for approved commission payouts), and transaction records.
5. **Authenticated Portal Users:** Login credentials (passwords stored using salted argon2/bcrypt hashes), role-based session tokens, activity logs, task assignments, and internal communications.
6. **Technical & Telemetry Data:** IP addresses, browser user agent, device characteristics, referral URLs, access timestamps, and necessary session cookies.

## 4. How We Use Personal Data

We process your personal information for:
- Delivering bespoke software development, AI solutions, web and mobile application engineering services.
- Responding to inquiries, preparing custom Statements of Work (SOW), and issuing project estimates.
- Administering user authentication, role-based access control (RBAC), and session security.
- Managing recruitment, candidate evaluation, and interview scheduling.
- Operating the Business Partner and Broker referral programs, including commission calculations and contract fulfillment.
- Preventing security incidents, automated spam attacks, and fraudulent activity.
- Fulfilling statutory compliance, tax reporting, and audit requirements.

## 5. Cookies, Local Storage & Tracking Technologies

Axivon uses first-party and select third-party cookies:
- **Strictly Necessary Cookies:** Essential for session state, CSRF protection, and Cloudflare Turnstile anti-bot verification. These cannot be disabled.
- **Preferences Cookies:** Remember user choices, such as active UI mode and dismissed announcements.
- **Analytics Cookies (Google Analytics 4):** Measures aggregated visitor interactions and navigation paths. **Analytics scripts are executed ONLY after explicit affirmative consent via our Cookie Preferences modal.**
- **Marketing Cookies:** We do not sell your personal data or employ invasive cross-site advertising trackers.

You may update or withdraw your cookie preferences at any time via the [Cookie Preferences](/cookie-preferences) portal or the persistent "Cookie Settings" trigger in our footer.

## 6. Disclosures and Sub-Processors

We do not sell, rent, or trade personal data. We disclose information only to vetted third-party service providers bound by strict confidentiality and data protection agreements:
- **Cloud Infrastructure & Hosting:** Vercel Inc. and AWS (secure cloud compute and edge delivery).
- **Database & Storage:** Managed PostgreSQL database instances with encryption at rest and in transit.
- **Security & Bot Protection:** Cloudflare Turnstile for automated threat mitigation.
- **Analytics:** Google LLC (only upon affirmative opt-in consent).
- **Communication Infrastructure:** Transactional email and notification delivery providers.

## 7. Cross-Border Data Transfers

When data is transferred outside India to global cloud service providers, transfers are conducted in full compliance with the provisions of the DPDP Act 2023 and applicable cross-border transfer guidelines, ensuring equivalent organizational and technical safeguards.

## 8. Data Security and Safeguards

We implement defense-in-depth security measures:
- Transport Layer Security (TLS 1.3) for all web traffic.
- AES-256 encryption at rest for sensitive database stores and document attachments.
- Strict Role-Based Access Control (RBAC) with principle of least privilege.
- Multi-factor authentication support and automated rate limiting on API endpoints.
- Vulnerability monitoring and regular automated dependency audits.

## 9. Data Retention and Deletion

We retain personal data only for as long as required to fulfill the purposes for which it was collected, or as required by statutory record-keeping rules:
- **General Inquiries:** Retained for 24 months post-resolution unless an ongoing commercial relationship is established.
- **Commercial & Project Records:** Retained for 7 years to satisfy statutory accounting, tax, and legal liability obligations.
- **Job Applicant Resumes:** Retained for up to 12 months for active consideration, unless earlier erasure is requested.
- **Session & Telemetry Logs:** Retained for up to 90 days for security analysis.

## 10. Your Rights Under DPDP Act 2023

As a Data Principal under India's DPDP Act 2023, you hold the following statutory rights:
- **Right to Access Information:** Request a summary of personal data processed by us and the processing identities.
- **Right to Correction and Erasure:** Request correction of inaccurate or misleading data, updating of incomplete data, or deletion of data no longer necessary.
- **Right of Grievance Redressal:** Submit grievances regarding data processing directly to our designated Grievance Officer.
- **Right to Nominate:** Nominate an individual to exercise your rights in the event of death or incapacity.

To exercise any of these rights, submit a verified request through our [Privacy Requests Portal](/privacy-requests) or contact our Grievance Officer.

## 11. Grievance Officer & Contact Details

In compliance with the DPDP Act 2023 and the Information Technology Act 2000, our designated Grievance Officer is:

- **Designation:** Grievance Officer & Data Protection Lead
- **Entity:** Axivon Technologies
- **Email:** support@axivontech.in (cc: founder@axivontech.in)
- **Response Timeline:** We acknowledge all statutory grievances within 48 hours and provide a substantive resolution within 30 calendar days.`,
  },
  {
    id: "policy-terms",
    slug: "terms",
    title: "Terms & Conditions",
    category: "CORE_LEGAL",
    summary:
      "General Terms of Service governing access to the Axivon Technologies public website, AXIVON ONE enterprise portals, software development agreements, statements of work, and acceptable platform conduct.",
    version: "2.0.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Legal & Contracts Team",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Acceptance of Terms

By accessing or using the website **https://axivontech.in**, engaging our engineering services, or accessing any authenticated module within **AXIVON ONE**, you agree to be bound by these Terms & Conditions ("Terms"). If you represent an organization, you affirm that you possess the requisite authority to bind that entity.

## 2. Services and Custom Engagements

Axivon Technologies provides bespoke software engineering, enterprise web and mobile development, artificial intelligence integration, UI/UX design, and business automation solutions.

Individual commercial engagements are formalized through signed **Statements of Work (SOW)** or Master Services Agreements (MSA). In the event of an explicit conflict between these general online Terms and an executed SOW signed by authorized signatories, the executed SOW shall govern for that specific project.

## 3. User Accounts and Portal Security

1. **Access Credentials:** You are responsible for safeguarding login credentials issued for AXIVON ONE portals (Admin, Client, Employee, Broker, Business Partner).
2. **Unauthorized Use:** You must immediately notify Axivon of any unauthorized account activity or security breach.
3. **Suspension & Termination:** Axivon reserves the right to suspend or terminate accounts that breach these Terms, compromise platform security, or fail to satisfy payment obligations.

## 4. Client Obligations & Collaboration

For custom software engagements, the client agrees to:
- Provide timely technical specifications, brand assets, API credentials, and project approvals.
- Designate authorized points of contact for milestone sign-offs.
- Understand that delays in client feedback or provision of necessary third-party assets may alter delivery timelines.

## 5. Intellectual Property Rights

- **Pre-Existing IP:** Axivon retains sole ownership of its proprietary frameworks, reusable libraries, architectural patterns, design components, and foundational tooling ("Axivon Core").
- **Deliverables:** Upon full and final settlement of all invoiced milestone amounts, Axivon assigns to the client the exclusive rights to custom project code, bespoke UI designs, and database schemas developed specifically for the client under the applicable SOW.
- **Open-Source Components:** Third-party open-source libraries integrated into projects remain subject to their respective open-source licenses (e.g., MIT, Apache 2.0).

## 6. Payment, Invoicing and Milestones

All services are delivered according to milestone schedules set forth in the project SOW. Unless otherwise specified:
- Invoices are payable within 7 business days of issuance.
- Project kickoff occurs upon receipt of the agreed commencement advance.
- Work on subsequent milestones commences upon formal sign-off and settlement of the preceding milestone.
- Taxes (such as GST in India) are levied at prevailing statutory rates.

## 7. Limitation of Liability

To the maximum extent permitted by applicable law:
- Neither party shall be liable for indirect, incidental, consequential, special, or punitive damages, including loss of profits, data, or business goodwill.
- Axivon's total aggregate liability arising out of or related to any project engagement shall not exceed the total fees paid by the client under the specific Statement of Work giving rise to the claim in the twelve (12) months preceding the incident.

## 8. Governing Law and Dispute Resolution

These Terms and any project engagements shall be governed by and construed in accordance with the laws of **India**.

Any dispute, controversy, or claim arising out of or relating to these Terms shall first be addressed through good-faith executive negotiations. If unresolved within thirty (30) days, the dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, before a sole arbitrator mutually agreed upon, conducted in the English language, with seat and venue in India. Courts located in India shall have exclusive supervisory jurisdiction.`,
  },
  {
    id: "policy-cookie",
    slug: "cookie-policy",
    title: "Cookie Policy",
    category: "PRIVACY_DATA",
    summary:
      "Detailed transparency regarding the classification, lifespan, providers, and purpose of cookies and browser storage mechanisms utilized on Axivon Technologies websites and portals.",
    version: "2.0.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Privacy Engineering Team",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. What Are Cookies?

Cookies are small text files placed on your device by websites you visit. They are widely used to make websites function efficiently, remember preferences, maintain secure login sessions, and provide aggregated analytics to site operators.

## 2. Cookie Categories Used by Axivon

We organize cookies and local storage tokens into four distinct categories:

### A. Strictly Necessary Cookies (Always Active)
These cookies are indispensable for website operations, routing, session security, and anti-abuse protection. Without these, the site cannot function properly:
- \`axivon_session\`: Manages encrypted authentication state for portal users (Session lifespan).
- \`cf_clearance\` / Cloudflare Turnstile: Anti-bot challenge verification to shield submission forms against automated spam.
- \`axivon_consent_preferences\`: Stores your affirmative cookie category choices (1 year lifespan).

### B. Preferences & Functional Cookies (Optional)
These cookies store your preferences to enhance your user experience:
- Theme settings and dismissed announcement banners.
- Preferred currency or language choices.

### C. Performance & Analytics Cookies (Optional - Gated)
These cookies help us analyze visitor interactions, traffic sources, and popular content:
- \`_ga\` / \`_ga_*\`: Google Analytics cookies used to calculate visitor, session, and campaign data (Up to 2 years lifespan).
- **Enforcement:** Analytics tracking scripts are strictly blocked until you explicitly grant consent through our Cookie Banner or Preference Center.

### D. Marketing & Advertising Cookies (Optional - Gated)
Axivon does not deploy third-party advertising tracking cookies or engage in behavioural cross-site tracking. Any campaign referral attribution cookies are first-party and expire within 30 days.

## 3. Comprehensive Cookie Audit Table

| Cookie Identifier | Provider | Category | Purpose | Expiration |
| :--- | :--- | :--- | :--- | :--- |
| \`axivon_session\` | Axivon Technologies | Strictly Necessary | Authenticated portal session management | Session / 7 Days |
| \`axivon_consent_preferences\` | Axivon Technologies | Strictly Necessary | Records user cookie consent preferences | 12 Months |
| \`cf_clearance\` | Cloudflare Inc. | Strictly Necessary | Bot prevention and security validation | 12 Months |
| \`_ga\` | Google LLC | Analytics (Optional) | Distinguishes unique website visitors | 24 Months |
| \`_ga_*\` | Google LLC | Analytics (Optional) | Maintains session state and metrics | 24 Months |

## 4. How to Manage and Revoke Consent

You can manage your cookie preferences at any time:
1. Open our dedicated [Cookie Preferences Manager](/cookie-preferences).
2. Click the floating **Cookie Settings** button present on all public web pages.
3. Configure your browser settings to reject or delete cookies (note that disabling strictly necessary cookies may impair portal functionality).`,
  },
  {
    id: "policy-disclaimer",
    slug: "disclaimer",
    title: "Legal Disclaimer",
    category: "CORE_LEGAL",
    summary:
      "Clarification regarding website informational content, technical project estimates, AI conversational assistant outputs, and third-party service dependencies.",
    version: "1.2.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Legal Counsel",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. General Informational Notice

The information provided on **https://axivontech.in** is for general informational and educational purposes regarding Axivon Technologies' engineering capabilities, portfolio, and service offerings. While we endeavor to keep content accurate and up to date, we make no warranties of any kind regarding completeness or suitability.

## 2. Technical Estimates & Project Timelines

- Portfolio case studies, live demo prototypes, architectural blueprints, and published pricing indicators represent engineering examples and illustrative benchmarks.
- Official commercial commitments, scope definitions, exact delivery schedules, and service level agreements (SLAs) are established solely through executed Statements of Work (SOW) signed by authorized representatives of Axivon Technologies.

## 3. AI Assistant Disclosures

Our website features an intelligent conversational assistant (**Axivon AI**) to guide visitors through our services, portfolio, and inquiry capture:
- **Informational Benchmark:** Outputs generated by the AI assistant are intended for quick assistance and general orientation.
- **Human Verification:** Technical architecture proposals, formal estimates, and commercial quotations generated by AI are subject to review, validation, and formal confirmation by our engineering and executive teams.
- **No Legal or Financial Advice:** Responses provided by the AI assistant do not constitute legal, tax, or investment advice.

## 4. Third-Party Integrations and External Links

Our software solutions frequently integrate with third-party APIs, cloud providers, and payment gateways. Axivon is not responsible for the performance, terms of service, uptime, or privacy practices of independent third-party platforms.`,
  },
  {
    id: "policy-company-info",
    slug: "company-information",
    title: "Company Legal Information",
    category: "CORE_LEGAL",
    summary:
      "Official corporate identity details, registered business particulars, contact channels, operating jurisdiction, and statutory officers.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Corporate Secretariat",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: ["Corporate Identification Number (CIN)", "GST Registration Certificate Copy"],
    content: `## 1. Corporate Identity

- **Trading Name:** Axivon Technologies
- **Enterprise Platform:** AXIVON ONE
- **Official Website:** https://axivontech.in
- **Industry Classification:** Custom Software Development, AI Solutions & Enterprise Technology Services
- **Jurisdiction:** Republic of India

## 2. Official Communication Channels

- **General Inquiries:** support@axivontech.in
- **Executive & Management:** founder@axivontech.in
- **Careers & Talent:** careers@axivontech.in
- **Technical & Security Alerts:** security@axivontech.in
- **Privacy & Statutory Compliance:** support@axivontech.in (Attn: Grievance Officer)

## 3. Statutory Verification & Corporate Notice

> [!NOTE]
> Axivon Technologies operates as an active technology and software engineering consultancy based in India. Official tax documentation (GSTIN) and formal invoices are furnished alongside signed project Statements of Work (SOW). Corporate registrations pending updated administrative publication are tracked under internal governance record REF-AXV-CORP-2026.

## 4. Grievance Officer

In accordance with the Information Technology Act 2000 and Digital Personal Data Protection Act 2023:
- **Designation:** Grievance Officer & Data Protection Officer
- **Email:** support@axivontech.in
- **Location:** India
- **Acknowledgement:** Within 48 hours of receipt.
- **Redressal Target:** Within 30 days.`,
  },
  {
    id: "policy-refund",
    slug: "refund-cancellation-policy",
    title: "Refund & Cancellation Policy",
    category: "COMMERCIAL",
    summary:
      "Detailed guidelines on project milestone billing, non-refundable commencement retainers, cancellation procedures, and defect warranty periods for custom software services.",
    version: "1.3.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Commercial Finance Directorate",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Professional Services & Milestone Structure

Axivon Technologies provides bespoke, time-intensive professional software engineering and consulting services. Because engineering resources, cloud infrastructure, and technical personnel are committed specifically to each engagement upon kickoff, standard retail consumer refund rules do not apply.

All engagements follow a **Milestone-Based Delivery & Billing Schedule** defined in the project's Statement of Work (SOW).

## 2. Commencement Retainers and Initial Deposits

- The initial deposit (commencement advance) secured prior to project initiation covers project scoping, architecture design, wireframing, and sprint resource reservation.
- **Non-Refundability:** Commencement retainers are non-refundable once architectural discovery, technical planning, or code implementation has begun.

## 3. Milestone Completion and Acceptance

- Work is broken into transparent, verifiable milestones (e.g., UI/UX approval, Alpha prototype, Beta integration, Final deployment).
- Upon delivery of a milestone, the client has a standard **Review Period** (typically 7 to 10 business days as defined in the SOW) to test deliverables against agreed acceptance criteria.
- Formal approval or failure to submit written defect notices within the review period constitutes acceptance of the milestone.
- Once a milestone is accepted and approved, fees associated with that milestone are non-refundable.

## 4. Project Cancellation Procedures

Either party may terminate an ongoing project engagement upon written notice under the following conditions:
1. **Cancellation for Convenience:** The client may terminate an engagement by providing fourteen (14) days written notice. The client remains responsible for payment of all work completed up to the date of termination, calculated on an agreed pro-rata or milestone basis.
2. **Cancellation for Cause:** Either party may terminate if the other party breaches a material term of the agreement and fails to cure such breach within thirty (30) days of receiving written notice.
3. **Delivery of Work-in-Progress:** Upon settlement of all outstanding invoices up to the cancellation date, Axivon will deliver all completed code, designs, and documentation created for the project.

## 5. Post-Delivery Warranty and Defect Remediation

All completed custom projects include a complimentary **30-Day Defect Warranty Period** commencing on final production deployment:
- Axivon will remediate any reproducible bugs or functional defects that deviate from the agreed specifications at zero additional cost.
- New feature requests, scope changes, or issues arising from third-party API alterations outside our control are handled via standard change requests.`,
  },
  {
    id: "policy-delivery",
    slug: "service-delivery-policy",
    title: "Service Delivery Policy",
    category: "COMMERCIAL",
    summary:
      "Explains the Axivon project lifecycle, discovery stages, agile sprints, staging environments, user acceptance testing (UAT), and final deployment handoff.",
    version: "1.2.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Engineering Operations",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Project Lifecycle & Delivery Methodology

Axivon Technologies applies an agile, sprint-driven engineering process to ensure transparency, velocity, and technical excellence throughout the development lifecycle.

The standard delivery process encompasses:
1. **Discovery & Architecture:** Technical requirements gathering, system design, tech stack selection, and database modeling.
2. **Interactive UI/UX Prototyping:** High-fidelity Figma designs, user journeys, design system tokens, and interactive wireframes.
3. **Sprint Execution:** Two-week sprint cycles with continuous integration, automated testing, and milestone check-ins.
4. **Staging & Acceptance Testing:** Deployment to isolated staging environments for client review, regression testing, and UAT sign-off.
5. **Production Deployment & Handoff:** Infrastructure provisioning, DNS configuration, SSL setup, database migration, and knowledge transfer.

## 2. Staging Environments & Client Verification

Clients are provided dedicated access to secure preview staging instances:
- Staging environments mirror production architecture without exposing live user data.
- Clients can test features, provide feedback, and verify responsive performance across desktop, tablet, and mobile devices.

## 3. Change Management & Out-of-Scope Requests

To protect delivery timelines and cost predictability:
- Any requested modification that departs from the agreed SOW is formally evaluated under our **Change Request (CR)** protocol.
- Axivon prepares an impact analysis detailing any cost or timeline adjustments.
- Work on out-of-scope items commences only after written client approval of the Change Request.

## 4. Final Handoff & Knowledge Transfer

Upon project completion and final milestone settlement:
- Full source code repositories are transferred to the client's designated GitHub/GitLab account.
- Complete documentation, environment variable guides, and API schemas are provided.
- An interactive administrative walkthrough is conducted for the client's team.`,
  },
  {
    id: "policy-payment",
    slug: "payment-terms",
    title: "Payment & Billing Terms",
    category: "COMMERCIAL",
    summary:
      "Guidelines regarding accepted payment methods, currency handling, milestone invoicing, tax applicability (GST), and late settlement terms.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Finance Directorate",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Invoicing & Milestone Payments

Invoices are issued electronically upon completion of project milestones as outlined in the executed Statement of Work (SOW). Standard payment terms are **Net 7 Days** from invoice transmission unless specified otherwise.

## 2. Accepted Payment Methods

- **Bank Wire Transfer (NEFT / RTGS / IMPS):** Preferred for domestic settlements in India.
- **International Wire Transfer (SWIFT):** For overseas clients, denominated in USD or EUR.
- **UPI & Corporate Debit/Credit Cards:** Supported for retainers and consultation bookings.
- All bank transfer details are provided directly on official invoices issued by Axivon Technologies.

## 3. Currency and Taxes

- Invoices for Indian domestic clients are denominated in **Indian Rupees (INR)** and subject to applicable Goods and Services Tax (GST).
- Invoices for overseas clients are denominated in **US Dollars (USD)** or other mutually agreed currencies, with foreign exchange transaction fees borne by the remitter.

## 4. Late Payment and Project Pausing

Timely settlement allows us to maintain dedicated engineering allocation. In the event an invoice remains unpaid beyond 14 calendar days from the due date:
- Axivon reserves the right to temporarily pause development sprints and staging server access.
- Work resumes promptly upon receipt of full outstanding amounts.`,
  },
  {
    id: "policy-ip",
    slug: "intellectual-property",
    title: "Intellectual Property Policy",
    category: "CORE_LEGAL",
    summary:
      "Clarification of custom code ownership, Axivon Core frameworks, open-source library licenses, trademarks, and portfolio showcase permissions.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Legal & IP Advisory",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Ownership of Custom Deliverables

Upon full and final payment of all fees due under the applicable Statement of Work (SOW):
- The client acquires all right, title, and interest in and to the custom software, unique database schemas, bespoke graphic assets, and specific business logic developed exclusively for the client.
- Axivon executes all necessary assignments to vest full ownership in the client.

## 2. Background Technology & Axivon Core

Axivon retains ownership of its pre-existing tools, software libraries, architecture templates, automation scripts, and generalized code developed prior to or independently of the client engagement ("Background IP"):
- Axivon grants the client a perpetual, worldwide, non-exclusive, royalty-free license to use, execute, and modify the Background IP solely as incorporated into the client deliverables.

## 3. Open-Source Software

Our engineering solutions leverage established open-source libraries (e.g., Next.js, React, Tailwind CSS, PostgreSQL, Prisma). All open-source software remains governed by its respective licenses (e.g., MIT, Apache 2.0, BSD). Axivon ensures no restrictive "copyleft" licenses (such as GPL v3) are integrated into proprietary client codebases without prior written consent.

## 4. Portfolio Display Rights

Unless an explicit non-disclosure agreement (NDA) or white-label contract prohibits publicity, Axivon reserves the right to display a brief summary of the completed work, client logo, and screenshots in its engineering portfolio and marketing materials.`,
  },
  {
    id: "policy-acceptable-use",
    slug: "acceptable-use-policy",
    title: "Acceptable Use Policy",
    category: "COMPLIANCE",
    summary:
      "Rules governing the secure and lawful use of the Axivon website, AXIVON ONE multi-portal infrastructure, APIs, and communication channels.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Security Operations",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Scope and Applicability

This Acceptable Use Policy (AUP) applies to all users of **https://axivontech.in**, public API endpoints, AI customer support chatbots, and authenticated **AXIVON ONE** portals.

## 2. Prohibited Activities

You agree NOT to use Axivon systems, networks, or portals to:
1. **Security Violations:** Probe, scan, or test the vulnerability of any system, bypass authentication safeguards, or perform unauthorized penetration testing without prior written authorization.
2. **Denial of Service & Abuse:** Flood, overload, or launch denial-of-service (DoS) attacks against our servers, APIs, or database systems.
3. **Malicious Payloads:** Transmit or upload viruses, trojans, worms, ransomware, or malicious code through file upload or contact mechanisms.
4. **Automated Scraping & Bots:** Deploy automated scrapers, crawlers, or harvesting tools against protected portals without explicit API authorization.
5. **Impersonation & Fraud:** Misrepresent your identity, impersonate any Axivon personnel, or falsify referral or commission records.
6. **Harmful Content:** Transmit unlawful, defamatory, harassing, obscene, or fraudulent content.

## 3. Enforcement and Sanctions

Violations of this policy may result in immediate suspension or permanent termination of portal access, revocation of API privileges, and referral to law enforcement authorities where criminal conduct is suspected.`,
  },
  {
    id: "policy-security",
    slug: "security-policy",
    title: "Security & Vulnerability Disclosure",
    category: "COMPLIANCE",
    summary:
      "Our security architecture, vulnerability disclosure guidelines, safe harbor for ethical researchers, and infrastructure defense mechanisms.",
    version: "1.2.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Information Security Lead",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Security Architecture & Principles

At Axivon Technologies, security is engineered into every layer of our stack:
- **Encryption Everywhere:** All traffic is encrypted in transit using TLS 1.3 with strict HSTS headers. Sensitive database columns and stored documents are encrypted at rest using AES-256.
- **Robust Access Controls:** Enterprise Role-Based Access Control (RBAC) enforces strict boundaries between Founder, Admin, Employee, Client, Broker, and Partner roles.
- **Bot & Spam Mitigation:** Server-verified Cloudflare Turnstile anti-bot checks protect all public forms and authentication endpoints.
- **Credential Safety:** Passwords are hashed using salted cryptographic algorithms; plaintext passwords are never logged or stored.

## 2. Responsible Vulnerability Disclosure Program

We welcome reports from ethical security researchers to help us keep our platform safe. If you believe you have discovered a security vulnerability in Axivon systems:
1. Email your findings to **security@axivontech.in** (cc: **support@axivontech.in**).
2. Provide sufficient detail, including steps to reproduce, affected endpoints, and proof-of-concept payloads.
3. Allow us a reasonable timeframe (typically 30 business days) to investigate and remediate before public disclosure.

## 3. Safe Harbor Commitment

If you conduct vulnerability research in good faith and in compliance with this policy:
- We will not pursue legal action or report your activities to law enforcement.
- We will collaborate with you to understand and address the issue promptly.
- We will publicly acknowledge your contribution in our Security Hall of Fame (unless you request anonymity).`,
  },
  {
    id: "policy-privacy-requests",
    slug: "privacy-requests",
    title: "Privacy Rights & Request Instructions",
    category: "PRIVACY_DATA",
    summary:
      "Instructions on exercising data subject rights under India's DPDP Act 2023, submitting verification details, and tracking request status.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Data Protection Officer",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Your Statutory Rights as a Data Principal

Under India's **Digital Personal Data Protection Act, 2023 (DPDP Act)** and international privacy standards, you have the right to control how your personal information is collected and processed by Axivon Technologies.

You may submit requests for:
1. **Right to Access / Summary:** Obtain a confirmation of whether we process your personal data and receive a clear summary of data held.
2. **Right to Correction:** Update out-of-date information or correct inaccuracies in your profile, resume, or business details.
3. **Right to Erasure / Deletion:** Request the deletion of personal data no longer required for the purpose for which it was collected.
4. **Right to Withdraw Consent:** Revoke previously granted consent for marketing communications or optional cookies.
5. **Grievance Redressal:** Lodge a formal complaint regarding data handling with our designated Grievance Officer.

## 2. How to Submit a Request

1. Visit our self-service [Privacy Request Submission Form](/privacy-requests).
2. Provide your full name, verified email address, phone number (optional), and the specific nature of your request.
3. Complete the security Turnstile verification.
4. Upon submission, you will receive a unique **Tracking Reference ID** (e.g., \`PR-2026-XXXXXX\`).

## 3. Identity Verification & Timelines

To protect your personal data from unauthorized access:
- We verify requester identity before fulfilling sensitive disclosure or deletion requests.
- **Acknowledgement:** We acknowledge all requests within forty-eight (48) hours.
- **Resolution:** Requests are processed and resolved within thirty (30) calendar days in accordance with statutory guidelines.`,
  },
  {
    id: "policy-ai-usage",
    slug: "ai-usage",
    title: "AI Privacy & Usage Notice",
    category: "PRIVACY_DATA",
    summary:
      "Transparent disclosure regarding how Axivon AI Assistants operate, LLM data processing rules, human-in-the-loop validation, and confidential client data isolation.",
    version: "1.2.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "AI Systems Architect",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Axivon AI Architecture Overview

Axivon Technologies develops and operates specialized Artificial Intelligence assistants across our platform:
- **Public AI Assistant:** Interacts with prospective clients on our website to answer service questions, explore our portfolio, and capture inquiries.
- **Portal AI Assistants:** Provide role-aware productivity tools for authenticated Admins, Employees, Clients, Brokers, and Business Partners.

## 2. Data Protection and Model Training Guarantees

We enforce strict data isolation policies:
- **No Client Data Training:** Your proprietary business data, private communications, confidential project specifications, and codebase uploads are **NEVER** used to train public foundation models.
- **Zero-Retention API Agreements:** Enterprise API endpoints with AI providers utilize zero-retention / privacy-first data processing terms.
- **Role-Aware Context Isolation:** In multi-tenant portals, context embeddings and tool execution boundaries strictly match user authorization scopes.

## 3. Human Oversight & Validation

- AI recommendations, code snippets, and automated summaries are assistive tools designed to empower human professionals.
- Commercial proposals, technical architectures, and financial calculations generated with AI assistance are reviewed and validated by human engineers before contractual execution.`,
  },
  {
    id: "policy-careers-privacy",
    slug: "careers-privacy",
    title: "Careers & Applicant Privacy Notice",
    category: "PROGRAM_TERMS",
    summary:
      "Informs job candidates regarding the collection, review, background verification, and retention of resumes, portfolios, and employment applications.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Talent Acquisition Lead",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Information Collected from Applicants

When you apply for a career opportunity at Axivon Technologies, we collect:
- Personal contact information (full name, email, phone number, location).
- Employment background, educational qualifications, resume/CV documents, and portfolio URLs.
- Interview notes, technical evaluation test results, and candidate communication history.

## 2. Purpose and Legal Basis

We process candidate information to evaluate qualifications for open roles, schedule technical interviews, communicate hiring decisions, and maintain talent pools for future relevant vacancies.

## 3. Resume Retention and Deletion

- Successful applicants' records are transitioned into employee HR files governed by our internal Employee Privacy Policy.
- For applicants not selected, resumes and application materials are retained for up to twelve (12) months to consider you for emerging openings, after which records are securely purged.
- You may request earlier deletion of your application data at any time by contacting **careers@axivontech.in**.`,
  },
  {
    id: "policy-business-partner",
    slug: "business-partner-terms",
    title: "Business Partner Terms",
    category: "PROGRAM_TERMS",
    summary:
      "Governing agreement for organizations, agencies, and strategic technology partners collaborating with Axivon on co-development and client solutions.",
    version: "1.2.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Partnership Directorate",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Program Participation & Approval

Participation in the Axivon Business Partner Program requires formal application review, technical alignment verification, and executive approval. Upon onboarding, partners gain access to co-delivery opportunities, technical toolkits, and portal workflows.

## 2. Confidentiality & Non-Solicitation

- **Confidentiality:** Both parties agree to protect proprietary technical information, pricing schedules, and customer identities under mutual non-disclosure obligations.
- **Client Protection:** Partners agree not to circumvent Axivon or solicit direct client engagements originated through Axivon introductions during the partnership and for twelve (12) months following termination.

## 3. Revenue Share & Service Levels

Revenue sharing, milestone disbursements, and joint service level expectations are formalized in individual Partner Project agreements executed through the AXIVON ONE partner workspace.`,
  },
  {
    id: "policy-broker-terms",
    slug: "broker-terms",
    title: "Broker Referral & Commission Terms",
    category: "PROGRAM_TERMS",
    summary:
      "Defines referral link tracking, qualifying project criteria, commission calculation tiers, payout schedules, and anti-fraud provisions.",
    version: "1.2.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "Channel Sales Directorate",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Referral Tracking & Attribution

Registered Brokers in the Axivon ONE network receive unique referral links and project intake codes. A referral is attributed to a Broker when a client initiates a project through the designated link or explicitly identifies the Broker during onboarding.

## 2. Qualifying Engagements & Commission Payouts

- **Qualifying Deal:** A project qualifies for referral commission once a formal Statement of Work (SOW) is signed by the client and the initial commencement milestone is settled.
- **Commission Tiers:** Commissions are calculated as a percentage of qualifying service revenue as specified in the Broker's portal agreement.
- **Disbursement Schedule:** Commission payments are disbursed within thirty (30) days of Axivon receiving corresponding milestone settlements from the client.

## 3. Prohibited Conduct

Brokers must not engage in misleading representations, unauthorized pricing promises, or spam marketing campaigns. Violations will result in immediate termination of Broker status and forfeiture of unapproved commissions.`,
  },
  {
    id: "policy-accessibility",
    slug: "accessibility",
    title: "Accessibility Statement",
    category: "COMPLIANCE",
    summary:
      "Axivon Technologies' commitment to digital accessibility, conformance with WCAG 2.1 Level AA standards, keyboard navigation, and feedback reporting.",
    version: "1.1.0",
    status: "PUBLISHED",
    effectiveDate: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: "2026-10-15T00:00:00.000Z",
    reviewedBy: "UX & Frontend Directorate",
    publishedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
    missingDetails: [],
    content: `## 1. Our Commitment

Axivon Technologies is dedicated to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards across our public website and enterprise portals.

## 2. Conformance Status

We strive to conform to the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**. These guidelines explain how to make web content more accessible to people with visual, auditory, cognitive, and motor impairments.

Key accessibility features implemented:
- Semantic HTML structure with logical landmark regions (\`<main>\`, \`<nav>\`, \`<header>\`, \`<footer>\`).
- Full keyboard navigability with visible focus indicators for all interactive elements.
- Screen reader accessibility using ARIA attributes, semantic form labels, and descriptive link text.
- High color contrast ratios adhering to WCAG 2.1 AA standards across our dark palette.
- Respect for \`prefers-reduced-motion\` user settings, disabling intensive animations automatically.

## 3. Feedback and Support

If you encounter accessibility barriers on any Axivon web page or portal:
- Email us at **support@axivontech.in** with the subject "Accessibility Feedback".
- Provide the URL and a description of the issue encountered.
- We endeavor to respond to accessibility inquiries within two (2) business days.`,
  },
];

// ─────────────────────────────────────────────────────────────
// Database Access & Helper Functions
// ─────────────────────────────────────────────────────────────

export async function getPublishedPolicyBySlug(slug: string): Promise<LegalPolicyItem | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  // Alias checks (e.g. 'terms-and-conditions' -> 'terms', 'privacy' -> 'privacy-policy')
  let lookupSlug = normalizedSlug;
  if (lookupSlug === "terms-and-conditions") lookupSlug = "terms";
  if (lookupSlug === "privacy") lookupSlug = "privacy-policy";
  if (lookupSlug === "cookies") lookupSlug = "cookie-policy";
  if (lookupSlug === "ai-privacy" || lookupSlug === "ai-privacy-notice") lookupSlug = "ai-usage";

  try {
    const record = await db.legalPolicy.findFirst({
      where: {
        slug: lookupSlug,
        status: "PUBLISHED",
      },
    });

    if (record) {
      return {
        id: record.id,
        slug: record.slug,
        title: record.title,
        category: record.category as any,
        summary: record.summary,
        content: record.content,
        version: record.version,
        status: record.status as any,
        effectiveDate: record.effectiveDate.toISOString(),
        lastReviewedAt: record.lastReviewedAt.toISOString(),
        reviewedBy: record.reviewedBy,
        publishedAt: record.publishedAt?.toISOString() || null,
        requiresApproval: record.requiresApproval,
        missingDetails: record.missingDetails || [],
      };
    }
  } catch (err) {
    // Graceful fallback to static definitions if db is unavailable
  }

  // Fallback to static items
  const fallback = DEFAULT_LEGAL_POLICIES.find((p) => p.slug === lookupSlug);
  return fallback || null;
}

export async function getAllPublishedPolicies(): Promise<LegalPolicyItem[]> {
  try {
    const records = await db.legalPolicy.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
    });

    if (records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category as any,
        summary: r.summary,
        content: r.content,
        version: r.version,
        status: r.status as any,
        effectiveDate: r.effectiveDate.toISOString(),
        lastReviewedAt: r.lastReviewedAt.toISOString(),
        reviewedBy: r.reviewedBy,
        publishedAt: r.publishedAt?.toISOString() || null,
        requiresApproval: r.requiresApproval,
        missingDetails: r.missingDetails || [],
      }));
    }
  } catch (err) {
    // Database fallback
  }

  return DEFAULT_LEGAL_POLICIES.filter((p) => p.status === "PUBLISHED");
}

export async function getAllAdminPolicies(): Promise<LegalPolicyItem[]> {
  try {
    const records = await db.legalPolicy.findMany({
      orderBy: { updatedAt: "desc" },
    });

    if (records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category as any,
        summary: r.summary,
        content: r.content,
        version: r.version,
        status: r.status as any,
        effectiveDate: r.effectiveDate.toISOString(),
        lastReviewedAt: r.lastReviewedAt.toISOString(),
        reviewedBy: r.reviewedBy,
        publishedAt: r.publishedAt?.toISOString() || null,
        requiresApproval: r.requiresApproval,
        missingDetails: r.missingDetails || [],
      }));
    }
  } catch (err) {
    // Database fallback
  }

  return DEFAULT_LEGAL_POLICIES;
}

export async function seedDefaultPoliciesIfEmpty(): Promise<void> {
  try {
    const count = await db.legalPolicy.count();
    if (count === 0) {
      for (const p of DEFAULT_LEGAL_POLICIES) {
        await db.legalPolicy.create({
          data: {
            slug: p.slug,
            title: p.title,
            category: p.category,
            summary: p.summary,
            content: p.content,
            version: p.version,
            status: p.status,
            effectiveDate: new Date(p.effectiveDate),
            lastReviewedAt: new Date(p.lastReviewedAt),
            reviewedBy: p.reviewedBy,
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
            requiresApproval: p.requiresApproval,
            missingDetails: p.missingDetails,
          },
        });
      }
    }
  } catch (err) {
    // Safe ignore if database is unready
  }
}
