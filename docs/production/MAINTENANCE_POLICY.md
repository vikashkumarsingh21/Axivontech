# AXIVON TECHNOLOGIES — MAINTENANCE & DEPENDENCY POLICY

## 1. Maintenance Windows & Schedule
- **Routine Maintenance Window**: Sundays 02:00 AM – 04:00 AM IST.
- **Emergency Patch Window**: Authorized for P0 security vulnerabilities or database critical patches.

---

## 2. Dependency Management Rules
1. **Security Audit**: Run `npm audit` weekly; patch high/critical vulnerabilities immediately.
2. **Major Upgrades**: Test major framework upgrades (e.g. Next.js, React, Prisma) in isolated staging branches before production deployment.
3. **Database Maintenance**: Neon managed service handles engine upgrades automatically during zero-traffic windows.
