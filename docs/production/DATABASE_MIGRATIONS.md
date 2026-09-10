# AXIVON TECHNOLOGIES — DATABASE MIGRATION STRATEGY & GUIDELINES

## 1. Core Principles & Strict Rules
1. **Never Run `npx prisma migrate reset` in Production**: Resetting drops all production tables, destroying customer, employee, and business data.
2. **Use `npx prisma migrate deploy` for Production**: Applies pending migration files idempotently without modifying existing schema data.
3. **Backward-Compatible Schema Changes**:
   - Step 1: Add new optional/nullable columns or tables.
   - Step 2: Deploy application code consuming new columns.
   - Step 3: Backfill data if necessary.
   - Step 4: Drop old deprecated columns in a subsequent release.

---

## 2. Deployment Migration Workflow

```
Developer Local Change -> npx prisma migrate dev --name <description>
                                |
                                v
Commit Migration Folder (prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql)
                                |
                                v
Pull Request CI Check (Verifies schema syntax & build)
                                |
                                v
Staging Execution -> npx prisma migrate deploy
                                |
                                v
Production Execution -> npx prisma migrate deploy (before app deployment)
```

---

## 3. Migration Lock & History Table
Prisma tracks applied migrations in the `_prisma_migrations` table.
- Verify migration status: `npx prisma migrate status`
- Resolve migration conflict: Use manual SQL repair or `npx prisma migrate resolve`.
