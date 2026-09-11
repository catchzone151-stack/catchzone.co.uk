import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * The legacy static site under public/apps/** relies on directory-index
 * resolution (e.g. /apps/islamquest/ -> apps/islamquest/index.html), which
 * the classic `serve` static server did automatically but Next's public/
 * file handler does not. This preserves every existing app URL without
 * having to enumerate ~40 legacy directories by hand.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/apps") && !pathname.split("/").pop()?.includes(".")) {
    const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const url = request.nextUrl.clone();
    url.pathname = `${normalized}index.html`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/apps/:path*",
};
