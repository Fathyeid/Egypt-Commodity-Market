"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const other: Locale = lang === "ar" ? "en" : "ar";
  const href = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);
  return (
    <Link href={href} hrefLang={other} lang={other} className="grid h-10 place-items-center rounded-full border border-line bg-surface px-3.5 text-sm font-semibold hover:bg-surface-2">
      {label}
    </Link>
  );
}
