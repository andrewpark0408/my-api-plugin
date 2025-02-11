/*
  Warnings:

  - You are about to drop the column `companyName` on the `QuickBooksInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `QuickBooksInvoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuickBooksInvoice" DROP COLUMN "companyName",
DROP COLUMN "email",
ADD COLUMN     "applyTaxAfterDiscount" BOOLEAN,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "emailStatus" TEXT,
ADD COLUMN     "lineItems" JSONB,
ADD COLUMN     "printStatus" TEXT,
ADD COLUMN     "totalTax" DOUBLE PRECISION,
ALTER COLUMN "docNumber" DROP NOT NULL,
ALTER COLUMN "customerName" DROP NOT NULL,
ALTER COLUMN "taxable" DROP NOT NULL;
