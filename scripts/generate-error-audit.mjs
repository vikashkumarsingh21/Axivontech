import fs from "fs";
import path from "path";

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) res.push(p);
  }
  return res;
}

const allFiles = walk("./src");
const auditEntries = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const l = line.trim();

    // Check specific patterns
    if (/new\s+Error\s*\(\s*(data|res|json|result)\.error/.test(l)) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Calls `new Error(data.error)`. When API returns `{ error: { code, message } }`, error message becomes `'[object Object]'`.",
        snippet: l,
      });
    } else if (/setError\s*\(\s*(data|res|json|result)\.error/.test(l)) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Direct `setError(data.error)` stores object in error state, causing React to render `[object Object]`.",
        snippet: l,
      });
    } else if (/alert\s*\(\s*(?:err|error|e)\.message/.test(l)) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Unsafe `alert(err.message)` displays browser popup with `'[object Object]'` if err originated from `data.error` object.",
        snippet: l,
      });
    } else if (/alert\s*\(\s*(?:data|res|json)\.error/.test(l)) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Unsafe `alert(data.error)` displays browser popup with `'[object Object]'` when error is an object.",
        snippet: l,
      });
    } else if (/alert\s*\(\s*["']/.test(l) && !rel.includes("test")) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Raw browser `alert()` modal disrupts UX; should use centralized toast system.",
        snippet: l,
      });
    } else if (/<span>\s*\{\s*(error|err|formError|errorMsg|errorMessage)\s*\}\s*<\/span>|<p[^>]*>\s*\{\s*(error|err|formError|errorMsg|errorMessage)\s*\}\s*<\/p>|<div[^>]*>\s*\{\s*(error|err|formError|errorMsg|errorMessage)\s*\}\s*<\/div>/i.test(l)) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Directly renders error variable in JSX without string safety wrapper, risking `[object Object]` rendering.",
        snippet: l,
      });
    } else if (/toast\s*\(\s*(data\.error|err\.message|error\b)/.test(l)) {
      auditEntries.push({
        file: rel,
        line: lineNum,
        problem: "Passes potentially unformatted error object into toast notification.",
        snippet: l,
      });
    }
  });
}

