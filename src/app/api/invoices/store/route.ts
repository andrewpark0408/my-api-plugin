import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { invoices } = await req.json();

    for (const invoice of invoices) {
      await prisma.invoice.upsert({
        where: { invoiceId: invoice.Id },
        update: {
          customerId: invoice.CustomerRef.value,
          totalAmount: invoice.TotalAmt,
          status: invoice.Balance === 0 ? "paid" : "pending",
        },
        create: {
          invoiceId: invoice.Id,
          customerId: invoice.CustomerRef.value,
          totalAmount: invoice.TotalAmt,
          status: invoice.Balance === 0 ? "paid" : "pending",
        },
      });
    }

    return NextResponse.json({ message: "Invoices stored successfully" });
  } catch (error) {
    console.error("Error storing invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
