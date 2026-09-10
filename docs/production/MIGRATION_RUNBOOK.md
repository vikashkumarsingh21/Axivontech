# AXIVON TECHNOLOGIES — DATABASE MIGRATION RUNBOOK

## 1. Pre-Migration Checklist
- [ ] Database backup verified.
- [ ] Migration reviewed for locking queries (e.g. `ALTER TABLE` without default values).
- [ ] Tested against Staging database.

---

## 2. Execution Steps
```bash
# Step 1: Check current migration status
npx prisma migrate status

# Step 2: Apply pending migrations in production
npx prisma migrate deploy

# Step 3: Re-generate Prisma Client if schema changed
npx prisma generate

# Step 4: Verify schema sync
npx tsx -e "import { db } from './src/lib/db'; db.\$queryRaw\`SELECT 1\`.then(() => console.log('DB Ready'));"
```

---

## 3. Handling Failed Migrations
If `npx prisma migrate deploy` fails:
1. Inspect the error output and `_prisma_migrations` table.
2. Fix underlying database state using manual SQL script if required.
3. Mark migration as resolved:
   ```bash
   npx prisma migrate resolve --applied "YYYYMMDDHHMMSS_migration_name"
   ```
4. Never run `prisma migrate reset`.
