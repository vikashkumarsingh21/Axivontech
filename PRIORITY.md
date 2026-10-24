# Axivon Technologies — Fix Priority Matrix & Quick Wins

**Date:** 2026-10-24  
**Target Audience:** Fixing Agent / Engineering Team  

---

## 1. Top 15 Fixes in Priority Order

| Priority | Bug ID | Severity | File(s) to Fix | Summary of Required Action |
|---|---|---|---|---|
| **1** | **BUG-001** | **Critical** | `src/config/siteFacts.ts` | Decouple circular import of `DEFAULT_INDUSTRIES` to unblock SSR page rendering across the entire application. |
| **2** | **BUG-002** | **Critical** | `src/config/siteFacts.ts` | Fix broken named import `services` -> `servicesData` to restore TypeScript compilation and production build. |
| **3** | **BUG-003** | **Critical** | `src/middleware.ts` | Add `/api/v1/jobs/:path*` to `isProtectedApiRoute` to eliminate unauthenticated job queue execution. |
| **4** | **BUG-005** | **Critical** | `src/app/api/v1/executive/approvals/[id]/approve/route.ts` | Implement real `UserRole` update in database upon executive approval of role changes. |
| **5** | **BUG-004** | **High** | `src/middleware.ts` | Invert employee route protection from blacklist exception to positive allowlist. |
| **6** | **BUG-006** | **High** | `src/app/api/v1/public/careers/upload-resume/route.ts` | Remove `application/octet-stream` MIME and relocate uploaded resumes out of public web directory. |
| **7** | **BUG-007** | **High** | `src/components/blog/ArticleDetailView.tsx` | Wrap `post.contentHtml` in DOMPurify sanitization before rendering with `dangerouslySetInnerHTML`. |
| **8** | **BUG-008** | **High** | `src/app/api/v1/employee/attendance/route.ts` | Fix same-day attendance re-check-in to insert an unpaid offline break instead of inflating gross hours. |
| **9** | **BUG-010** | **Medium** | `src/app/api/v1/client/projects/route.ts` | Allow Admin and Founder roles to view client project listings without throwing 401. |
| **10** | **BUG-009** | **Medium** | `src/app/api/v1/employee/leave/route.ts` | Add Zod enum validation for `leaveType` and reject retroactive leave submissions. |
| **11** | **BUG-011** | **Medium** | `src/middleware.ts` | Remove hardcoded static fallback string for `SESSION_SECRET` to prevent forged token acceptance. |
| **12** | **BUG-014** | **Medium** | `src/app/api/v1/executive/settings/route.ts` | Add Zod schema validation on `{ key, value }` before executing Prisma upsert. |
| **13** | **BUG-013** | **Low** | `src/app/api/v1/admin/employees/route.ts` | Replace direct `bcrypt.hash(..., 10)` with centralized `hashPassword` (12 rounds). |
| **14** | **BUG-015** | **Medium** | `prisma/schema.prisma` | Add composite indexes `@@index([userId, date])` on Attendance and `@@index([userId, status])` on Task. |
| **15** | **BUG-016** | **Low** | `src/app/admin/content/login_posters/page.tsx` | Delete duplicate redirect directory and enforce canonical `/admin/content/login-posters`. |

---

## 2. Quick Wins (High Impact, Low Effort)

1. **Fix `BUG-002` in `src/config/siteFacts.ts` line 6:**  
   Change `import { services } from "@/data/services";` to `import { servicesData as services } from "@/data/services";`. *(Takes 30 seconds; eliminates TS2305 error immediately).*
2. **Fix `BUG-001` in `src/config/siteFacts.ts` line 26:**  
   Replace `DEFAULT_INDUSTRIES.length` with a direct numeric constant `8` or import from a decoupled data file. *(Takes 1 minute; fixes app-wide 500 error on all 186 pages immediately).*
3. **Fix `BUG-003` in `src/middleware.ts` line 57:**  
   Add `pathname.startsWith("/api/v1/jobs")` to `isProtectedApiRoute`. *(Takes 1 minute; seals background job execution).*
4. **Fix `BUG-010` in `src/app/api/v1/client/projects/route.ts` line 11:**  
   Allow `ADMIN` and `FOUNDER` in role check. *(Takes 1 minute; unblocks administrative client oversight).*
5. **Fix `BUG-007` in `src/components/blog/ArticleDetailView.tsx` line 192:**  
   Add DOMPurify sanitization. *(Takes 2 minutes; eliminates stored XSS vulnerability).*
