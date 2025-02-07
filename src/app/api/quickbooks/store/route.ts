import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("Session Data:", session);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const invoices = await req.json();

    for (const invoice of invoices) {
      await prisma.quickBooksInvoice.upsert({
        where: { quickbooksId: invoice.Id },
        update: {
          docNumber: invoice.DocNumber,
          txnDate: new Date(invoice.TxnDate),
          dueDate: invoice.DueDate ? new Date(invoice.DueDate) : null,
          customerName: invoice.CustomerRef?.name || "Unknown",
          email: invoice.BillEmail?.Address || null,
          totalAmount: invoice.TotalAmt,
          balance: invoice.Balance || 0,
          taxable: invoice.TxnTaxDetail?.TxnTaxCodeRef ? true : false,
        },
        create: {
          quickbooksId: invoice.Id,
          docNumber: invoice.DocNumber,
          txnDate: new Date(invoice.TxnDate),
          dueDate: invoice.DueDate ? new Date(invoice.DueDate) : null,
          customerName: invoice.CustomerRef?.name || "Unknown",
          email: invoice.BillEmail?.Address || null,
          totalAmount: invoice.TotalAmt,
          balance: invoice.Balance || 0,
          taxable: invoice.TxnTaxDetail?.TxnTaxCodeRef ? true : false,
          createdAt: new Date(),
        },
      });
    }

    return NextResponse.json({ message: "QuickBooks invoices stored successfully" });
  } catch (error) {
    console.error("Error storing QuickBooks invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
