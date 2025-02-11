-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authType" TEXT NOT NULL DEFAULT 'oauth',
ADD COLUMN     "password" TEXT,
ADD COLUMN     "realmId" TEXT;

-- CreateIndex
CREATE INDEX "Invoice_companyName_idx" ON "Invoice"("companyName");
