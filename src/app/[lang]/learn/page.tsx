import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Headphones, BookOpen, PenLine, AudioLines } from "lucide-react";
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
import { checkpointScores } from "@/lib/learner/checkpoint";
import { LearningPath } from "@/components/learn/LearningPath";
import { ContinueCard, LearnHero, LevelJourney } from "@/components/learn/LearnHero";
import { LANGUAGE_NAMES } from "@/lib/factory/generate";

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
  const [progress, checkpoints] = await Promise.all([getProgress(db, user.id, ids), checkpointScores(db, user.id, course.units.map((u) => u.id))]);
  const nextId = ids.find((id) => !progress.has(id));
  const nextLesson = course.units.flatMap((u) => u.lessons).find((l) => l.id === nextId) ?? null;
  return (
    <div className="space-y-6">
      <LearnHero lang={lang} language={track.targetLanguage} languageName={LANGUAGE_NAMES[track.targetLanguage]?.[lang] ?? track.targetLanguage} level={course.level} done={progress.size} total={ids.length} t={t} />
      <ContinueCard
        href={nextId ? `/${lang}/learn/${nextId}` : null}
        title={t.continueTitle}
        subtitle={nextLesson ? fmt(t.continueSub, { title: nextLesson.title[lang] }) : fmt(t.progress, { a: progress.size, b: ids.length })}
        language={track.targetLanguage}
      />
      <LevelJourney lang={lang} levels={courses.map((c) => c.level)} current={course.level} home={track.placementLevel ?? track.selfLevel} t={t} />
      <ReviewLink lang={lang} dict={dict} userId={user.id} language={track.targetLanguage} />
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold" data-testid="units-heading">{t.unitsTitle}</h2>
        <span className="text-sm text-muted">{fmt(t.unitsHeading, { u: course.units.length, n: ids.length })}</span>
      </div>
      <LearningPath lang={lang} course={course} progress={progress} checkpoints={checkpoints} nextId={nextId} t={t} />
      <Centers lang={lang} dict={dict} />
      <Words lang={lang} dict={dict} userId={user.id} language={track.targetLanguage} />
    </div>
  );
}
