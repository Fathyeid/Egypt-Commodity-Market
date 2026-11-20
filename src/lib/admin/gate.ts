import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import { isAdminEmail } from "./index";

/** Signed-in admins only; everyone else gets a plain 404 (the panel's existence isn't advertised). */
export async function requireAdmin(lang: Locale, next: string) {
  const user = await requireUser(lang, next);
  if (!isAdminEmail(user.email)) notFound();
  return user;
}
