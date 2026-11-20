import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { LessonPlayer } from "@/components/learn/LessonPlayer";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { resolveLesson } from "@/lib/learner/study";
import { DomainError } from "@/lib/learner/repo";
import { lessonIds, toPublicLesson, findLesson } from "@/content";

export default async function LessonPage({ params }: PageProps<"/[lang]/learn/[lessonId]">) {
  // Static root param for the shell; the lesson id is read inside <Suspense>.
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Player lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Player({ lang, dict, params }: { lang: Locale; dict: Dictionary; params: PageProps<"/[lang]/learn/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  const user = await requireUser(lang, `/${lang}/learn/${lessonId}`);
  if (!findLesson(lessonId)) notFound();
  let found;
  try {
    found = await resolveLesson(db, user.id, lessonId);
  } catch (e) {
    if (e instanceof DomainError) {
      return (
        <div className="card mx-auto max-w-xl space-y-4 p-6 text-center">
          <p className="text-muted">{dict.learn.lessonNotFound}</p>
          <Link href={`/${lang}/learn`} className="btn-primary">{dict.lesson.backToCourse}</Link>
        </div>
      );
    }
    throw e;
  }
  const ids = lessonIds(found.course);
  const nextId = ids[ids.indexOf(lessonId) + 1] ?? null;
  return (
    <>
      <div className="mx-auto mb-5 max-w-3xl">
        <Link href={`/${lang}/learn`} className="text-sm text-brand hover:underline">← {found.course.units[found.unitIndex].title[lang]}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{found.lesson.title[lang]}</h1>
      </div>
      <LessonPlayer
        lang={lang}
        language={found.course.language}
        lesson={toPublicLesson(found.lesson)}
        t={dict.lesson}
        common={dict.common}
        listenLabel={dict.placement.listen}
        backHref={`/${lang}/learn`}
        nextHref={nextId ? `/${lang}/learn/${nextId}` : null}
        nextLabel={dict.learn.next}
      />
    </>
  );
}
