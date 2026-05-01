import { NextResponse, type NextRequest } from "next/server";

import { isLocale, resolvePreferredLocale } from "@snn/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const candidateLocale = segments[1] ?? "";

  if (isLocale(candidateLocale)) {
    return NextResponse.next();
  }

  const locale = resolvePreferredLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
