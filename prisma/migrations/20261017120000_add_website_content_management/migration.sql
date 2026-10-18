-- CreateTable WebsiteSetting
CREATE TABLE "WebsiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "draftData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "updatedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable WebsiteFaq
CREATE TABLE "WebsiteFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "page" TEXT NOT NULL DEFAULT 'GLOBAL',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable WebsiteService
CREATE TABLE "WebsiteService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "badge" TEXT,
    "shortDescription" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'Code',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "benefits" JSONB,
    "process" JSONB,
    "technologies" JSONB,
    "faqs" JSONB,
    "cta" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteService_pkey" PRIMARY KEY ("id")
);

-- CreateTable WebsiteIndustry
CREATE TABLE "WebsiteIndustry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "icon" TEXT DEFAULT 'Building2',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "relatedService" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable WebsiteArticle
CREATE TABLE "WebsiteArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Web & Custom Software',
    "authorName" TEXT NOT NULL DEFAULT 'Axivon Engineering Team',
    "authorRole" TEXT NOT NULL DEFAULT 'Core Engineering',
    "authorAvatar" TEXT,
    "readingTime" TEXT NOT NULL DEFAULT '5 min read',
    "featuredImage" TEXT NOT NULL,
    "featuredImageAlt" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable MediaAsset
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "WebsiteSetting_key_key" ON "WebsiteSetting"("key");
CREATE INDEX "WebsiteSetting_key_idx" ON "WebsiteSetting"("key");
CREATE INDEX "WebsiteSetting_status_idx" ON "WebsiteSetting"("status");

CREATE INDEX "WebsiteFaq_category_idx" ON "WebsiteFaq"("category");
CREATE INDEX "WebsiteFaq_page_idx" ON "WebsiteFaq"("page");
CREATE INDEX "WebsiteFaq_status_idx" ON "WebsiteFaq"("status");
CREATE INDEX "WebsiteFaq_displayOrder_idx" ON "WebsiteFaq"("displayOrder");

CREATE UNIQUE INDEX "WebsiteService_slug_key" ON "WebsiteService"("slug");
CREATE INDEX "WebsiteService_slug_idx" ON "WebsiteService"("slug");
CREATE INDEX "WebsiteService_status_idx" ON "WebsiteService"("status");
CREATE INDEX "WebsiteService_displayOrder_idx" ON "WebsiteService"("displayOrder");

CREATE UNIQUE INDEX "WebsiteIndustry_slug_key" ON "WebsiteIndustry"("slug");
CREATE INDEX "WebsiteIndustry_slug_idx" ON "WebsiteIndustry"("slug");
CREATE INDEX "WebsiteIndustry_status_idx" ON "WebsiteIndustry"("status");
CREATE INDEX "WebsiteIndustry_displayOrder_idx" ON "WebsiteIndustry"("displayOrder");

CREATE UNIQUE INDEX "WebsiteArticle_slug_key" ON "WebsiteArticle"("slug");
CREATE INDEX "WebsiteArticle_slug_idx" ON "WebsiteArticle"("slug");
CREATE INDEX "WebsiteArticle_category_idx" ON "WebsiteArticle"("category");
CREATE INDEX "WebsiteArticle_status_idx" ON "WebsiteArticle"("status");
CREATE INDEX "WebsiteArticle_featured_idx" ON "WebsiteArticle"("featured");
CREATE INDEX "WebsiteArticle_publishedAt_idx" ON "WebsiteArticle"("publishedAt");

CREATE INDEX "MediaAsset_fileType_idx" ON "MediaAsset"("fileType");
CREATE INDEX "MediaAsset_folder_idx" ON "MediaAsset"("folder");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- AddForeignKeys
ALTER TABLE "WebsiteSetting" ADD CONSTRAINT "WebsiteSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebsiteFaq" ADD CONSTRAINT "WebsiteFaq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebsiteService" ADD CONSTRAINT "WebsiteService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebsiteIndustry" ADD CONSTRAINT "WebsiteIndustry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebsiteArticle" ADD CONSTRAINT "WebsiteArticle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
