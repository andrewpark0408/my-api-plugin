-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "balance" DOUBLE PRECISION,
ADD COLUMN     "billAddress" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "docNumber" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "taxable" BOOLEAN;

-- CreateTable
CREATE TABLE "QuickBooksInvoice" (
    "id" TEXT NOT NULL,
    "quickbooksId" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "txnDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "customerName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL,
    "billAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuickBooksInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuickBooksInvoice_quickbooksId_key" ON "QuickBooksInvoice"("quickbooksId");
