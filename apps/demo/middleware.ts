import { NextResponse, type NextRequest } from "next/server";

// Gate: access code first, then a persona choice. Static files and the gate/login pages pass through.
const OPEN = ["/gate", "/api/gate", "/_next", "/brand", "/favicon", "/robots.txt"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (OPEN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const code = process.env.ACCESS_CODE || "takaful";
  if (req.cookies.get("tt_access")?.value !== code) {
    return NextResponse.redirect(new URL("/gate", req.url));
  }
  if (!pathname.startsWith("/login") && !pathname.startsWith("/api/") && !req.cookies.get("tt_user")?.value) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
