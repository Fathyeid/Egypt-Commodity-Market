import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";
import { NavLinks } from "./NavLinks";
import { SignOutButton } from "./SignOutButton";
import { getSession } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <>
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3">
        <Logo href={`/${lang}`} label={dict.brand} />
        <div className="ms-auto flex items-center gap-2">
          <Suspense fallback={<div className="h-10 w-24" aria-hidden />}>
            <UserArea lang={lang} dict={dict} />
          </Suspense>
          <LangSwitch lang={lang} label={dict.nav.switchLang} />
          <ThemeToggle label={dict.nav.theme} />
        </div>
      </div>
    </header>
    {/* Outside <header>: its backdrop-filter would otherwise trap position:fixed. */}
    <Suspense>
      <MobileNav lang={lang} dict={dict} />
    </Suspense>
    </>
  );
}

async function MobileNav({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const session = await getSession();
  if (!session) return null;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] sm:hidden"
      aria-label={dict.nav.menu}
    >
      <NavLinks
        variant="bottom"
        items={[
          { href: `/${lang}`, label: dict.nav.home, icon: "home" },
          { href: `/${lang}/dashboard`, label: dict.nav.dashboard, icon: "dashboard" },
          { href: `/${lang}/profile`, label: dict.nav.profile, icon: "profile" },
        ]}
      />
    </nav>
  );
}

async function UserArea({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const session = await getSession();
  if (!session) {
    return (
      <>
        <Link href={`/${lang}/sign-in`} className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-muted hover:text-text sm:inline-block">
          {dict.nav.signIn}
        </Link>
        <Link href={`/${lang}/sign-up`} className="btn-primary px-4 py-2 text-sm">
          {dict.nav.signUp}
        </Link>
      </>
    );
  }
  const items = [
    { href: `/${lang}/dashboard`, label: dict.nav.dashboard, icon: "dashboard" as const },
    { href: `/${lang}/profile`, label: dict.nav.profile, icon: "profile" as const },
  ];
  return (
    <>
      <nav className="hidden items-center gap-1 sm:flex" aria-label={dict.nav.menu}>
        <NavLinks items={items} variant="top" />
      </nav>
      <SignOutButton lang={lang} label={dict.nav.signOut} compact />
    </>
  );
}
