import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { BookOpen, BookOpenCheck, Clock, Flame, Gauge, Layers } from "lucide-react";
import { Header } from "@/components/site/Header";
import { TrackSwitcher } from "@/components/dashboard/TrackSwitcher";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getDashboardStats, getProfile, listLanguages, listTracks } from "@/lib/learner/repo";
import { serviceStatus, type ServiceKey } from "@/lib/services";
import { getProgress, getSkillLevels, latestPlacement } from "@/lib/learner/study";
import { coursesFor, lessonIds, placementAvailable, findLesson } from "@/content";
import { StartPlacementButton } from "@/components/placement/StartPlacementButton";
import { recurringErrors } from "@/lib/learner/conversations";

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

  const [stats, skillRows, placement, errorsTop] = await Promise.all([
    getDashboardStats(db, user.id, active.id),
    getSkillLevels(db, user.id, active.id),
    latestPlacement(db, user.id, active.id),
    recurringErrors(db, user.id, active.id),
  ]);
  const course = coursesFor(active.targetLanguage)[0] ?? null;
  const ids = course ? lessonIds(course) : [];
  const progress = await getProgress(db, user.id, ids);
  // Words introduced in lessons the learner has completed (spaced repetition arrives in Phase 5).
  const wordsLearned = [...progress.keys()].reduce((n, id) => n + (findLesson(id)?.lesson.vocabulary.length ?? 0), 0);
  const nextLessonId = ids.find((id) => !progress.has(id)) ?? null;
  const nextLesson = nextLessonId ? findLesson(nextLessonId)?.lesson ?? null : null;
  const SKILLS = ["vocabulary", "grammar", "reading", "listening", "writing", "speaking", "pronunciation"] as const;
  const SCALE = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
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
    { icon: Layers, label: t.words, value: String(wordsLearned) },
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
        <section className="card space-y-5 p-5 sm:p-6 lg:col-span-2">
          {placementAvailable(active.targetLanguage) && (
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <BookOpenCheck className="size-6" aria-hidden />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{placement?.status === "completed" && level ? fmt(t.placementDone, { level }) : t.placementTitle}</h2>
                {!(placement?.status === "completed") && <p className="mt-1 text-muted">{t.placementBody}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {placement?.status === "completed" ? (
                    <Link href={`/${lang}/placement`} className="btn-ghost">{t.placementResult}</Link>
                  ) : (
                    <StartPlacementButton lang={lang} label={placement?.status === "in_progress" ? dict.placement.resume : t.placementCta} errorText={dict.errors.generic} />
                  )}
                </div>
              </div>
            </div>
          )}
          {nextLesson && (
            <div className="flex items-start gap-4 border-t border-line pt-5 first:border-0 first:pt-0">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <BookOpen className="size-6" aria-hidden />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{t.continueTitle}</h2>
                <p className="mt-1 text-muted">{nextLesson.title[lang]}</p>
                <Link href={`/${lang}/learn/${nextLessonId}`} className="btn-primary mt-3">{t.continueCta}</Link>
              </div>
            </div>
          )}
          {!course && <p className="text-muted">{dict.learn.noCourse}</p>}
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
        <h2 className="mb-3 font-semibold">{t.skillsTitle}</h2>
        {skillRows.length === 0 ? (
          <p className="text-sm text-muted">{t.skillsEmpty}</p>
        ) : (
          <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {SKILLS.map((s) => {
              const row = skillRows.find((r) => r.skill === s);
              return (
                <li key={s} className="grid grid-cols-[7rem_1fr_2.75rem] items-center gap-3 text-sm">
                  <span className={row ? "font-semibold" : "text-muted"}>{dict.skills[s]}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-surface-2">
                    {row && <span className="block h-full rounded-full bg-brand" style={{ width: `${((SCALE.indexOf(row.level) + 1) / SCALE.length) * 100}%` }} />}
                  </span>
                  <span className="rounded-md bg-surface-2 py-0.5 text-center text-xs font-bold">{row?.level ?? "—"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{t.errorsTitle}</h2>
          <Link href={`/${lang}/tutor`} className="text-sm text-brand hover:underline">{t.practiceWithTutor}</Link>
        </div>
        {errorsTop.length === 0 ? (
          <p className="text-sm text-muted">{t.errorsEmpty}</p>
        ) : (
          <ul className="divide-y divide-line" data-testid="recurring-errors">
            {errorsTop.map((e) => (
              <li key={e.tag} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="chip">{e.tag}</span>
                <span dir="auto" lang={active.targetLanguage}><s className="text-danger">{e.example.original}</s> → <b className="text-ok">{e.example.corrected}</b></span>
                <span className="ms-auto font-semibold">×{e.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
