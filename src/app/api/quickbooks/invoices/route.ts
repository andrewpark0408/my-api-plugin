import { getQuickBooksTokens } from "@/utils/quickbooks";
import { NextResponse } from "next/server";
const QuickBooks = require("node-quickbooks");

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const realmId = url.searchParams.get("realmId");

    if (!realmId) {
      return NextResponse.json({ message: "Missing realmId" }, { status: 400 });
    }

    // Fetch tokens from the database
    console.log("Fetching QuickBooks tokens for realmId:", realmId);
    const tokens = await getQuickBooksTokens(realmId);

    if (!tokens) {
      console.error("No QuickBooks tokens found for the provided realmId:", realmId);
      return NextResponse.json({ message: "No tokens found for the given realmId" }, { status: 404 });
    }

    const { access_token, refresh_token } = tokens;

    // Initialize QuickBooks client
    const qbo = new QuickBooks(
      process.env.QUICKBOOKS_CLIENT_ID,
      process.env.QUICKBOOKS_CLIENT_SECRET,
      access_token,
      false,
      realmId,
      true,
      false,
      null,
      "2.0",
      refresh_token
    );

    // Fetch invoices
    const invoices = await new Promise((resolve, reject) => {
      qbo.findInvoices({}, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Error fetching invoices", error: error.message },
      { status: 500 }
    );
  }
}
