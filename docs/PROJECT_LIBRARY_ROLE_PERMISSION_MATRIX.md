# AxivonTech Project Library — Role & Permission Matrix

**System:** Axivon Technologies Authenticated Business Application  
**Module:** Project Library (Completed Projects Archive & Management System)  
**Security Standard:** Strict Server-Side Field-Level Enforcement & Cryptographic JWT Verification  
**Date:** November 7, 2026  

---

## 1. Executive Permission Model Overview

The AxivonTech Project Library enforces strict role-based access control (RBAC). Access boundaries are evaluated entirely server-side in API route handlers and middleware. Client requests are checked against validated session cryptographic JWT cookies (`axivon_session`). Client-supplied headers, query parameters, or body role flags are never trusted.

---

## 2. Comprehensive Role Permission Matrix

| Capability / Resource | ADMIN | FOUNDER | CO-FOUNDER | MANAGER / DEPT MANAGER | BROKER / BUSINESS PARTNER | EMPLOYEE | CLIENT / USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Access Project Library Module** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 👁️ Restricted Read | 👁️ Restricted Read | 👁️ Restricted Read |
| **View Project Name** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Project Industry / Field** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Project Live URL** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Project Completion Date** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Short / Full Description** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Problem & Solution Delivered**| ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Scope of Work & Deliverables** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Delivered Features Checklist** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Technical Architecture & Stack**| ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Frontend / Backend Technologies**| ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Database & API Integrations** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Hosting & Dev Tools** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Project Media & Screenshots** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Supporting Documents** | ✅ | ✅ | ✅ | ✅ | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) | ❌ Restricted (Stripped) |
| **View Internal Notes & Delivery Team** | ✅ | ✅ | ✅ | ✅ | ❌ Forbidden (403/Masked)| ❌ Forbidden (403/Masked)| ❌ Forbidden (403/Masked)|
| **View Audit History / Logs** | ✅ | ✅ | ✅ | ✅ | ❌ Forbidden (403/Masked)| ❌ Forbidden (403/Masked)| ❌ Forbidden (403/Masked)|
| **Create New Project Record** | ✅ | ✅ | ✅ | ✅ | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Edit Existing Project Details** | ✅ | ✅ | ✅ | ✅ | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Upload Screenshots & Documents** | ✅ | ✅ | ✅ | ✅ | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Client Presentation Mode** | ✅ | ✅ | ✅ | ✅ | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Excel Export Format** | 📊 4 Sheets (Full Workbook) | 📊 4 Sheets (Full Workbook) | 📊 4 Sheets (Full Workbook) | 📊 4 Sheets (Full Workbook) | 📄 1 Sheet (4 Columns Only) | 📄 1 Sheet (4 Columns Only) | 📄 1 Sheet (4 Columns Only) |
| **Soft Archive Project** | ✅ | ✅ | ✅ | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Restore Archived Project** | ✅ | ✅ | ✅ | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) | ❌ Forbidden (403) |

---

## 3. Strict Server-Side Field Sanitization Policy

### 3.1 Restricted Read-Only Users (Broker, Employee, Client, User)
When any non-write role queries `GET /api/v1/project-library` or `GET /api/v1/project-library/[id]`, the server strictly executes `sanitizeProjectRecord` which strips all fields except:
1. `name`: Project Name
2. `industry`: Project Field / Industry
3. `liveUrl`: Project Live URL
4. `completionDate`: Project Completion Date
*(Includes `id`, `slug`, and `status` for UI card routing and status badging).*

No database fields for `internalNotes`, `confidentialData`, `shortDescription`, `problem`, `solution`, `features`, `technologies`, `assets`, `documents`, or `auditLogs` are ever sent to read-only clients. Protection is not applied with CSS or visual hiding; data is excluded at the API serialization boundary.

### 3.2 Excel Export Security
1. **Write Roles (`ADMIN`, `FOUNDER`, `CO_FOUNDER`, `MANAGER`):**
   - **Sheet 1:** Project Summary (Project ID, Name, Client, Industry, Type, Status, Completion Date, Live URL)
   - **Sheet 2:** Project Details (Overview, Requirements, Solution, Scope, Deliverables, Features, Technologies)
   - **Sheet 3:** Project Timeline (ID, Name, Start Date, Completion Date, Status, Created Date, Updated Date)
   - **Sheet 4:** Project Resources (ID, Name, Resource Title, Resource Type, Resource URL)
2. **Read-Only Roles (`BROKER`, `EMPLOYEE`, `USER`):**
   - **Sheet 1:** Completed Projects (Project Name, Industry / Field, Live Website URL, Completion Date)
   - Exactly 4 columns. No additional sheets or hidden tabs.
3. **Formula Injection Neutralization:**
   - Any user-controlled string starting with `=`, `+`, `-`, or `@` is prefixed with `'` to prevent CSV/Excel DDE command execution.

---

## 4. Client Presentation Mode Isolation
Presentation mode (`GET /api/v1/project-library/[id]/presentation`) provides a customer-ready showcase specifically designed for sales meetings with prospects.
- **Included Data:**
  - Approved Project Name
  - Industry & Project Type
  - Approved Public Description & Solution Delivered
  - Public Website Screenshots & Gallery Images
  - Production Live URL
  - Delivered Features Highlights
  - Technology Highlights
  - Presenter Guidance Notes (visible to presenter)
- **Strictly Excluded Data:**
  - Internal Notes
  - Commercial Pricing & Payouts
  - Commission Structures
  - Internal Engineering Team Assignments
  - Database Credentials & API Secrets
  - Confidential Client Contact Details
  - Internal Delivery Defect Notes
