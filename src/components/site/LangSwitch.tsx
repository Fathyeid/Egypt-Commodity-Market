"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

const CLS = "grid h-10 place-items-center rounded-full border border-line bg-surface px-3.5 text-sm font-semibold hover:bg-surface-2";

export function LangSwitchFallback({ lang, label }: { lang: Locale; label: string }) {
  const other: Locale = lang === "ar" ? "en" : "ar";
  return (
    <Link href={`/${other}`} hrefLang={other} lang={other} className={CLS}>
      {label}
    </Link>
  );
}

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const other: Locale = lang === "ar" ? "en" : "ar";
  const href = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);
  return (
    <Link href={href} hrefLang={other} lang={other} className={CLS}>
      {label}
    </Link>
  );
}
