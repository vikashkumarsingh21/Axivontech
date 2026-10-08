# PHASE 2 — REFERENCE INTEGRITY & ORPHAN REPORT

## Automated Checks
The script `scripts/migration/phase2/orphan-check.ts` acts as the primary integrity enforcer for cross-database references that lost PostgreSQL foreign-key guarantees during Phase 1.

### Target Validation Rules
1. **Task → PartnerProject**: Scans the `EMPLOYEE` DB for `Task.partnerProjectId`, queries the `CLIENT` DB, and throws an `ORPHAN_REFERENCE` error if missing.
2. **Commission → PartnerProject**: Scans the `BROKER` DB for `Commission.partnerProjectId`, queries the `CLIENT` DB, and throws an `ORPHAN_REFERENCE` error if missing.
3. **ProjectMember → User**: Scans the `CLIENT` DB for `PartnerProjectMember.userId`, queries the `CORE` DB, and throws if missing.

## Resolution Workflow
If any orphan is detected, the Staging Migration is marked as **FAILED**. 

*Note: Automated results will be logged to `migration/migration-reference-integrity.json` during the staging run.*
