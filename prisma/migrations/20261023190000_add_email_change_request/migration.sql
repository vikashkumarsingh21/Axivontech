-- CreateTable
CREATE TABLE "EmailChangeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldEmail" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailChangeRequest_tokenHash_key" ON "EmailChangeRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_userId_idx" ON "EmailChangeRequest"("userId");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_tokenHash_idx" ON "EmailChangeRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_newEmail_idx" ON "EmailChangeRequest"("newEmail");

-- CreateIndex
CREATE INDEX "EmailChangeRequest_status_idx" ON "EmailChangeRequest"("status");

-- AddForeignKey
ALTER TABLE "EmailChangeRequest" ADD CONSTRAINT "EmailChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
