import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { Bidi } from "@/components/ui/Bidi";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack, DomainError } from "@/lib/learner/repo";
import { getWriting } from "@/lib/learner/skills";
import { findWritingTask } from "@/content/writing";

export default async function WritingFeedbackPage({ params }: PageProps<"/[lang]/learn/writing/[id]">) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Feedback lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Feedback({ lang, dict, params }: { lang: Locale; dict: Dictionary; params: PageProps<"/[lang]/learn/writing/[id]">["params"] }) {
  const { id } = await params;
  const user = await requireUser(lang, `/${lang}/learn/writing`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  let row;
  try {
    row = await getWriting(db, user.id, id);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }
  const track = await getActiveTrack(db, user.id);
  const language = track?.targetLanguage ?? "en";
  const t = dict.practice;
  const fb = row.feedback;
  return (
    <div className="space-y-4" data-testid="writing-feedback">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/${lang}/learn/writing`} className="text-sm text-brand hover:underline">← {t.writing[0]}</Link>
          <h1 className="mt-1 text-2xl font-bold">{t.feedbackTitle}</h1>
          <p className="text-sm text-muted">{findWritingTask(row.taskId)?.title[lang]}</p>
        </div>
        <div className="rounded-2xl bg-brand-soft px-4 py-2 text-center">
          <div className="text-xs text-brand">{t.estimatedLevel}</div>
          <div className="text-2xl font-bold text-brand">{fb.estimated_level}</div>
        </div>
      </div>
      <section className="card p-5"><h2 className="mb-2 font-semibold">{t.taskFit}</h2><p dir="auto"><Bidi text={fb.task_fit} /></p></section>
      <Block language={language} title={t.yourText} text={row.text} />
      {fb.errors.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">{t.errors}</h2>
          <ul className="space-y-2">
            {fb.errors.map((e, i) => (
              <li key={i} className="rounded-xl border-s-4 border-accent bg-accent-soft px-3 py-2 text-sm">
                <p dir="auto" lang={language}><s className="text-danger">{e.original}</s> → <b className="text-ok">{e.corrected}</b></p>
                <p dir="auto" className="mt-0.5"><Bidi text={e.explanation} /></p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Block language={language} title={t.corrected} text={fb.corrected_text} />
      <Block language={language} title={t.improved} text={fb.improved_version} />
      <Block language={language} title={t.professional} text={fb.professional_version} />
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 font-semibold">{t.strengths}</h2><ul className="list-disc space-y-1 ps-5 text-sm">{fb.strengths.map((s, i) => <li key={i} dir="auto"><Bidi text={s} /></li>)}</ul></section>
        <section className="card p-5"><h2 className="mb-2 font-semibold">{t.nextSteps}</h2><ul className="list-disc space-y-1 ps-5 text-sm">{fb.next_steps.map((s, i) => <li key={i} dir="auto"><Bidi text={s} /></li>)}</ul></section>
      </div>
      <Link href={`/${lang}/learn/writing`} className="btn-primary">{t.newWriting}</Link>
    </div>
  );
}

function Block({ title, text, language }: { title: string; text: string; language: string }) {
  return (
    <section className="card p-5">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <p dir="auto" lang={language} className="whitespace-pre-wrap leading-relaxed">{text}</p>
    </section>
  );
}
