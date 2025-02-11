import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const realmId = url.searchParams.get("realmId");

    if (!code || !realmId) {
      return new Response(JSON.stringify({ error: "Missing code or realmId" }), { status: 400 });
    }

    console.log("📥 Received QuickBooks OAuth Code:", code);
    console.log("📥 Received Realm ID:", realmId);

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    console.log("✅ Authenticated user:", session.user.email);

    session.user.realmId = realmId;
    console.log("✅ Stored realmId in session:", session.user.realmId);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { realmId }
    });

    console.log("✅ Saved realmId to the database for", session.user.email);

    return new Response(JSON.stringify({ message: "QuickBooks connected successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error in QuickBooks callback:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
