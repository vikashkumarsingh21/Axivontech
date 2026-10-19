-- CreateTable
CREATE TABLE "LegalPolicy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'CORE_LEGAL',
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "missingDetails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "changeLog" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyRequest" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "requestDetails" TEXT NOT NULL,
    "verificationToken" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resolutionNotes" TEXT,
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConsentRecord" (
    "id" TEXT NOT NULL,
    "consentKey" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalPolicy_slug_key" ON "LegalPolicy"("slug");
CREATE INDEX "LegalPolicy_slug_idx" ON "LegalPolicy"("slug");
CREATE INDEX "LegalPolicy_category_idx" ON "LegalPolicy"("category");
CREATE INDEX "LegalPolicy_status_idx" ON "LegalPolicy"("status");
CREATE INDEX "LegalPolicy_publishedAt_idx" ON "LegalPolicy"("publishedAt");

-- CreateIndex
CREATE INDEX "PolicyVersion_policyId_idx" ON "PolicyVersion"("policyId");
CREATE INDEX "PolicyVersion_version_idx" ON "PolicyVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyRequest_referenceId_key" ON "PrivacyRequest"("referenceId");
CREATE INDEX "PrivacyRequest_referenceId_idx" ON "PrivacyRequest"("referenceId");
CREATE INDEX "PrivacyRequest_category_idx" ON "PrivacyRequest"("category");
CREATE INDEX "PrivacyRequest_status_idx" ON "PrivacyRequest"("status");
CREATE INDEX "PrivacyRequest_requesterEmail_idx" ON "PrivacyRequest"("requesterEmail");
CREATE INDEX "PrivacyRequest_createdAt_idx" ON "PrivacyRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserConsentRecord_consentKey_key" ON "UserConsentRecord"("consentKey");
CREATE INDEX "UserConsentRecord_consentKey_idx" ON "UserConsentRecord"("consentKey");
CREATE INDEX "UserConsentRecord_timestamp_idx" ON "UserConsentRecord"("timestamp");

-- AddForeignKey
ALTER TABLE "LegalPolicy" ADD CONSTRAINT "LegalPolicy_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LegalPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacyRequest" ADD CONSTRAINT "PrivacyRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
