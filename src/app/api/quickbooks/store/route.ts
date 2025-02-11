import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // console.log("📥 Raw QuickBooks Invoices:", body);

    if (!body.invoices || !Array.isArray(body.invoices) || body.invoices.length === 0) {
      console.error("❌ No valid invoices found in response:", body);
      return NextResponse.json({ error: "Invalid QuickBooks invoice response" }, { status: 400 });
    }

    const invoices = body.invoices;
    console.log(`✅ Extracted ${invoices.length} invoices`);

    for (const invoice of invoices) {
      const companyName = invoice.CustomerRef?.name || "Unknown";

      await prisma.quickBooksInvoice.upsert({
        where: { quickbooksId: invoice.Id },
        update: {
          docNumber: invoice.DocNumber || null,
          txnDate: invoice.TxnDate ? new Date(invoice.TxnDate) : new Date(),
          dueDate: invoice.DueDate ? new Date(invoice.DueDate) : null,
          customerName: companyName,
          email: invoice.BillEmail?.Address || null,
          totalAmount: invoice.TotalAmt || 0,
          balance: invoice.Balance || 0,
          taxable: invoice.TxnTaxDetail?.TotalTax ? true : false,
          totalTax: invoice.TxnTaxDetail?.TotalTax || 0,
          printStatus: invoice.PrintStatus || "NotSet",
          emailStatus: invoice.EmailStatus || "NotSet",
          applyTaxAfterDiscount: invoice.ApplyTaxAfterDiscount || false,
          lineItems: invoice.Line ? JSON.stringify(invoice.Line) : "[]",
          updatedAt: new Date(), // ✅ Ensure this field is properly updated
        },
        create: {
          quickbooksId: invoice.Id,
          docNumber: invoice.DocNumber || null,
          txnDate: invoice.TxnDate ? new Date(invoice.TxnDate) : new Date(),
          dueDate: invoice.DueDate ? new Date(invoice.DueDate) : null,
          customerName: companyName,
          email: invoice.BillEmail?.Address || null,
          totalAmount: invoice.TotalAmt || 0,
          balance: invoice.Balance || 0,
          taxable: invoice.TxnTaxDetail?.TotalTax ? true : false,
          totalTax: invoice.TxnTaxDetail?.TotalTax || 0,
          printStatus: invoice.PrintStatus || "NotSet",
          emailStatus: invoice.EmailStatus || "NotSet",
          applyTaxAfterDiscount: invoice.ApplyTaxAfterDiscount || false,
          lineItems: invoice.Line ? JSON.stringify(invoice.Line) : "[]",
          createdAt: new Date(),
          updatedAt: new Date(), // ✅ Ensure this field is properly created
          companyName: companyName,
        },
      });
    }

    console.log("✅ Successfully stored QuickBooks invoices in DB!");
    return NextResponse.json({ message: "QuickBooks invoices stored successfully" });
  } catch (error) {
    console.error("❌ Error storing QuickBooks invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
