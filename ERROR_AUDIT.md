# Comprehensive Error Handling Audit (ERROR_AUDIT.md)

**Generated:** 2026-10-25T18:19:28.597Z  
**Codebase:** Axivon Technologies (Next.js 16 App Router, React 19, Zod, Tailwind v4)  
**Branch:** `error-handling-fix`

---

## 1. Executive Summary & Root Cause Analysis

### The Problem
When authentication fails (e.g., incorrect password on `/login`), users are greeted with a red banner displaying:
```
[object Object]
```
instead of a helpful, human-readable message like `"Incorrect email or password."`

### The Root Cause
1. **API Response Structure**: The backend standard error handler (`handleApiError` in `src/lib/api-error.ts`) returns JSON with:
   ```json
   {
     "success": false,
     "error": {
       "code": "API_ERROR",
       "message": "Invalid email or password"
     },
     "message": "Invalid email or password"
   }
   ```
   Here, `response.error` is an **object** (`{ code, message, fields }`).
2. **Frontend String Coercion**: In client code across forms (e.g., `src/app/login/page.tsx:118`):
   ```ts
   const data = await res.json();
   if (!res.ok) {
     throw new Error(data.error || "Login failed");
   }
   ```
   In JavaScript, `new Error(obj)` calls `String(obj)`, which evaluates to `"[object Object]"`.
3. **JSX Rendering**:
   ```tsx
   <span role="alert">{error}</span>
   ```
   The string `"[object Object]"` is directly injected into the DOM.
4. **Widespread Proliferation**: Over 70+ client pages and components across Admin, Broker, Client, Employee, Executive, and Public portals follow this exact pattern, or use native browser `alert(err.message)`.

---

## 2. Deep Dive: `/login` and `POST /api/v1/auth/login`

The authentication endpoint (`src/app/api/v1/auth/login/route.ts`) and client page (`src/app/login/page.tsx`) were audited across all 11 failure and edge cases:

| Failure Scenario | HTTP Status | Backend Response Body Shape | Current Frontend Behavior | Root Cause | Desired Behavior |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Wrong Password** | 401 | `{ success: false, error: { code: "API_ERROR", message: "Invalid email or password" }, message: "..." }` | Red box displays `"[object Object]"` | `new Error(data.error)` coerces object to string | Show `"Incorrect email or password."`, clear password, focus password input, reset captcha |
| **Unknown Email** | 401 | `{ success: false, error: { code: "API_ERROR", message: "Invalid email or password" }, message: "..." }` | Red box displays `"[object Object]"` | `new Error(data.error)` coerces object to string | Show `"Incorrect email or password."` (identical message to prevent user enumeration) |
| **Empty Fields (Email / Password)** | 400 | Client prevents submit or API returns `{ success: false, error: { code: "VALIDATION_ERROR", message: "Password is required", fields: { password: [...] } } }` | General error box or `"[object Object]"` | Validation issues not mapped to form inputs | Display field-level inline error below the specific empty input |
| **Invalid Email Format** | 400 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email", fields: { email: [...] } } }` | General error box or `"[object Object]"` | `fields` array ignored | Display `"Please enter a valid work email address."` under email input |
| **Missing CAPTCHA Verification** | 400 | `{ error: "Please complete the human verification before submitting this form.", code: "MISSING_TOKEN", requiresCaptchaReset: true }` | Client blocks submit with generic message or API returns 400 | Inconsistent string error format | Show `"Please confirm you are not a robot."`, reset captcha widget |
| **Failed / Expired CAPTCHA** | 400 / 503 | `{ error: "Security verification failed. Please try again.", code: "PROVIDER_TIMEOUT", requiresCaptchaReset: true }` | Red box displays `"Security verification expired..."` | String error handled, but captcha widget state not cleanly reset | Show `"Security verification expired. Please verify again."`, reset captcha widget |
| **429 Rate Limit (Brute Force)** | 429 | `{ error: "Too many login attempts. Please try again later." }` with `Retry-After: N` header | Red box displays raw error message without countdown | `Retry-After` header is ignored by client | Show `"Too many attempts. Please try again in N seconds."`, disable button with active countdown timer |
| **Suspended / Inactive Account** | 403 | `{ success: false, error: { code: "API_ERROR", message: "Account is SUSPENDED. Please check your email or contact support." } }` | Red box displays `"[object Object]"` | Object coercion in `new Error(data.error)` | Show human-readable reason message with support link (`admin@axivon.com`) |
| **Must Change Password / Activation** | 403 | `{ success: false, error: { code: "API_ERROR", message: "Please complete your account activation..." } }` | Red box displays `"[object Object]"` | Object coercion in `new Error(data.error)` | Display friendly instructions with activation link |
| **Internal Server Error / DB Offline** | 500 | `{ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }` or plain HTML 500 | Red box displays `"[object Object]"` or JSON parse crash | Non-JSON response crashes `res.json()` | Show `"Could not reach the server. Check your connection and try again."` |
| **Network Failure (Offline / Disconnected)** | 0 | None (Browser `TypeError: Failed to fetch`) | Red box displays `"Failed to fetch"` | Raw exception message displayed | Show `"Could not reach the server. Check your connection and try again."` |

