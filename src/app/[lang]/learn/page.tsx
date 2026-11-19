import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { getProgress } from "@/lib/learner/study";
import { coursesFor, lessonIds } from "@/content";

export default async function LearnPage({ params }: PageProps<"/[lang]/learn">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Course lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Course({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/learn`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.learn;
  const courses = coursesFor(track.targetLanguage);
  if (!courses.length) {
    return (
      <>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <p className="card p-5 text-muted">{t.noCourse}</p>
      </>
    );
  }
  const course = courses[0];
  const ids = lessonIds(course);
  const progress = await getProgress(db, user.id, ids);
  const nextId = ids.find((id) => !progress.has(id));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{course.title[lang]}</h1>
        <p className="mt-1 text-muted">{fmt(t.progress, { a: progress.size, b: ids.length })}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-brand" style={{ width: `${(progress.size / ids.length) * 100}%` }} />
        </div>
      </div>
      {course.units.map((unit) => (
        <section key={unit.id} className="card p-5 sm:p-6">
          <h2 className="mb-3 font-semibold">{unit.title[lang]}</h2>
          <ol className="space-y-2">
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
        </section>
      ))}
      <p className="text-sm text-faint">{t.moreSoon}</p>
    </div>
  );
}
