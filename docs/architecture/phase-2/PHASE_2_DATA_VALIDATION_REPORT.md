# PHASE 2 — DATA VALIDATION REPORT

## Methodology
Data validation runs automatically at the end of the ETL pipeline execution (`scripts/migration/phase2/run.ts`).

1. For each model mapped in `model-ownership.json`, the exact row count is queried on the `SOURCE` database.
2. After the batch copy completes, the row count is queried on the `TARGET` database.
3. If `SOURCE_COUNT === TARGET_COUNT`, the status is logged as `PASS`. Otherwise, it logs `FAIL_MISMATCH`.

## Output Artifact
The machine-readable results are dumped to `migration/migration-counts.json`.

*Note: Since this is the initial script commit, the ETL has not yet been executed against production data. This report template will be populated automatically during the Staging Dry Run.*
