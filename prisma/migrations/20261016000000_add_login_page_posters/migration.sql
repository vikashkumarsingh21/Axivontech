-- CreateTable
CREATE TABLE "LoginPagePoster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginPagePoster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginPagePoster_status_idx" ON "LoginPagePoster"("status");

-- CreateIndex
CREATE INDEX "LoginPagePoster_displayOrder_idx" ON "LoginPagePoster"("displayOrder");

-- AddForeignKey
ALTER TABLE "LoginPagePoster" ADD CONSTRAINT "LoginPagePoster_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
