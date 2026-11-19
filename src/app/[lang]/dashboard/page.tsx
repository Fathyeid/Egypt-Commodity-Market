import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { BookOpenCheck, Clock, Flame, Gauge, Layers } from "lucide-react";
import { Header } from "@/components/site/Header";
import { TrackSwitcher } from "@/components/dashboard/TrackSwitcher";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getDashboardStats, getProfile, listLanguages, listTracks } from "@/lib/learner/repo";
import { serviceStatus, type ServiceKey } from "@/lib/services";

export default async function DashboardPage({ params }: PageProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<DashboardSkeleton />}>
          <Dashboard lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Dashboard({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/dashboard`);
  const [profile, tracks, langs] = await Promise.all([getProfile(db, user.id), listTracks(db, user.id), listLanguages(db)]);
  const active = tracks.find((t) => t.isActive) ?? null;
  if (!profile?.onboardedAt || !active) redirect(`/${lang}/onboarding`);

  const stats = await getDashboardStats(db, user.id, active.id);
  const t = dict.dashboard;
  const langOf = (code: string) => langs.find((l) => l.code === code);
  const langName = (code: string) => {
    const l = langOf(code);
    return l ? (lang === "ar" ? l.nameAr : l.nameEn) : code;
  };
  const level = active.placementLevel ?? null;
  const services = serviceStatus();
  const hasActivity = stats.totalXp > 0 || stats.minutesThisWeek > 0 || stats.streak > 0;

  const kpis = [
    { icon: Gauge, label: t.level, value: level ?? active.selfLevel, sub: level ? null : t.levelSelf },
    { icon: Layers, label: t.words, value: String(stats.wordsLearned) },
    { icon: Flame, label: t.streak, value: String(stats.streak) },
    { icon: Clock, label: t.minutes, value: String(stats.minutesThisWeek), sub: fmt(t.dailyGoal, { n: active.dailyMinutes }) },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <section>
        <h1 className="text-2xl font-bold sm:text-3xl">{fmt(t.greeting, { name: profile.name })}</h1>
        <p className="mt-1 text-muted">{fmt(t.learning, { lang: langName(active.targetLanguage), goal: dict.goals[active.goal] })}</p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="KPIs">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <k.icon className="size-5 text-brand" aria-hidden />
            <div className="mt-2 text-2xl font-bold" dir="ltr" style={{ textAlign: "start" }}>{k.value}</div>
            <div className="text-sm text-muted">{k.label}</div>
            {k.sub && <div className="mt-0.5 text-xs text-faint">{k.sub}</div>}
          </div>
        ))}
      </section>

      {!hasActivity && <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">{t.emptyActivity}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <BookOpenCheck className="size-6" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{t.placementTitle}</h2>
              <p className="mt-1 text-muted">{t.placementBody}</p>
              <button type="button" className="btn-primary mt-4" disabled>
                {t.placementCta} · {fmt(dict.common.comingPhase, { n: 2 })}
              </button>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t.tracksTitle}</h2>
            <Link href={`/${lang}/profile#tracks`} className="text-sm text-brand hover:underline">{t.manageTracks}</Link>
          </div>
          <TrackSwitcher
            activeLabel={t.active}
            tracks={tracks.map((tr) => ({ id: tr.id, code: tr.targetLanguage, name: langName(tr.targetLanguage), glyph: langOf(tr.targetLanguage)?.glyph ?? "?", isActive: tr.isActive }))}
          />
        </section>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-3 font-semibold">{t.servicesTitle}</h2>
        <ul className="flex flex-wrap gap-2">
          {(Object.keys(services) as ServiceKey[]).map((k) => (
            <li key={k} className={`chip ${services[k] ? "bg-brand-soft text-brand" : ""}`}>
              <span className={`size-1.5 rounded-full ${services[k] ? "bg-ok" : "bg-faint"}`} aria-hidden />
              {t.services[k]}: {services[k] ? t.on : t.off}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="h-9 w-56 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