---

## 3. Backend API Error Response Shapes Inventory

Across `src/app/api/`, seven distinct response shapes are returned during error conditions (HTTP 4xx and 5xx):

1. **Standard `handleApiError` Response (Most API v1 Routes)**:
   ```json
   {
     "success": false,
     "error": {
       "code": "VALIDATION_ERROR | API_ERROR | DUPLICATE_RECORD | NOT_FOUND | SCHEMA_ERROR",
       "message": "Human readable description",
       "fields": {
         "fieldName": ["Validation issue 1", "Validation issue 2"]
       }
     },
     "message": "Human readable description",
     "details": {}
   }
   ```

2. **Single String `error` Field (Rate limiting, Captcha, Lightweight endpoints)**:
   ```json
   {
     "error": "Too many submissions. Please slow down and try again.",
     "code": "RATE_LIMIT_EXCEEDED",
     "retryAfter": 30
   }
   ```

3. **Single String `message` Field (Legacy Contact & Careers APIs)**:
   ```json
   {
     "success": false,
     "message": "Full Name is required."
   }
   ```

4. **Object `error` with No Top-Level Message**:
   ```json
   {
     "success": false,
     "error": {
       "message": "Invalid credentials",
       "code": "UNAUTHORIZED"
     }
   }
   ```

5. **Multi-Error Array (`errors` or Zod issues)**:
   ```json
   {
     "success": false,
     "errors": [
       { "path": ["email"], "message": "Invalid email address" },
       { "path": ["password"], "message": "Password must be at least 8 characters" }
     ]
   }
   ```

6. **Non-JSON Server Errors (Next.js crash, Reverse Proxy 502/504, Nginx)**:
   - Body is plain HTML (`"<!DOCTYPE html><html><head><title>500 Internal Server Error</title>..."`) or empty string.
   - Calling `await res.json()` throws `SyntaxError: Unexpected token '<' in JSON at position 0`.

7. **Browser Network Exceptions**:
   - `TypeError: Failed to fetch` (CORS failure, server offline, client disconnected).
   - `DOMException: The user aborted a request` / `AbortError` (timeout or page navigation).

---

## 4. Comprehensive File-by-File Audit Table

The following 180 locations across the codebase were identified as vulnerable to `[object Object]` rendering, silent crashes, or unformatted alert modals:

