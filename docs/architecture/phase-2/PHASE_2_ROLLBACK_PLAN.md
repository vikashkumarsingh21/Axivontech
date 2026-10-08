# PHASE 2 — ROLLBACK PLAN

## Monolithic Preservation
AXIVON ONE’s Phase 2 migration explicitly retains the production PostgreSQL monolith. At no point during the migration window will the monolith be deleted, dropped, or reset. 

## Rollback Triggers
If any of the following occur during the Production Cutover window, a rollback must be initiated:
- `migration-counts.json` reports missing records.
- `migration-reference-integrity.json` detects orphan constraints.
- E2E Smoke Tests fail (Authentication, Client isolation).

## Rollback Execution Steps
1. **Restore Traffic**: Revert Vercel environment variables to use the original monolith `DATABASE_URL`.
2. **Re-Deploy**: Deploy the previous stable branch/commit (`main`).
3. **Data Integrity**: Any data generated in the 4 target databases during the failed window is discarded. The monolith remains the continuous source of truth.
4. **Post-Mortem**: Review ETL logs before attempting a second window.
