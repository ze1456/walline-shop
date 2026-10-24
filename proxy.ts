import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["zh", "en"] as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1] ?? "";
  const isLocalePath = (LOCALES as readonly string[]).includes(segment);

  // Language preference for first-time visitors: cookie, then Accept-Language.
  if (pathname === "/") {
    const cookieLocale = request.cookies.get("walline_locale")?.value;
    const accept = (request.headers.get("accept-language") ?? "").toLowerCase();
    const preferred = cookieLocale === "en" || cookieLocale === "zh" ? cookieLocale : accept.startsWith("zh") ? "zh" : accept.startsWith("en") ? "en" : "zh";
    return NextResponse.redirect(new URL(`/${preferred}`, request.url));
  }

  const locale = isLocalePath ? segment : "zh";
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|api/|images/|favicon.ico|icon.svg|robots.txt).*)"],
};
