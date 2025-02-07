import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveTokens(realmId: string, accessToken: string, refreshToken: string) {
  if (!realmId || !accessToken || !refreshToken) {
    throw new Error("Missing required parameters: realmId, accessToken, or refreshToken.");
  }

  console.log("Saving tokens to database:", { realmId, accessToken, refreshToken });

  try {
    await prisma.quickBooksToken.upsert({
      where: { realmId }, // Ensure `realmId` is saved as a string
      update: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      create: {
        realmId, // Use `realmId` as a string
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
    console.log("QuickBooks tokens saved successfully!");
  } catch (error) {
    console.error("Error saving tokens to database:", error);
    throw error;
  }
}

export async function getQuickBooksTokens(realmId: string) {
  if (!realmId) {
    throw new Error("Missing required parameter: realmId.");
  }

  console.log("Fetching QuickBooks tokens for realmId:", realmId);

  try {
    const tokens = await prisma.quickBooksToken.findUnique({
      where: { realmId },
    });

    if (!tokens) {
      throw new Error("No QuickBooks tokens found for the provided `realmId`.");
    }

    console.log("Retrieved tokens:", tokens);
    return tokens;
  } catch (error) {
    console.error("Error retrieving tokens from database:", error);
    throw error;
  }
}

