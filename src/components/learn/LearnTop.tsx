import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Flag, Landmark } from "./Landmarks";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

import credits from "../../../public/images/landmarks/credits.json";

type Credit = { title: string; author: string; license: string; licenseUrl: string; source: string };
const CREDITS = credits as Record<string, Credit>;
/** Photos come from scripts/factory/fetch_landmarks.py; languages without one fall back to an SVG. */
export const landmarkCredit = (language: string): Credit | null => CREDITS[language] ?? null;

/** Level pills on the navy band; the open level is gold. */
export function LevelChips({ lang, levels, current, t }: { lang: "ar" | "en"; levels: string[]; current: string; t: Dictionary["learn"] }) {
  return (
    <nav aria-label={t.levelsLabel} className="flex justify-between gap-1.5 overflow-x-auto px-1 pb-1" data-testid="level-tabs">
      {LEVELS.map((lv) => {
        const on = lv === current;
        const available = levels.includes(lv);
        const cls = `min-w-14 rounded-full border px-3 py-1.5 text-center text-base font-bold transition-colors ${
          on ? "border-transparent bg-[#f2c14e] text-[#1a1300] shadow-[0_0_18px_rgb(242_193_78/0.55)]" : "border-white/15 bg-white/5 text-white hover:bg-white/10"
        } ${available ? "" : "opacity-40"}`;
        return available ? (
          <Link key={lv} href={`/${lang}/learn?level=${lv}`} aria-current={on ? "page" : undefined} className={cls} dir="ltr">
            {lv}
          </Link>
        ) : (
          <span key={lv} className={cls} dir="ltr">{lv}</span>
        );
      })}
    </nav>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="size-24 shrink-0 -rotate-90 sm:size-28" role="img" aria-label={`${pct}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="9" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f2c14e" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${Math.max((pct / 100) * c, 6)} ${c}`} />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="rotate-90 fill-white text-[22px] font-bold" transform="rotate(90 50 50)">
        {pct}%
      </text>
    </svg>
  );
}

/** Banner: landmark photo of the language's country, course title, lessons done, progress ring. */
export function LanguageBanner({ language, title, done, total, t }: { language: string; title: string; done: number; total: number; t: Dictionary["learn"] }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const photo = !!landmarkCredit(language);
  return (
    <section className="relative isolate overflow-hidden" data-testid="learn-hero">
      <div className="absolute inset-0 -z-10">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- static, credited Commons photo
          <img src={`/images/landmarks/${language}.webp`} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-end justify-end bg-gradient-to-b from-[#3d63b8] to-[#14234d] px-6 pb-2">
            <Landmark language={language} className="h-[80%] w-auto fill-[#f2c14e]/80" />
          </div>
        )}
        <div className="hero-fade absolute inset-0" />
      </div>
      <div className="flex min-h-36 items-center gap-4 px-4 py-5 sm:min-h-44">
        <Ring pct={pct} />
        <div className="min-w-0 max-w-[55%]">
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-white/85">{fmt(t.ofLessons, { a: done, b: total })}</p>
        </div>
      </div>
    </section>
  );
}

/** Gold "continue learning" card with a book-and-flag illustration. */
export function ContinueCard({ href, title, subtitle, language }: { href: string | null; title: string; subtitle: string; language: string }) {
  const body = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#121a33] text-white">
        <ChevronLeft className="size-6 ltr:hidden" aria-hidden />
        <ChevronRight className="size-6 rtl:hidden" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold">{title}</span>
        <span className="block text-sm opacity-80">{subtitle}</span>
      </span>
      <span className="relative h-20 w-28 shrink-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/themes/continue.webp" alt="" className="absolute bottom-0 start-0 h-16 w-16 drop-shadow-lg" />
        <Flag language={language} className="absolute end-0 top-1 h-9 w-14 -rotate-12 shadow-lg" />
      </span>
    </>
  );
  const cls = "flex items-center gap-3 rounded-3xl bg-gradient-to-l from-[#f6c544] to-[#f2b632] p-4 text-[#1a1300] shadow-[0_8px_30px_rgb(242_193_78/0.35)] transition-transform hover:-translate-y-0.5";
  return href ? (
    <Link href={href} className={cls} data-testid="continue-card">{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Section header with a search box (plain GET form, works without JavaScript). */
export function UnitsHeader({ lang, level, q, count, t }: { lang: "ar" | "en"; level: string; q: string; count: string; t: Dictionary["learn"] }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121d40] px-4 py-3 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/themes/mixed.webp" alt="" className="size-8" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold" data-testid="units-heading">{t.unitsTitle}</span>
        <span className="block text-xs text-white/70">{count}</span>
      </span>
      <form action={`/${lang}/learn`} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5" role="search">
        <input type="hidden" name="level" value={level} />
        <Search className="size-4 shrink-0 text-white/80" aria-hidden />
        <input name="q" defaultValue={q} placeholder={t.search} aria-label={t.search} className="w-20 bg-transparent text-sm text-white placeholder:text-white/70 focus:outline-none sm:w-32" />
      </form>
    </div>
  );
}
