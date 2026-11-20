import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";
import type { Locale } from "@/lib/i18n/config";

/** Reads the session at request time. Must be called inside a <Suspense> boundary. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireUser(lang: Locale, next?: string) {
  const session = await getSession();
  if (!session) {
    const q = next ? `?next=${encodeURIComponent(next)}` : "";
    redirect(`/${lang}/sign-in${q}`);
  }
  return session.user;
}
