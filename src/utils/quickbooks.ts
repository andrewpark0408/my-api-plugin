import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchQuickBooksTokens(realmId: string) {
  try {
      console.log("🔍 Fetching QuickBooks tokens for realmId:", realmId);

      const tokens = await prisma.quickBooksToken.findUnique({
          where: { realmId }
      });

      console.log("✅ Tokens retrieved from DB:", tokens);

      if (!tokens || !tokens.access_token) {
          console.error("❌ No QuickBooks tokens found for realmId:", realmId);
          return null;
      }

      return tokens;
  } catch (error) {
      console.error("❌ Error fetching QuickBooks tokens:", error);
      return null;
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
      const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
          method: "POST",
          headers: {
              "Authorization": `Basic ${authHeader}`,
              "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: refreshToken
          })
      });

      const data = await response.json();
      if (!response.ok) {
          console.error("❌ Error refreshing token:", data);
          return null;
      }

      console.log("✅ Access token refreshed:", data);
      return data;
  } catch (error) {
      console.error("❌ Failed to refresh QuickBooks access token:", error);
      return null;
  }
}

export async function updateQuickBooksTokens(realmId: string, accessToken: string, refreshToken: string) {
  try {
      console.log("🔄 Updating QuickBooks tokens in database:", { realmId, accessToken, refreshToken });

      await prisma.quickBooksToken.update({
          where: { realmId },
          data: {
              access_token: accessToken,
              refresh_token: refreshToken,
              updatedAt: new Date(),
          },
      });

      console.log("✅ QuickBooks tokens updated successfully!");
  } catch (error) {
      console.error("❌ Error updating QuickBooks tokens:", error);
  }
}
