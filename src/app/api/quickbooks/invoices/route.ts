import { fetchQuickBooksTokens, updateQuickBooksTokens, refreshAccessToken } from "@/utils/quickbooks";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const realmId = url.searchParams.get("realmId");

        if (!realmId) {
            return new Response(JSON.stringify({ error: "Missing realmId" }), { status: 400 });
        }

        console.log("🔍 Fetching stored QuickBooks tokens...");
        let tokens = await fetchQuickBooksTokens(realmId);

        if (!tokens) {
            return new Response(JSON.stringify({ error: "No QuickBooks tokens found" }), { status: 404 });
        }

        if (!tokens.access_token) {
            console.error("❌ No access token found in database!");
            return new Response(JSON.stringify({ error: "No access token found" }), { status: 401 });
        }

        const newTokens = await refreshAccessToken(tokens.refresh_token);
        if (newTokens) {
            await updateQuickBooksTokens(realmId, newTokens.access_token, newTokens.refresh_token);
            tokens.access_token = newTokens.access_token;
        } else {
            return new Response(JSON.stringify({ error: "Failed to refresh token" }), { status: 401 });
        }

        console.log("✅ Using Access Token:", tokens.access_token);

        // ✅ Correct QuickBooks API endpoint
        const quickBooksAPIUrl = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Invoice`;

        const response = await fetch(quickBooksAPIUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${tokens.access_token}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("❌ QuickBooks API error:", response.status, errorDetails);
            return new Response(JSON.stringify({ error: "QuickBooks API Error", details: errorDetails }), { status: response.status });
        }

        const invoices = await response.json();

        return new Response(JSON.stringify(invoices), { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching invoices:", error);
        return new Response(JSON.stringify({ error: "Server error", details: error.message }), { status: 500 });
    }
}
