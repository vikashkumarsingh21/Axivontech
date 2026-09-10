# AXIVON TECHNOLOGIES — PRODUCTION DEPLOYMENT RUNBOOK

## 1. Pre-Deployment Checklist
- [ ] CI pipeline (`audit-and-test`) passed on `main` branch.
- [ ] No uncommitted or local secrets present in repository.
- [ ] Database backup snapshot verified via Neon Console.
- [ ] Schema changes reviewed for backward compatibility.
- [ ] Environment variables verified in production hosting configuration.

---

## 2. Release Execution Workflow

```bash
# Step 1: Git Tag Release Version
git tag -a v1.0.0-prod -m "Production Release v1.0.0 — Phase 7 Hardening"
git push origin v1.0.0-prod

# Step 2: Execute Production Database Migrations
npx prisma migrate deploy

# Step 3: Trigger Production Application Deployment
# (Automated via Vercel / GitHub Actions or manual trigger)

# Step 4: Execute Post-Deployment Health Check
curl -f https://app.axivontech.in/api/health
curl -f https://app.axivontech.in/api/ready
```

---

## 3. Post-Deployment Verification (Smoke Test)
Execute automated smoke test:
```bash
npx tsx scripts/production-smoke-test.ts
```
Verify:
1. HTTP status 200 on public homepage (`/`).
2. Successful login with test credentials.
3. Employee attendance page loads today's work window (`08:00 AM → 07:00 PM`).
4. Admin panel loads live attendance monitor summary.
5. Readiness endpoint returns status `READY`.
