-- CreateTable
CREATE TABLE "ProjectLibraryItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "clientCompany" TEXT,
    "industry" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "projectType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "liveUrl" TEXT,
    "demoUrl" TEXT,
    "clientPreviewUrl" TEXT,
    "documentationUrl" TEXT,
    "githubUrl" TEXT,
    "shortDescription" TEXT NOT NULL,
    "overview" TEXT,
    "businessRequirement" TEXT,
    "problemStatement" TEXT,
    "solutionDelivered" TEXT,
    "objectives" TEXT,
    "scopeOfWork" TEXT,
    "deliverables" TEXT,
    "frontendTech" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "backendTech" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "databaseTech" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "frameworks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "apisAndIntegrations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hostingPlatform" TEXT,
    "devTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalTech" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thumbnailUrl" TEXT,
    "websiteScreenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dashboardScreenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mobileScreenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "demoVideoUrl" TEXT,
    "presentationHighlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "presentationNotes" TEXT,
    "isPresentationReady" BOOLEAN NOT NULL DEFAULT true,
    "internalNotes" TEXT,
    "assignedTeam" TEXT,
    "projectOwner" TEXT,
    "developmentDepartment" TEXT,
    "deliveryNotes" TEXT,
    "maintenanceInfo" TEXT,
    "qualityNotes" TEXT,
    "confidentialData" TEXT,
    "deliveryConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "reviewStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    "finalApprovedLink" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedReason" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLibraryAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLibraryAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLibraryDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLibraryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLibraryAuditLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userRole" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLibraryAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLibraryItem_slug_key" ON "ProjectLibraryItem"("slug");
CREATE INDEX "ProjectLibraryItem_slug_idx" ON "ProjectLibraryItem"("slug");
CREATE INDEX "ProjectLibraryItem_status_idx" ON "ProjectLibraryItem"("status");
CREATE INDEX "ProjectLibraryItem_isArchived_idx" ON "ProjectLibraryItem"("isArchived");
CREATE INDEX "ProjectLibraryItem_industry_idx" ON "ProjectLibraryItem"("industry");
CREATE INDEX "ProjectLibraryItem_category_idx" ON "ProjectLibraryItem"("category");
CREATE INDEX "ProjectLibraryItem_completionDate_idx" ON "ProjectLibraryItem"("completionDate");

-- CreateIndex
CREATE INDEX "ProjectLibraryAsset_projectId_idx" ON "ProjectLibraryAsset"("projectId");
CREATE INDEX "ProjectLibraryAsset_assetType_idx" ON "ProjectLibraryAsset"("assetType");

-- CreateIndex
CREATE INDEX "ProjectLibraryDocument_projectId_idx" ON "ProjectLibraryDocument"("projectId");
CREATE INDEX "ProjectLibraryDocument_isConfidential_idx" ON "ProjectLibraryDocument"("isConfidential");

-- CreateIndex
CREATE INDEX "ProjectLibraryAuditLog_projectId_idx" ON "ProjectLibraryAuditLog"("projectId");
CREATE INDEX "ProjectLibraryAuditLog_action_idx" ON "ProjectLibraryAuditLog"("action");
CREATE INDEX "ProjectLibraryAuditLog_userId_idx" ON "ProjectLibraryAuditLog"("userId");

-- AddForeignKey
ALTER TABLE "ProjectLibraryItem" ADD CONSTRAINT "ProjectLibraryItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectLibraryItem" ADD CONSTRAINT "ProjectLibraryItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLibraryAsset" ADD CONSTRAINT "ProjectLibraryAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectLibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLibraryDocument" ADD CONSTRAINT "ProjectLibraryDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectLibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLibraryAuditLog" ADD CONSTRAINT "ProjectLibraryAuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectLibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
