import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/auth";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const PUBLIC_API = (request: NextRequest) =>
  request.nextUrl.pathname === "/api/orders" && request.method === "POST";

/** Same-origin check for mutations; the session cookie alone would allow CSRF. */
function crossSite(request: NextRequest): boolean {
  if (SAFE_METHODS.includes(request.method)) return false;
  const origin = request.headers.get("origin");
  return origin !== null && origin !== request.nextUrl.origin;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (crossSite(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/")) {
    return NextResponse.next();
  }
  if (PUBLIC_API(request)) return NextResponse.next();

  if (await isValidSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/products/:path*", "/api/orders/:path*"],
};
