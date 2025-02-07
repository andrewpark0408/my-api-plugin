import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Token:", token);

  const url = req.nextUrl.clone();

  if (!token) {
    console.log("No token found, redirecting to login.");
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/admin") && token.role !== "admin") {
    console.log("Unauthorized access, redirecting to /unauthorized.");
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  console.log("Authorized access.");
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/protected/:path*"], // Add all routes you want to protect
};
