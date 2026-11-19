import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

const PROTECTED = ["/dashboard", "/profile", "/onboarding", "/placement", "/learn", "/tutor"];

function preferredLocale(req: NextRequest): Locale {
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;
  const accept = req.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  if (!isLocale(seg)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const rest = pathname.slice(seg.length + 1) || "/";
  // Optimistic check only — real authorization happens on the server (requireUser / repo scoping).
  if (PROTECTED.some((p) => rest === p || rest.startsWith(p + "/")) && !getSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${seg}/sign-in`;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (req.cookies.get(LOCALE_COOKIE)?.value !== seg) {
    res.cookies.set(LOCALE_COOKIE, seg, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
