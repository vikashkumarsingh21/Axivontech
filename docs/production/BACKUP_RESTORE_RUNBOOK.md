# AXIVON TECHNOLOGIES — BACKUP & RESTORE RUNBOOK

## 1. Managed Backup Architecture (Neon Cloud)
- **Backup Type**: Continuous WAL archiving & automated daily snapshots.
- **Point-in-Time Recovery (PITR)**: Enables database state restoration to any precise second within the retention window (7 days on standard managed tier).
- **Encryption**: Storage encrypted at rest with AES-256; connections encrypted in transit with TLS 1.3.

---

## 2. Tested Step-by-Step Restoration Procedure

### Step 1: Trigger Isolated Database Restoration
Using Neon Console or CLI, create a restored branch/database instance from the target recovery timestamp:
```bash
# Example via Neon CLI
neon branch create restore-test-branch --parent main --time 2026-09-09T18:00:00Z
```

### Step 2: Extract Isolated Connection String
Copy the connection string for `restore-test-branch`:
```env
RESTORE_DATABASE_URL="postgresql://user:pass@ep-restore-test-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Verify Schema & Core Data Integrity
Run database verification queries against the restored branch:
```bash
# Verify record counts across critical business entities
DATABASE_URL="$RESTORE_DATABASE_URL" npx tsx -e "
import { db } from './src/lib/db';
async function test() {
  const users = await db.user.count();
  const attendances = await db.attendance.count();
  const leads = await db.lead.count();
  console.log('Restored DB Verification:', { users, attendances, leads });
}
test();
"
```

### Step 4: Validate Application Smoke Tests
Point a staging application instance to `RESTORE_DATABASE_URL` and run full smoke tests.

### Step 5: Switch Production Endpoint (Emergency Disaster Recovery Only)
Update production `DATABASE_URL` secret to point to the restored instance and trigger immediate application re-deployment.

---

## 3. Recovery Targets
- **Recovery Point Objective (RPO)**: < 5 Minutes (Continuous WAL log shipping).
- **Recovery Time Objective (RTO)**: < 30 Minutes (Branch creation & environment URL update).
