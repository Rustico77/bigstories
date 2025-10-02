// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = ["/login", "/public"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Autoriser les pages publiques
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Récupérer le cookie
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Vérifier le token
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Active sur toutes les routes sauf fichiers statiques
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
