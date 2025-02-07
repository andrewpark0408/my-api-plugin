/*
  Warnings:

  - You are about to drop the column `billAddress` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `billAddress` on the `QuickBooksInvoice` table. All the data in the column will be lost.
  - Added the required column `txnDate` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Made the column `balance` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyName` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "billAddress",
DROP COLUMN "customerId",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "txnDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "companyName" SET NOT NULL;

-- AlterTable
ALTER TABLE "QuickBooksInvoice" DROP COLUMN "billAddress";