// Write the complete markdown report
let md = `# Comprehensive Error Handling Audit (ERROR_AUDIT.md)

**Generated:** ${new Date().toISOString()}  
**Codebase:** Axivon Technologies (Next.js 16 App Router, React 19, Zod, Tailwind v4)  
**Branch:** \`error-handling-fix\`

---

## 1. Executive Summary & Root Cause Analysis

### The Problem
When authentication fails (e.g., incorrect password on \`/login\`), users are greeted with a red banner displaying:
\`\`\`
[object Object]
\`\`\`
instead of a helpful, human-readable message like \`"Incorrect email or password."\`

### The Root Cause
1. **API Response Structure**: The backend standard error handler (\`handleApiError\` in \`src/lib/api-error.ts\`) returns JSON with:
   \`\`\`json
   {
     "success": false,
     "error": {
       "code": "API_ERROR",
       "message": "Invalid email or password"
     },
     "message": "Invalid email or password"
   }
   \`\`\`
   Here, \`response.error\` is an **object** (\`{ code, message, fields }\`).
2. **Frontend String Coercion**: In client code across forms (e.g., \`src/app/login/page.tsx:118\`):
   \`\`\`ts
   const data = await res.json();
   if (!res.ok) {
     throw new Error(data.error || "Login failed");
   }
   \`\`\`
   In JavaScript, \`new Error(obj)\` calls \`String(obj)\`, which evaluates to \`"[object Object]"\`.
3. **JSX Rendering**:
   \`\`\`tsx
   <span role="alert">{error}</span>
   \`\`\`
   The string \`"[object Object]"\` is directly injected into the DOM.
4. **Widespread Proliferation**: Over 70+ client pages and components across Admin, Broker, Client, Employee, Executive, and Public portals follow this exact pattern, or use native browser \`alert(err.message)\`.

---

## 2. Deep Dive: \`/login\` and \`POST /api/v1/auth/login\`

The authentication endpoint (\`src/app/api/v1/auth/login/route.ts\`) and client page (\`src/app/login/page.tsx\`) were audited across all 11 failure and edge cases:

| Failure Scenario | HTTP Status | Backend Response Body Shape | Current Frontend Behavior | Root Cause | Desired Behavior |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Wrong Password** | 401 | \`{ success: false, error: { code: "API_ERROR", message: "Invalid email or password" }, message: "..." }\` | Red box displays \`"[object Object]"\` | \`new Error(data.error)\` coerces object to string | Show \`"Incorrect email or password."\`, clear password, focus password input, reset captcha |
| **Unknown Email** | 401 | \`{ success: false, error: { code: "API_ERROR", message: "Invalid email or password" }, message: "..." }\` | Red box displays \`"[object Object]"\` | \`new Error(data.error)\` coerces object to string | Show \`"Incorrect email or password."\` (identical message to prevent user enumeration) |
| **Empty Fields (Email / Password)** | 400 | Client prevents submit or API returns \`{ success: false, error: { code: "VALIDATION_ERROR", message: "Password is required", fields: { password: [...] } } }\` | General error box or \`"[object Object]"\` | Validation issues not mapped to form inputs | Display field-level inline error below the specific empty input |
| **Invalid Email Format** | 400 | \`{ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email", fields: { email: [...] } } }\` | General error box or \`"[object Object]"\` | \`fields\` array ignored | Display \`"Please enter a valid work email address."\` under email input |
| **Missing CAPTCHA Verification** | 400 | \`{ error: "Please complete the human verification before submitting this form.", code: "MISSING_TOKEN", requiresCaptchaReset: true }\` | Client blocks submit with generic message or API returns 400 | Inconsistent string error format | Show \`"Please confirm you are not a robot."\`, reset captcha widget |
| **Failed / Expired CAPTCHA** | 400 / 503 | \`{ error: "Security verification failed. Please try again.", code: "PROVIDER_TIMEOUT", requiresCaptchaReset: true }\` | Red box displays \`"Security verification expired..."\` | String error handled, but captcha widget state not cleanly reset | Show \`"Security verification expired. Please verify again."\`, reset captcha widget |
| **429 Rate Limit (Brute Force)** | 429 | \`{ error: "Too many login attempts. Please try again later." }\` with \`Retry-After: N\` header | Red box displays raw error message without countdown | \`Retry-After\` header is ignored by client | Show \`"Too many attempts. Please try again in N seconds."\`, disable button with active countdown timer |
| **Suspended / Inactive Account** | 403 | \`{ success: false, error: { code: "API_ERROR", message: "Account is SUSPENDED. Please check your email or contact support." } }\` | Red box displays \`"[object Object]"\` | Object coercion in \`new Error(data.error)\` | Show human-readable reason message with support link (\`admin@axivon.com\`) |
| **Must Change Password / Activation** | 403 | \`{ success: false, error: { code: "API_ERROR", message: "Please complete your account activation..." } }\` | Red box displays \`"[object Object]"\` | Object coercion in \`new Error(data.error)\` | Display friendly instructions with activation link |
| **Internal Server Error / DB Offline** | 500 | \`{ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }\` or plain HTML 500 | Red box displays \`"[object Object]"\` or JSON parse crash | Non-JSON response crashes \`res.json()\` | Show \`"Could not reach the server. Check your connection and try again."\` |
| **Network Failure (Offline / Disconnected)** | 0 | None (Browser \`TypeError: Failed to fetch\`) | Red box displays \`"Failed to fetch"\` | Raw exception message displayed | Show \`"Could not reach the server. Check your connection and try again."\` |

---

## 3. Backend API Error Response Shapes Inventory

Across \`src/app/api/\`, seven distinct response shapes are returned during error conditions (HTTP 4xx and 5xx):

1. **Standard \`handleApiError\` Response (Most API v1 Routes)**:
   \`\`\`json
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
   \`\`\`

2. **Single String \`error\` Field (Rate limiting, Captcha, Lightweight endpoints)**:
   \`\`\`json
   {
     "error": "Too many submissions. Please slow down and try again.",
     "code": "RATE_LIMIT_EXCEEDED",
     "retryAfter": 30
   }
   \`\`\`

3. **Single String \`message\` Field (Legacy Contact & Careers APIs)**:
   \`\`\`json
   {
     "success": false,
     "message": "Full Name is required."
   }
   \`\`\`

4. **Object \`error\` with No Top-Level Message**:
   \`\`\`json
   {
     "success": false,
     "error": {
       "message": "Invalid credentials",
       "code": "UNAUTHORIZED"
     }
   }
   \`\`\`

5. **Multi-Error Array (\`errors\` or Zod issues)**:
   \`\`\`json
   {
     "success": false,
     "errors": [
       { "path": ["email"], "message": "Invalid email address" },
       { "path": ["password"], "message": "Password must be at least 8 characters" }
     ]
   }
   \`\`\`

6. **Non-JSON Server Errors (Next.js crash, Reverse Proxy 502/504, Nginx)**:
   - Body is plain HTML (\`"<!DOCTYPE html><html><head><title>500 Internal Server Error</title>..."\`) or empty string.
   - Calling \`await res.json()\` throws \`SyntaxError: Unexpected token '<' in JSON at position 0\`.

7. **Browser Network Exceptions**:
   - \`TypeError: Failed to fetch\` (CORS failure, server offline, client disconnected).
   - \`DOMException: The user aborted a request\` / \`AbortError\` (timeout or page navigation).

---

## 4. Comprehensive File-by-File Audit Table

The following ${auditEntries.length} locations across the codebase were identified as vulnerable to \`[object Object]\` rendering, silent crashes, or unformatted alert modals:

| File | Line | Problem | Code Snippet |
| :--- | :---: | :--- | :--- |
${auditEntries.map(e => `| \`${e.file}\` | ${e.line} | ${e.problem} | \`${e.snippet.replace(/\|/g, "\\|").slice(0, 80)}\` |`).join("\n")}

