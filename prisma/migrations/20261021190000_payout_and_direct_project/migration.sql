-- AlterTable PartnerProject: Allow brokerProfileId to be NULL for direct client projects
ALTER TABLE "PartnerProject" ALTER COLUMN "brokerProfileId" DROP NOT NULL;

-- AlterTable Commission: Add fields for explicit broker payout requests, 48h SLA tracking, and payout settlement
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "payoutRequestedAt" TIMESTAMP(3);
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "payoutDueAt" TIMESTAMP(3);
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "payoutMethod" TEXT;
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "payoutDetails" JSONB;
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "payoutNotes" TEXT;
ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
