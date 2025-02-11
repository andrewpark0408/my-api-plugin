import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * GET: Fetch all invoices from the database.
 */
export async function GET() {
  try {
    console.log("🔍 Fetching invoices from database...");

    const invoices = await prisma.invoice.findMany();

    if (!invoices || invoices.length === 0) {
      console.warn("⚠️ No invoices found.");
      return NextResponse.json({ message: "No invoices found." }, { status: 404 });
    }

    console.log("✅ Invoices retrieved:", invoices);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Add a new invoice to the database.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log("📥 Received Invoice Data:", body);

    // Validate required fields
    if (!body.docNumber || !body.companyName || !body.totalAmount || !body.txnDate) {
      console.error("❌ Missing required fields");
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceId: body.docNumber,
        companyName: body.companyName,
        taxable: body.taxable || false,
        totalAmount: body.totalAmount,
        balance: body.balance || 0,
        txnDate: new Date(body.txnDate),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    console.log("✅ Invoice Created:", newInvoice);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("❌ Error saving invoice:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
