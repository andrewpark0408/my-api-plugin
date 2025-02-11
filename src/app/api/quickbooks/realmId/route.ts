import { NextResponse } from "next/server";
import { getQuickBooksTokens } from "@/utils/quickbooks";

export async function GET() {
  try {
    const tokens = await getQuickBooksTokens();
    return NextResponse.json({ realmId: tokens?.realmId || null });
  } catch (error) {
    console.error("❌ Error fetching QuickBooks realmId:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
