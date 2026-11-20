import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle, Headphones, BookOpen, PenLine, AudioLines } from "lucide-react";
import { listSavedWords } from "@/lib/learner/skills";
import { SavedWords } from "@/components/practice/SavedWords";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { getProgress } from "@/lib/learner/study";
import { coursesForLanguage, outlineLessonIds } from "@/lib/curriculum";
import { wordCounts } from "@/lib/learner/srs";

export default async function LearnPage({ params, searchParams }: PageProps<"/[lang]/learn">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Course lang={lang} dict={dict} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

function Centers({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.practice;
  const items = [
    { key: "listening", icon: Headphones },
    { key: "reading", icon: BookOpen },
    { key: "writing", icon: PenLine },
    { key: "pronunciation", icon: AudioLines },
  ] as const;
  return (
    <section>
      <h2 className="mb-3 font-semibold">{t.centersTitle}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ key, icon: Icon }) => (
          <Link key={key} href={`/${lang}/learn/${key}`} className="card p-4 transition-shadow hover:shadow-card" data-testid={`center-${key}`}>
            <Icon className="size-6 text-brand" aria-hidden />
            <h3 className="mt-2 font-semibold">{t[key][0]}</h3>
            <p className="mt-0.5 text-xs text-muted">{t[key][1]}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function ReviewLink({ lang, dict, userId, language }: { lang: Locale; dict: Dictionary; userId: string; language: string }) {
  const c = await wordCounts(db, userId, language);
  return (
    <Link href={`/${lang}/learn/review`} className="card flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-card" data-testid="learn-review">
      <span>
        <span className="block font-semibold">{dict.review.title}</span>
        <span className="block text-sm text-muted">{fmt(dict.review.stats, { due: c.due, learned: c.learned, total: c.total })}</span>
      </span>
      <span className={`rounded-full px-3 py-1 text-sm font-bold ${c.due > 0 ? "bg-brand text-brand-ink" : "bg-surface-2 text-muted"}`}>{c.due}</span>
    </Link>
  );
}

async function Words({ lang, dict, userId, language }: { lang: Locale; dict: Dictionary; userId: string; language: string }) {
  const words = await listSavedWords(db, userId, language);
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-2 font-semibold">{dict.practice.myWords}</h2>
      {words.length === 0 ? (
        <p className="text-sm text-muted">{dict.practice.myWordsEmpty}</p>
      ) : (
        <SavedWords words={words} language={language} labels={{ remove: dict.practice.remove, listen: dict.placement.listen, noVoice: dict.lesson.noVoice }} />
      )}
      <span className="sr-only">{lang}</span>
    </section>
  );
}

async function Course({ lang, dict, searchParams }: { lang: Locale; dict: Dictionary; searchParams: PageProps<"/[lang]/learn">["searchParams"] }) {
  const sp = await searchParams;
  const user = await requireUser(lang, `/${lang}/learn`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.learn;
  const courses = await coursesForLanguage(db, track.targetLanguage);
  if (!courses.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <p className="card p-5 text-muted">{t.noCourse}</p>
        <Centers lang={lang} dict={dict} />
      </div>
    );
  }
  const wanted = typeof sp.level === "string" ? sp.level : (track.placementLevel ?? track.selfLevel);
  const course = courses.find((c) => c.level === wanted) ?? courses.find((c) => c.level === "A1") ?? courses[0];
  const ids = outlineLessonIds(course);
  const progress = await getProgress(db, user.id, ids);
  const nextId = ids.find((id) => !progress.has(id));
  const openUnit = course.units.find((u) => u.lessons.some((l) => l.id === nextId))?.id ?? course.units[0]?.id;
  return (
    <div className="space-y-6">
      {courses.length > 1 && (
        <nav aria-label={t.levelsLabel} className="flex flex-wrap gap-2" data-testid="level-tabs">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/${lang}/learn?level=${c.level}`}
              aria-current={c.id === course.id ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${c.id === course.id ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface hover:bg-surface-2"}`}
            >
              {c.level}
            </Link>
          ))}
        </nav>
      )}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{course.title[lang]}</h1>
        <p className="mt-1 text-muted">{fmt(t.progress, { a: progress.size, b: ids.length })}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-brand" style={{ width: `${(progress.size / ids.length) * 100}%` }} />
        </div>
      </div>
      <ReviewLink lang={lang} dict={dict} userId={user.id} language={track.targetLanguage} />
      <Centers lang={lang} dict={dict} />
      {course.units.map((unit) => (
        <details key={unit.id} open={unit.id === openUnit} className="card group p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
            <h2>{unit.title[lang]}</h2>
            <span className="text-sm font-normal text-muted">
              {fmt(t.unitProgress, { a: unit.lessons.filter((l) => progress.has(l.id)).length, b: unit.lessons.length })}
            </span>
          </summary>
          <ol className="mt-3 space-y-2">
            {unit.lessons.map((lesson) => {
              const best = progress.get(lesson.id);
              const isNext = lesson.id === nextId;
              const Icon = best !== undefined ? CheckCircle2 : isNext ? PlayCircle : Circle;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/${lang}/learn/${lesson.id}`}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-surface-2 ${isNext ? "border-brand bg-brand-soft/40" : "border-line"}`}
                    data-testid={`lesson-${lesson.id}`}
                  >
                    <Icon className={`size-6 shrink-0 ${best !== undefined || isNext ? "text-brand" : "text-faint"}`} aria-hidden />
                    <span className="flex-1">
                      <span className="block font-semibold">{lesson.title[lang]}</span>
                      <span className="block text-sm text-muted">{lesson.goal[lang]}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-brand">
                      {best !== undefined ? fmt(t.best, { n: best }) : isNext ? t.start : ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </details>
      ))}
      <p className="text-sm text-faint">{t.moreSoon}</p>
      <Words lang={lang} dict={dict} userId={user.id} language={track.targetLanguage} />
    </div>
  );
}
