# AXIVON TECHNOLOGIES — ROLLBACK RUNBOOK

## 1. Application Rollback Protocol
If a production deployment causes critical errors (P0/P1 incident):

### Step 1: Instant Deployment Reversion
Using hosting CLI or dashboard, instantly revert to the previous verified deployment SHA:
```bash
# Example via Vercel CLI
vercel rollback
```

### Step 2: Verify Rollback Health
```bash
curl -f https://app.axivontech.in/api/health
curl -f https://app.axivontech.in/api/ready
```

---

## 2. Database Rollback Constraints
- **Schema Additions (New columns/tables)**: Application code can be safely rolled back without changing the database schema (since new columns are optional).
- **Destructive Changes**: Schema rollbacks should be avoided. Use forward-fix migration scripts (`npx prisma migrate dev --name fix_issue`) to repair schema logic.
