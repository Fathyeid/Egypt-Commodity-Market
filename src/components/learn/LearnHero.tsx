import Link from "next/link";
import { Check, Crown, Play } from "lucide-react";
import { Flag, Landmark } from "./Landmarks";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 30 80" className={`h-16 w-6 text-gold ${flip ? "-scale-x-100" : ""}`} aria-hidden>
      <path d="M24 78 C10 64 6 40 14 4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {[10, 22, 34, 46, 58].map((y, i) => (
        <ellipse key={y} cx={i % 2 ? 18 : 8} cy={y} rx="6" ry="3" transform={`rotate(${i % 2 ? 35 : -35} ${i % 2 ? 18 : 8} ${y})`} fill="currentColor" />
      ))}
    </svg>
  );
}

type HeroProps = {
  lang: "ar" | "en";
  language: string;
  languageName: string;
  level: string;
  done: number;
  total: number;
  t: Dictionary["learn"];
};

/** Language banner: landmark silhouette and flag, the current level in large type, and progress. */
export function LearnHero({ lang, language, languageName, level, done, total, t }: HeroProps) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <section className="hero relative overflow-hidden rounded-3xl p-5 sm:p-7" data-testid="learn-hero">
      <div className="pointer-events-none absolute inset-y-0 end-0 flex w-1/2 items-end justify-end opacity-90">
        <Landmark language={language} className="hero-landmark h-[85%] max-h-56 w-auto fill-current" />
      </div>
      <Flag language={language} className="absolute end-5 top-5 h-8 w-12 rotate-6 sm:h-10 sm:w-16" />
      <div className="relative max-w-[60%] space-y-3">
        <p className="text-sm font-semibold opacity-80">{languageName}</p>
        <p className="text-sm font-semibold">{t.currentLevel}</p>
        <div className="flex items-center gap-1">
          <Laurel />
          <span className="text-gold text-6xl font-black leading-none tracking-tight sm:text-7xl" dir="ltr">{level}</span>
          <Laurel flip />
        </div>
        <div className="inline-flex items-center gap-3 rounded-full border border-gold/50 bg-black/10 px-4 py-1.5 text-sm">
          <span className="text-gold text-lg font-bold" dir="ltr">{pct}%</span>
          <span>{fmt(t.ofLessons, { a: done, b: total })}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </div>
      <p className="hero-motto relative mt-3 text-end text-lg font-bold italic" aria-hidden>{t.keepGoing}</p>
      <span className="sr-only">{lang}</span>
    </section>
  );
}

/** Big "continue learning" card with a play button. */
export function ContinueCard({ href, title, subtitle, language }: { href: string | null; title: string; subtitle: string; language: string }) {
  const body = (
    <>
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold text-[#1a1300] shadow-lg">
        <Play className="size-7 fill-current" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-gold block text-2xl font-bold">{title}</span>
        <span className="block text-sm opacity-85">{subtitle}</span>
      </span>
      <span className="relative hidden h-16 w-20 shrink-0 sm:block" aria-hidden>
        <span className="absolute inset-0 rotate-[-8deg] rounded-md bg-brand shadow-lg" />
        <Flag language={language} className="absolute bottom-2 start-3 h-6 w-9" />
      </span>
    </>
  );
  return href ? (
    <Link href={href} className="continue-card flex items-center gap-4 rounded-3xl p-4 transition-transform hover:-translate-y-0.5 sm:p-5" data-testid="continue-card">
      {body}
    </Link>
  ) : (
    <div className="continue-card flex items-center gap-4 rounded-3xl p-4 sm:p-5">{body}</div>
  );
}

/** Level journey: a winding road through A1 → C2; the learner's level wears a crown. */
export function LevelJourney({ lang, levels, current, home, t }: { lang: "ar" | "en"; levels: string[]; current: string; home: string; t: Dictionary["learn"] }) {
  const homeIdx = LEVELS.indexOf(home as (typeof LEVELS)[number]);
  return (
    <section className="space-y-2" aria-label={t.journey} data-testid="level-tabs">
      <h2 className="text-gold flex items-center justify-center gap-3 text-xl font-bold">
        <span className="h-px w-12 bg-current opacity-60" /> {t.journey} <span className="h-px w-12 bg-current opacity-60" />
      </h2>
      <div className="journey relative rounded-3xl px-2 pb-3 pt-6">
        <svg viewBox="0 0 600 80" preserveAspectRatio="none" className="absolute inset-x-0 top-6 h-16 w-full" aria-hidden>
          <path d="M0 50 C100 10 200 70 300 40 S500 10 600 45" className="journey-road" fill="none" strokeWidth="14" strokeLinecap="round" />
          <path d="M0 50 C100 10 200 70 300 40 S500 10 600 45" className="journey-dash" fill="none" strokeWidth="2" strokeDasharray="6 10" />
        </svg>
        <ol className="relative grid grid-cols-6 gap-1">
          {LEVELS.map((lv, i) => {
            const available = levels.includes(lv);
            const isCurrent = lv === current;
            const passed = i < homeIdx;
            const node = (
              <span className="flex flex-col items-center gap-1" style={{ marginTop: [18, 0, 26, 8, 0, 14][i] }}>
                <span
                  className={`relative grid place-items-center rounded-full font-bold shadow ${
                    isCurrent ? "size-14 bg-brand text-brand-ink ring-4 ring-gold/70" : "size-11 bg-surface text-text ring-2 ring-line"
                  } ${available ? "" : "opacity-40"}`}
                >
                  {isCurrent && <Crown className="text-gold absolute -top-5 size-6 fill-current" aria-hidden />}
                  {passed && !isCurrent ? <Check className="size-5 text-ok" aria-hidden /> : <span dir="ltr">{lv}</span>}
                </span>
                <span className="text-xs font-semibold" dir="ltr">{isCurrent ? t.current : lv}</span>
              </span>
            );
            return (
              <li key={lv} className="flex justify-center">
                {available ? (
                  <Link href={`/${lang}/learn?level=${lv}`} aria-current={isCurrent ? "page" : undefined} aria-label={lv}>
                    {node}
                  </Link>
                ) : (
                  node
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