| File | Line | Problem | Code Snippet |
| :--- | :---: | :--- | :--- |
| `src/app/admin/ai/knowledge/page.tsx` | 1250 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `{formError && <div className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-l` |
| `src/app/admin/analytics/page.tsx` | 313 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/admin/business-partners/applications/[id]/page.tsx` | 73 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to add note");` |
| `src/app/admin/business-partners/applications/[id]/page.tsx` | 94 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `return alert("Reason/message is required for this action.");` |
| `src/app/admin/business-partners/applications/[id]/page.tsx` | 126 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Please select date and time");` |
| `src/app/admin/business-partners/applications/[id]/page.tsx` | 145 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to schedule meeting");` |
| `src/app/admin/business-partners/applications/[id]/page.tsx` | 170 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| data.message \|\| "Failed to create` |
| `src/app/admin/calendar/page.tsx` | 155 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to load calendar management data");` |
| `src/app/admin/calendar/page.tsx` | 361 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Synchronization failed");` |
| `src/app/admin/calendar/page.tsx` | 385 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to toggle status");` |
| `src/app/admin/calendar/page.tsx` | 414 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to save settings");` |
| `src/app/admin/calendar/page.tsx` | 483 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to save holiday");` |
| `src/app/admin/calendar/page.tsx` | 510 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to delete holiday");` |
| `src/app/admin/careers/applications/page.tsx` | 136 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to update review.");` |
| `src/app/admin/careers/applications/page.tsx` | 146 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Failed: " + e.message);` |
| `src/app/admin/careers/applications/page.tsx` | 164 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Failed to delete application: " + e.message);` |
| `src/app/admin/careers/page.tsx` | 226 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to save job posting.");` |
| `src/app/admin/careers/page.tsx` | 265 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Delete failed: " + e.message);` |
| `src/app/admin/careers/settings/page.tsx` | 126 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to update visibility settin` |
| `src/app/admin/careers/settings/page.tsx` | 158 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to save settings.");` |
| `src/app/admin/content/about/page.tsx` | 69 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(json.error \|\| "Save failed");` |
| `src/app/admin/content/blog/page.tsx` | 108 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Title and Article Content are required.");` |
| `src/app/admin/content/blog/page.tsx` | 136 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/content/demo-projects/page.tsx` | 388 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/admin/content/faqs/page.tsx` | 82 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Question and Answer are required.");` |
| `src/app/admin/content/faqs/page.tsx` | 110 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/content/homepage/page.tsx` | 66 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(json.error \|\| "Save failed");` |
| `src/app/admin/content/industries/page.tsx` | 85 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Title and Description are required.");` |
| `src/app/admin/content/industries/page.tsx` | 113 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/content/legal/page.tsx` | 249 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to save policy.");` |
| `src/app/admin/content/login-posters/page.tsx` | 257 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(e.message \|\| "Failed to delete poster.");` |
| `src/app/admin/content/media/page.tsx` | 93 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Filename and URL are required.");` |
| `src/app/admin/content/media/page.tsx` | 123 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/content/media/page.tsx` | 153 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message \|\| "Failed to upload file");` |
| `src/app/admin/content/media/page.tsx` | 177 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/content/seo/page.tsx` | 67 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(json.error \|\| "Failed to update SEO settings");` |
| `src/app/admin/content/services/page.tsx` | 113 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Title and Short Description are required.");` |
| `src/app/admin/content/services/page.tsx` | 142 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/brokers/page.tsx` | 76 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to create broker");` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 113 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to add note");` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 117 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 133 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to process KYC review");` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 138 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 155 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to execute action");` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 161 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 178 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to update commission rate");` |
| `src/app/admin/crm/brokers/[id]/page.tsx` | 183 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/clients/page.tsx` | 64 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to create client.");` |
| `src/app/admin/crm/clients/page.tsx` | 168 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `{formError && <p className="text-xs text-red-400">{formError}</p>}` |
| `src/app/admin/crm/commissions/page.tsx` | 96 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Action failed.");` |
| `src/app/admin/crm/commissions/page.tsx` | 100 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message \|\| "Failed to perform action.");` |
| `src/app/admin/crm/commissions/page.tsx` | 130 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to mark as paid.");` |
| `src/app/admin/crm/commissions/page.tsx` | 167 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to reject payout request.");` |
| `src/app/admin/crm/commissions/page.tsx` | 233 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/admin/crm/documents/page.tsx` | 52 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to upload document.");` |
| `src/app/admin/crm/documents/page.tsx` | 148 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `{error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-` |
| `src/app/admin/crm/follow-ups/page.tsx` | 42 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to complete follow-up.");` |
| `src/app/admin/crm/leads/page.tsx` | 103 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to create lead.");` |
| `src/app/admin/crm/leads/page.tsx` | 427 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{formError}</span>` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 46 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to resend activation link")` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 49 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 59 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to fetch project");` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 94 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 115 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 135 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 147 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Delivery failed");` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 165 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Completion failed");` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 183 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to generate delivery report` |
| `src/app/admin/crm/partner-projects/[id]/page.tsx` | 203 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to update QA status");` |
| `src/app/admin/crm/payments/page.tsx` | 23 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to fetch payments");` |
| `src/app/admin/crm/pipeline/page.tsx` | 47 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to change stage.");` |
| `src/app/admin/crm/pipeline/page.tsx` | 62 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to mark as Won.");` |
| `src/app/admin/crm/pipeline/page.tsx` | 80 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to mark as Lost.");` |
| `src/app/admin/crm/support/page.tsx` | 79 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to submit reply");` |
| `src/app/admin/crm/support/page.tsx` | 86 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/admin/employees/page.tsx` | 83 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to load employees");` |
| `src/app/admin/employees/page.tsx` | 150 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to create employee");` |
| `src/app/admin/employees/page.tsx` | 196 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to update employee");` |
| `src/app/admin/employees/page.tsx` | 460 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{formError}</span>` |
| `src/app/admin/employees/page.tsx` | 632 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{formError}</span>` |
| `src/app/admin/employees/page.tsx` | 820 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to delete employee");` |
| `src/app/admin/leave/page.tsx` | 88 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Approval failed");` |
| `src/app/admin/leave/page.tsx` | 114 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Rejection failed");` |
| `src/app/admin/projects/page.tsx` | 78 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to save project");` |
| `src/app/admin/projects/page.tsx` | 100 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to delete project");` |
| `src/app/admin/reviews/page.tsx` | 121 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| 'Failed to fetch reviews');` |
| `src/app/admin/reviews/page.tsx` | 165 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| 'Failed to update review');` |
| `src/app/admin/reviews/page.tsx` | 187 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| 'Failed to delete review');` |
| `src/app/admin/reviews/page.tsx` | 382 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<p>{error}</p>` |
| `src/app/admin/settings/payment/page.tsx` | 78 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to save settings");` |
| `src/app/admin/settings/payment/page.tsx` | 101 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `{error && <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/2` |
| `src/app/admin/tasks/page.tsx` | 132 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to create task");` |
| `src/app/admin/tasks/page.tsx` | 187 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to update task");` |
| `src/app/admin/tasks/page.tsx` | 192 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message \|\| "Update failed");` |
| `src/app/admin/tasks/page.tsx` | 208 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message \|\| "Failed to delete task");` |
| `src/app/admin/tasks/page.tsx` | 223 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to post comment");` |
| `src/app/admin/tasks/page.tsx` | 231 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message \|\| "Comment failed");` |
| `src/app/admin/work-reports/page.tsx` | 90 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Review failed");` |
| `src/app/broker/commissions/page.tsx` | 249 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| json.message \|\| "Failed to submit pay` |
| `src/app/broker/dashboard/page.tsx` | 772 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Template copied to clipboard!");` |
| `src/app/broker/leads/page.tsx` | 208 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| json.message \|\| "Failed to submit lea` |
| `src/app/broker/leads/page.tsx` | 839 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{formError}</span>` |
| `src/app/broker/onboarding/page.tsx` | 241 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to update profile details");` |
| `src/app/broker/onboarding/page.tsx` | 310 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to update payout details");` |
| `src/app/broker/onboarding/page.tsx` | 362 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to save KYC credentials");` |
| `src/app/broker/onboarding/page.tsx` | 396 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to record terms agreement");` |
| `src/app/broker/onboarding/page.tsx` | 424 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to generate referral links");` |
| `src/app/broker/profile/page.tsx` | 159 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to update profile settings.");` |
| `src/app/broker/profile/page.tsx` | 211 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to update password.");` |
| `src/app/broker/projects/new/page.tsx` | 205 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| json.message \|\| "Failed to submit pro` |
| `src/app/broker/projects/new/page.tsx` | 326 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/broker/projects/[id]/page.tsx` | 165 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| json.message \|\| "Failed to fetch proj` |
| `src/app/broker/projects/[id]/page.tsx` | 188 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Contract document not yet uploaded by Axivon Legal.");` |
| `src/app/broker/projects/[id]/page.tsx` | 201 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Please enter the URL or path to the signed PDF document.");` |
| `src/app/broker/projects/[id]/page.tsx` | 205 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Please confirm the document was duly executed.");` |
| `src/app/broker/projects/[id]/page.tsx` | 223 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to upload contract");` |
| `src/app/broker/projects/[id]/page.tsx` | 231 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/broker/projects/[id]/page.tsx` | 242 | Raw browser `alert()` modal disrupts UX; should use centralized toast system. | `alert("Please specify the amount and UTR / Transaction Reference ID.");` |
| `src/app/broker/projects/[id]/page.tsx` | 262 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to submit payment proof");` |
| `src/app/broker/projects/[id]/page.tsx` | 270 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/broker/projects/[id]/page.tsx` | 288 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to cancel project");` |
| `src/app/broker/projects/[id]/page.tsx` | 293 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/broker/support/page.tsx` | 139 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to submit ticket");` |
| `src/app/broker/support/page.tsx` | 168 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(json.error?.message \|\| "Failed to post reply");` |
| `src/app/broker/support/page.tsx` | 175 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/broker/support/page.tsx` | 433 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{formError}</span>` |
| `src/app/business-partner/activate/page.tsx` | 49 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| data.message \|\| "Failed to activate account");` |
| `src/app/business-partner/activate/page.tsx` | 139 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<p className="text-sm text-red-400">{error}</p>` |
| `src/app/client/activate/page.tsx` | 53 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to activate client account. The token ma` |
| `src/app/client/activate/page.tsx` | 118 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/client/profile/page.tsx` | 71 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/client/projects/[id]/page.tsx` | 145 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/client/projects/[id]/page.tsx` | 175 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/client/support/page.tsx` | 121 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/client/uat/page.tsx` | 82 | Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object. | `alert(err.message);` |
| `src/app/demo-projects/ecommerce/novacart/login/page.tsx` | 102 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/demo-projects/ecommerce/novacart/register/page.tsx` | 120 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/employee/attendance/page.tsx` | 138 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Action failed");` |
| `src/app/employee/attendance/page.tsx` | 167 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error \|\| "Failed to submit regularization");` |
| `src/app/employee/attendance/page.tsx` | 282 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/employee/documents/page.tsx` | 73 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to acknowledge document");` |
| `src/app/employee/leave/page.tsx` | 107 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to submit leave request.");` |
| `src/app/employee/leave/page.tsx` | 134 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to cancel leave request.");` |
| `src/app/employee/profile/page.tsx` | 69 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to load profile");` |
| `src/app/employee/profile/page.tsx` | 153 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to update profile");` |
| `src/app/employee/profile/page.tsx` | 209 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/employee/settings/page.tsx` | 102 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to save settings on server");` |
| `src/app/employee/settings/page.tsx` | 183 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/employee/support/page.tsx` | 180 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to log support ticket.");` |
| `src/app/employee/support/page.tsx` | 574 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{errorMsg}</span>` |
| `src/app/employee/tasks/page.tsx` | 101 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to update status");` |
| `src/app/employee/tasks/page.tsx` | 134 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to submit comment");` |
| `src/app/employee/work-reports/page.tsx` | 145 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to submit work report");` |
| `src/app/executive/dashboard/page.tsx` | 28 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `if (error) return <div className="text-red-400 p-4">{error}</div>;` |
| `src/app/executive/people/[id]/page.tsx` | 41 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error);` |
| `src/app/executive/people/[id]/page.tsx` | 71 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error);` |
| `src/app/executive/people/[id]/page.tsx` | 82 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error);` |
| `src/app/executive/people/[id]/page.tsx` | 93 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `if (!res.ok) throw new Error(data.error);` |
| `src/app/executive/people/[id]/page.tsx` | 130 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `{error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-40` |
| `src/app/executive/reports/page.tsx` | 74 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/login/page.tsx` | 118 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Login failed");` |
| `src/app/login/page.tsx` | 220 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/app/privacy-requests/PrivacyRequestsClient.tsx` | 125 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to submit privacy request.");` |
| `src/app/privacy-requests/PrivacyRequestsClient.tsx` | 170 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Request not found.");` |
| `src/app/verify-email-change/page.tsx` | 44 | Direct `setError(data.error)` stores object in error state, causing React to render `[object Object]`. | `setError(data.error \|\| "This verification link is invalid or has expired.");` |
| `src/app/verify-email-change/page.tsx` | 77 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to verify email change.");` |
| `src/app/verify-email-change/page.tsx` | 148 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<p className="text-xs text-red-400 mt-1 leading-relaxed">{error}</p>` |
| `src/components/careers/CareerApplication.tsx` | 177 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "File upload failed.");` |
| `src/components/chatbot/LeadCapture.tsx` | 88 | Direct `setError(data.error)` stores object in error state, causing React to render `[object Object]`. | `setError(data.error \|\| "Failed to submit request. Please try again.");` |
| `src/components/demo-projects/edusmart/EduSmartContact.tsx` | 141 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/components/demo-projects/foodiehub/FoodieHubContact.tsx` | 160 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/components/employee/ChangePasswordForm.tsx` | 45 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to change password");` |
| `src/components/employee/ChangePasswordForm.tsx` | 82 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{error}</span>` |
| `src/components/portal/AccountProfileSettings.tsx` | 89 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to load account profile");` |
| `src/components/portal/AccountProfileSettings.tsx` | 207 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to update profile information");` |
| `src/components/portal/AccountProfileSettings.tsx` | 254 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to initiate email change request");` |
| `src/components/portal/AccountProfileSettings.tsx` | 298 | Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`. | `throw new Error(data.error \|\| "Failed to cancel pending email change");` |
| `src/components/portal-ai/PortalAIAssistant.tsx` | 320 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<p className="text-[11px] mt-0.5">{error}</p>` |
| `src/components/ui/GoogleRecaptchaWidget.tsx` | 285 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<span>{errorMessage}</span>` |
| `src/components/ui/Input.tsx` | 43 | Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering. | `<p className="mt-1 text-xs text-red-400 font-medium">{error}</p>` |

---

## 5. Architectural Remediation Strategy

1. **Centralized Client Parsing Helper (`src/lib/errors/client.ts`)**:
   - `getErrorMessage(input: unknown): string`: Guaranteed to **never** return `"[object Object]"`. Extracts from any shape (string, Error, `error.message`, `data.message`, `data.error`, arrays), with status-code-aware friendly defaults.
   - `getFieldErrors(input: unknown): Record<string, string>`: Safely extracts field-level validation errors from Zod issues or `error.fields`.
   - `parseApiResponse<T>(res: Response): Promise<ParsedApiResponse<T>>`: Reads response stream safely using text-then-JSON parsing so empty or HTML 500 bodies never crash.
2. **Centralized Backend Normalizer (`src/lib/errors/server.ts` / `src/lib/api-error.ts`)**:
   - Ensure all API endpoints return consistent `{ success: false, error: { code, message, fields? }, message }` while preserving backward compatibility for legacy clients.
   - Mask Prisma details and stack traces in production.
3. **Global Notification System (`src/components/notifications/ToastProvider.tsx` & `src/lib/notifications/toast.ts`)**:
   - Lightweight, accessible (ARIA live), stacked (max 3), customizable per portal (emerald/amber/red/blue, dark theme), with action helpers (`useApiAction`).
4. **Login Page Overhaul (`src/app/login/page.tsx`)**:
   - Unified error banner with `role="alert"`, dismiss button, autofill safety, rate-limit countdown timer, inline field errors, password field refocusing, and Turnstile/reCAPTCHA auto-reset.
