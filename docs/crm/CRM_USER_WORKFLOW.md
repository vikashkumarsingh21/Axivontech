# CRM User Workflow for Axivon Technologies

This document outlines the standard operating procedure (SOP) for managing incoming leads and business opportunities via the internal CRM.

## 1. Lead Intake
- **Website Submission:** A visitor fills out the contact or consultation form on `axivontech.in`.
- **Automatic Intake:** The system validates the submission, generates a unique Lead Code (e.g., `LD-YYYYMMDD-0001`), and creates the record in the CRM.
- **Notifications:** Authorized staff (Founders, Admins, Sales) immediately receive a System Notification inside their portal, and a summary email is sent to `info@axivontech.in`.

## 2. Duplicate Handling
- If a lead shares an email or phone number with a lead from the past 30 days, it is flagged as a duplicate.
- A CRM operator should review flagged duplicates. Both records are preserved—staff can choose to archive the old one or note the new one as a repeat contact.

## 3. Initial Triage
- Navigate to **Admin -> CRM -> Leads**.
- The lead will be marked as **NEW**.
- A CRM-enabled user opens the lead and reviews the *Service Interest* and *Message*.
- The user claims the lead (Assigns themselves as the Owner) and contacts the lead via Phone, Email, or WhatsApp.
- The Status is updated to **CONTACTED**.

## 4. Qualification
- After a discovery conversation, the user determines if the prospect is viable.
- The lead's Qualification Status is updated to **QUALIFIED**, **UNQUALIFIED**, or **NURTURE**.
- If Unqualified, an activity note should be left explaining why (e.g. "budget too small", "out of scope").
- If Nurture, a **Follow-up** task is scheduled for a future date (e.g., 3 months from now).

## 5. Opportunity Pipeline
- Once **QUALIFIED**, the lead is converted into an **Opportunity**.
- Navigate to **Pipeline** to track the opportunity through stages:
  1. Discovery
  2. Proposal
  3. Negotiation
  4. Won / Lost

## 6. Proposals
- During the Proposal stage, a Proposal record is generated indicating amount, validity, and document link.
- Update the Proposal status from **DRAFT** -> **SENT** -> **ACCEPTED**.

## 7. Client Conversion
- Upon winning the deal (Proposal Accepted / Opportunity WON), the Opportunity is marked **WON**.
- The underlying CRM Lead is converted into a **Client**.
- The Client profile now becomes the central hub for ongoing project management and billing communications. The historical Lead timeline remains intact for reference.
