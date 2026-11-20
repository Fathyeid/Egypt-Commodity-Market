import Link from "next/link";

export function Logo({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-lg font-bold">
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-ink" aria-hidden>
        ل
      </span>
      <span>{label}</span>
    </Link>
  );
}
