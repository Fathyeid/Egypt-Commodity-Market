"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, MessagesSquare, UserRound, House } from "lucide-react";

const ICONS = { home: House, dashboard: LayoutDashboard, learn: BookOpen, tutor: MessagesSquare, profile: UserRound } as const;
type Item = { href: string; label: string; icon: keyof typeof ICONS };

export function NavLinks({ items, variant }: { items: Item[]; variant: "top" | "bottom" }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((it) => {
        const active = pathname === it.href || (it.icon !== "home" && pathname.startsWith(it.href + "/"));
        const Icon = ICONS[it.icon];
        return variant === "top" ? (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${active ? "bg-surface text-text shadow-card" : "text-muted hover:text-text"}`}
          >
            {it.label}
          </Link>
        ) : (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-semibold ${active ? "text-brand" : "text-muted"}`}
          >
            <Icon className="size-5" aria-hidden />
            {it.label}
          </Link>
        );
      })}
    </>
  );
}
