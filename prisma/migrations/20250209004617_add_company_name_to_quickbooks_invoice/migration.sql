/*
  Warnings:

  - Added the required column `companyName` to the `QuickBooksInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuickBooksInvoice" ADD COLUMN     "companyName" TEXT NOT NULL;
