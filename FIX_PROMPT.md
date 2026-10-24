# AI Automated Fixer Instruction Prompt

Copy and paste this exact prompt into your AI coding tool to execute the repairs systematically:

```markdown
You are a senior full-stack software engineer and security specialist. 
Your task is to fix the defects identified in the Axivon Technologies codebase as documented in:
- \`BUGS.md\` (Defect Catalog BUG-001 through BUG-018)
- \`FRONTEND_ISSUES.md\` (UI bugs, hydration errors, infinite loading spinners, missing error boundaries)
- \`BACKEND_ISSUES.md\` (Prisma schema sync errors, 500s, route collisions, missing tables/columns)
- \`BROWSER_TEST_REPORT.md\` (Complete real-browser QA audit scores and test matrix)

### FIXING PROTOCOL & RULES:
1. Fix the bugs strictly in priority order following \`PRIORITY.md\`.
2. Do NOT break any feature verified as working in \`WORKING_LIST.md\`.
3. Fix issues systematically by category:

#### Phase 1: Critical Database & Schema Alignment (Backend)
- **Fix BUG-013 & BUG-014 (Missing Tables \`WebsiteService\` & \`WebsiteArticle\`):**
  Run \`npx prisma db push\` or create SQL migrations for \`WebsiteService\` and \`WebsiteArticle\` so that \`/api/v1/admin/content/services\` and \`/api/v1/admin/content/blog\` do not crash with Prisma P2021.
- **Fix BUG-015 (Missing Column \`Commission.payoutRequestedAt\`):**
  Add \`payoutRequestedAt DateTime?\` to table \`Commission\` so that \`/api/v1/broker/commissions\` returns HTTP 200 without Prisma P2022.

#### Phase 2: Security & Privilege Boundaries (Backend / Middleware)
- **Fix BUG-003 & BUG-004:** Protect \`/api/v1/jobs\` and enforce strict role checking in \`src/middleware.ts\`.
- **Fix BUG-005 & BUG-006:** Fix approval state validation and add magic bytes validation to \`upload-resume\`.
- **Fix BUG-010 & BUG-011:** Align \`/api/v1/client/projects\` permissions with Admin/Founder RBAC and eliminate insecure session secret fallbacks.

#### Phase 3: Routing & Collision Fixes (Full-Stack)
- **Fix BUG-016 (Broker Project Creation Collision):**
  In \`src/app/broker/projects/new/page.tsx\`, prevent calling \`/api/v1/broker/projects/new\` which collides with \`[id]\`. Render the new project form directly.
- **Missing Navigation Pages:**
  Provide page handlers for \`/admin/content/portfolio\` and \`/executive/analytics\` to eliminate 404 errors from sidebar navigation.

#### Phase 4: Frontend Stability & Error Boundaries (Frontend)
- **Fix BUG-017 (Client-Side Environment Leak):**
  In \`src/app/careers-privacy/page.tsx\` and \`src/components/legal/LegalPageLayout.tsx\`, make the page a React Server Component (RSC) to read legal DB content on the server and pass plain serializable props to the client view. Do NOT import \`src/lib/db.ts\` or \`src/lib/env.ts\` in client files.
- **Fix BUG-018 (React Hydration Mismatch):**
  In \`src/app/employee/work-reports/page.tsx:198\`, use a deterministic date format or format inside \`useEffect\` to prevent SSR vs client locale mismatch.
- **Error State Fallbacks (FE-ISSUE-002, FE-ISSUE-003, FE-ISSUE-004):**
  In all data-fetching pages (\`/admin/content/services\`, \`/broker/commissions\`, \`/employee/dashboard\`), replace infinite spinners with clear error states and "Retry" buttons if the API returns non-200.

4. After applying each fix, run the verification test specified under "How to verify the fix" in \`BUGS.md\`.
5. Maintain documentation integrity and preserve all existing docstrings and comments unrelated to the fixes.
```
