import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { db } from "@/lib/db";
import { getLesson } from "@/lib/curriculum";
import { requireAdmin } from "@/lib/admin/gate";
import { StatusBadge, StatusButtons } from "@/components/admin/StatusForm";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { Exercise, L10n } from "@/content/types";

type Props = PageProps<"/[lang]/admin/lessons/[lessonId]">;

export default async function AdminLessonPage({ params }: Props) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Preview lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

/** What the learner must answer, written out for the reviewer. */
function answerOf(ex: Exercise, l: (x: L10n) => string): string {
  switch (ex.type) {
    case "mcq":
    case "listen":
      return ex.options[ex.answer];
    case "match":
      return ex.pairs.map((p) => `${p[0]} = ${l(p[1])}`).join(" · ");
    default:
      return ex.answers.join(" / ");
  }
}

function promptOf(ex: Exercise, l: (x: L10n) => string): string {
  switch (ex.type) {
    case "mcq":
      return [ex.prompt !== "…" ? ex.prompt : "", ex.hint ? l(ex.hint) : ""].filter(Boolean).join(" — ");
    case "fill":
      return `${ex.prompt}${ex.hint ? ` — ${l(ex.hint)}` : ""}`;
    case "listen":
    case "dictation":
      return `🔊 ${ex.audio}`;
    case "translate":
      return l(ex.prompt);
    case "order":
      return `${ex.words.join(" / ")}${ex.hint ? ` — ${l(ex.hint)}` : ""}`;
    case "match":
      return "";
  }
}

async function Preview({ lang, dict, params }: { lang: Locale; dict: Dictionary } & Pick<Props, "params">) {
  const { lessonId } = await params;
  await requireAdmin(lang, `/${lang}/admin/lessons/${lessonId}`);
  const found = await getLesson(db, lessonId, { includeDrafts: true });
  if (!found) notFound();
  const t = dict.admin;
  const s = dict.lesson.sections;
  const l = (x: L10n) => x[lang];
  const { lesson } = found;
  return (
    <div className="space-y-5">
      <Link href={`/${lang}/admin/courses/${found.courseId}?status=${found.status}`} className="text-sm text-brand hover:underline">← {found.unitTitle[lang]}</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{l(lesson.title)}</h1>
        <StatusBadge status={found.status} t={t} />
      </div>
      <p className="text-muted">{l(lesson.goal)}</p>
      <StatusButtons id={lesson.id} status={found.status} t={t} />

      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">{s.explanation}</h2>
        <p>{l(lesson.explanation)}</p>
      </section>
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">{s.examples}</h2>
        <ul className="space-y-2">
          {lesson.examples.map((e, i) => (
            <li key={i} className="flex items-start gap-2">
              <SpeakButton text={e.text} language={found.language} label={dict.placement.listen} noVoiceLabel={dict.lesson.noVoice} size="sm" />
              <span>
                <span dir="auto" lang={found.language} className="block font-semibold">{e.text}</span>
                <span dir="auto" className="block text-sm text-muted">{l(e.meaning)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">{s.exercises}</h2>
        <ExerciseList list={lesson.exercises} lang={lang} language={found.language} answersLabel={t.answers} />
      </section>
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">{s.quiz}</h2>
        <ExerciseList list={lesson.quiz} lang={lang} language={found.language} answersLabel={t.answers} />
      </section>
      <StatusButtons id={lesson.id} status={found.status} t={t} />
    </div>
  );
}

function ExerciseList({ list, lang, language, answersLabel }: { list: Exercise[]; lang: Locale; language: string; answersLabel: string }) {
  const l = (x: L10n) => x[lang];
  return (
    <ol className="space-y-2 text-sm">
      {list.map((ex) => (
        <li key={ex.id} className="rounded-xl border border-line p-3">
          <p className="text-xs font-semibold uppercase text-faint">{ex.id} · {ex.type}</p>
          <p dir="auto" lang={language}>{promptOf(ex, l)}</p>
          {(ex.type === "mcq" || ex.type === "listen") && <p dir="auto" lang={language} className="text-muted">{ex.options.join(" | ")}</p>}
          <p className="mt-1 text-brand" dir="auto"><span className="font-semibold">{answersLabel}:</span> <span lang={language}>{answerOf(ex, l)}</span></p>
        </li>
      ))}
    </ol>
  );
}
