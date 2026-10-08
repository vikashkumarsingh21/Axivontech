# PHASE 2 — ETL IMPLEMENTATION

## Pipeline Design
The Phase 2 ETL pipeline (`scripts/migration/phase2/run.ts`) is a Node.js orchestration script utilizing the 5 Prisma clients generated in Phase 1 (1 Source, 4 Targets). 

### Process Flow
1. **Validation & Configuration**: The script parses `migration/model-ownership.json` to determine exactly which target database receives each model.
2. **Extraction**: Records are read from the `SOURCE_DATABASE_URL` (the snapshot staging DB, never production) in batches of 500 (`BATCH_SIZE`).
3. **Transformation**: The pipeline strips relational object attachments and retains only literal fields and foreign-key strings (soft links).
4. **Load**: Records are inserted into `CORE`, `CLIENT`, `EMPLOYEE`, or `BROKER` staging databases using `createMany` with `skipDuplicates: true` to guarantee idempotency.

### ID Preservation Rule
The script utilizes the exact Prisma schema definitions, meaning the `id` strings from the monolith source are mapped directly to the `id` strings in the targets. No new IDs are generated. 

### Cross-Database Links
Models containing references to other domains (e.g., `Task.partnerProjectId`) are migrated exactly as-is since the `partnerProjectId` field type was converted to a simple `String` in Phase 1. When the `PartnerProject` is migrated to the `CLIENT` DB, its original ID remains intact, maintaining the logical link.
