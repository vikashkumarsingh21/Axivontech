-- AlterTable Holiday
ALTER TABLE "Holiday" DROP CONSTRAINT IF EXISTS "Holiday_date_key";

ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'PUBLIC_HOLIDAY';
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "isCompanyHoliday" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "sourceEventId" TEXT;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'IN';
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "allDay" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "year" INTEGER;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "lastSyncAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Holiday_date_name_key" ON "Holiday"("date", "name");
CREATE INDEX IF NOT EXISTS "Holiday_year_idx" ON "Holiday"("year");
CREATE INDEX IF NOT EXISTS "Holiday_category_idx" ON "Holiday"("category");
CREATE INDEX IF NOT EXISTS "Holiday_isCompanyHoliday_idx" ON "Holiday"("isCompanyHoliday");
CREATE INDEX IF NOT EXISTS "Holiday_sourceEventId_idx" ON "Holiday"("sourceEventId");
