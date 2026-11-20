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
import { toPublicLesson } from "@/content";
import { getLesson, nextLessonId, type LessonAttribution } from "@/lib/curriculum";
import { TopicPanel } from "@/components/learn/TopicPanel";

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
  if (!(await getLesson(db, lessonId))) notFound();
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
  const nextId = await nextLessonId(db, found.courseId, found.position);
  return (
    <>
      <div className="mx-auto mb-5 max-w-3xl">
        <Link href={`/${lang}/learn`} className="text-sm text-brand hover:underline">← {found.unitTitle[lang]}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{found.lesson.title[lang]}</h1>
      </div>
      {found.video && <LessonVideo id={found.video.id} title={found.video.title} label={dict.lesson.lessonVideo} />}
      {found.topic && (found.topic.videoId || found.topic.explanation) && <TopicPanel topic={found.topic} lang={lang} label={dict.lesson.topicVideo} />}
      <LessonPlayer
        lang={lang}
        language={found.language}
        lesson={toPublicLesson(found.lesson)}
        t={dict.lesson}
        common={dict.common}
        listenLabel={dict.placement.listen}
        backHref={`/${lang}/learn`}
        nextHref={nextId ? `/${lang}/learn/${nextId}` : null}
        nextLabel={dict.learn.next}
      />
      {found.attribution && <Attribution a={found.attribution} label={dict.lesson.attribution} />}
    </>
  );
}

function Attribution({ a, label }: { a: LessonAttribution; label: string }) {
  const people = [...new Set(a.sentences.map((s) => s.by).filter(Boolean))].slice(0, 8);
  return (
    <footer className="mx-auto mt-6 max-w-3xl text-xs text-faint" data-testid="attribution">
      {label}{" "}
      <a href="https://tatoeba.org" className="underline" target="_blank" rel="noopener noreferrer">Tatoeba</a>{" "}
      (<a href="https://creativecommons.org/licenses/by/2.0/fr/" className="underline" target="_blank" rel="noopener noreferrer">{a.license}</a>)
      {people.length > 0 && <> — <span dir="auto">{people.join("، ")}</span></>}
      {" · "}
      {a.sentences.slice(0, 10).map((s, i) => (
        <span key={s.id}>
          {i > 0 && " "}
          <a href={`https://tatoeba.org/sentences/show/${s.id}`} className="underline" target="_blank" rel="noopener noreferrer">#{s.id}</a>
        </span>
      ))}
    </footer>
  );
}

function LessonVideo({ id, title, label }: { id: string; title: string | null; label: string }) {
  return (
    <section className="card mx-auto mb-5 max-w-3xl space-y-3 p-4 sm:p-5" data-testid="lesson-video">
      <h2 className="font-semibold">{label}</h2>
      <div className="aspect-video overflow-hidden rounded-xl bg-surface-2">
        <iframe
          className="size-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
          title={title ?? label}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {title && <p className="text-xs text-muted" dir="auto">{title}</p>}
    </section>
  );
}
