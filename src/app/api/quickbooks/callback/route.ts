import { saveTokens } from "@/utils/quickbooks";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const realmId = url.searchParams.get("realmId");

    if (!code || !realmId) {
      throw new Error("Missing code or realmId from QuickBooks callback.");
    }

    // Exchange the authorization code for tokens
    const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.QUICKBOOKS_REDIRECT_URI || "",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange QuickBooks authorization code for tokens.");
    }

    const { access_token, refresh_token } = await response.json();

    console.log("Received tokens:", { realmId, access_token, refresh_token });

    // Save the tokens in the database
    await saveTokens(realmId, access_token, refresh_token);

    // Redirect back with a "connected" query parameter
    return Response.redirect("http://localhost:3000/invoices", 302); // Replace with your invoices page route
  } catch (error) {
    console.error("Error exchanging tokens with QuickBooks:", error);
    return new Response(
      JSON.stringify({ message: "Error exchanging tokens", error: error.message }),
      { status: 500 }
    );
  }
}
