import { Check, Flame } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import type { ActivityDay } from "@/lib/learner/activity";

type Props = {
  lang: Locale;
  t: Dictionary["dashboard"];
  days: ActivityDay[];
  today: string;
  streak: number;
  xpToday: number;
  activeToday: boolean;
};

/** Server-rendered, no extra client requests or dependencies. */
export function ActivityWeek({ lang, t, days, today, streak, xpToday, activeToday }: Props) {
  const weekday = new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" });
  const fullDate = new Intl.DateTimeFormat(lang, { dateStyle: "full", timeZone: "UTC" });
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="activity-title" data-testid="activity-week">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="activity-title" className="flex items-center gap-2 font-semibold">
            <Flame className="size-5 text-brand" aria-hidden />{t.activityTitle}
          </h2>
          <p className="mt-1 text-sm text-muted" role="status">
            {activeToday ? t.streakProtected : streak > 0 ? t.streakAtRisk : t.streakStart}
          </p>
        </div>
        <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand" data-testid="xp-today">
          {fmt(t.xpToday, { n: xpToday })}
        </p>
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-3" aria-label={t.activityTitle}>
        {days.map((day) => {
          const date = new Date(`${day.day}T12:00:00Z`);
          const active = day.activities > 0;
          return (
            <li key={day.day} className="min-w-0 text-center" data-active={active} aria-current={day.day === today ? "date" : undefined}>
              <time dateTime={day.day} title={fullDate.format(date)} className="block truncate text-xs text-muted">{weekday.format(date)}</time>
              <span className={`mx-auto mt-2 grid size-8 place-items-center rounded-full border sm:size-10 ${active ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface-2 text-faint"} ${day.day === today ? "ring-2 ring-brand/40 ring-offset-2 ring-offset-surface" : ""}`}>
                {active ? <Check className="size-4" aria-hidden /> : <span aria-hidden>·</span>}
                <span className="sr-only">{active ? t.activityDone : t.activityEmpty}</span>
              </span>
              <span className="mt-1 block text-xs text-muted" dir="ltr">{day.xp} XP</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-faint">{t.activityRules}</p>
      <p className="mt-1 text-xs text-faint">{t.activityUtc}</p>
    </section>
  );
}