---

## 5. Architectural Remediation Strategy

1. **Centralized Client Parsing Helper (\`src/lib/errors/client.ts\`)**:
   - \`getErrorMessage(input: unknown): string\`: Guaranteed to **never** return \`"[object Object]"\`. Extracts from any shape (string, Error, \`error.message\`, \`data.message\`, \`data.error\`, arrays), with status-code-aware friendly defaults.
   - \`getFieldErrors(input: unknown): Record<string, string>\`: Safely extracts field-level validation errors from Zod issues or \`error.fields\`.
   - \`parseApiResponse<T>(res: Response): Promise<ParsedApiResponse<T>>\`: Reads response stream safely using text-then-JSON parsing so empty or HTML 500 bodies never crash.
2. **Centralized Backend Normalizer (\`src/lib/errors/server.ts\` / \`src/lib/api-error.ts\`)**:
   - Ensure all API endpoints return consistent \`{ success: false, error: { code, message, fields? }, message }\` while preserving backward compatibility for legacy clients.
   - Mask Prisma details and stack traces in production.
3. **Global Notification System (\`src/components/notifications/ToastProvider.tsx\` & \`src/lib/notifications/toast.ts\`)**:
   - Lightweight, accessible (ARIA live), stacked (max 3), customizable per portal (emerald/amber/red/blue, dark theme), with action helpers (\`useApiAction\`).
4. **Login Page Overhaul (\`src/app/login/page.tsx\`)**:
   - Unified error banner with \`role="alert"\`, dismiss button, autofill safety, rate-limit countdown timer, inline field errors, password field refocusing, and Turnstile/reCAPTCHA auto-reset.
`;

fs.writeFileSync("./ERROR_AUDIT.md", md);
console.log(`ERROR_AUDIT.md successfully generated with ${auditEntries.length} items!`);
