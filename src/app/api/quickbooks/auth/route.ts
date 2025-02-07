import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID || "";
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || "";

  if (!clientId || !redirectUri) {
    console.error("Missing QuickBooks environment variables");
    return NextResponse.json(
      { message: "Environment variables not set properly" },
      { status: 500 }
    );
  }

  const url = new URL("https://appcenter.intuit.com/connect/oauth2");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "com.intuit.quickbooks.accounting");
  url.searchParams.set("state", "quickbooks");

  console.log("QuickBooks Authorization URL:", url.toString());

  return NextResponse.redirect(url.toString());
}
