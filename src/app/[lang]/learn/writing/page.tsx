import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { WritingEditor } from "@/components/practice/WritingEditor";
import { AiStatusBanner } from "@/components/tutor/AiStatusBanner";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { listWriting } from "@/lib/learner/skills";
import { WRITING_TASKS, findWritingTask } from "@/content/writing";
import { aiStatus } from "@/lib/ai/provider";

export default async function WritingPage({ params }: PageProps<"/[lang]/learn/writing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-4xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Writing lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Writing({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/learn/writing`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.practice;
  const history = await listWriting(db, user.id, 8);
  return (
    <div className="space-y-6">
      <div>
        <Link href={`/${lang}/learn`} className="text-sm text-brand hover:underline">← {dict.learn.title}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t.writing[0]}</h1>
        <p className="mt-1 text-muted">{t.writingSub}</p>
      </div>
      <AiStatusBanner t={dict.ai} />
      <WritingEditor lang={lang} language={track.targetLanguage} tasks={WRITING_TASKS} t={t} errors={dict.ai.errorsMap as Record<string, string>} disabled={aiStatus() === "not_configured"} />
      {history.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">{t.history}</h2>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id}>
                <Link href={`/${lang}/learn/writing/${h.id}`} className="card flex items-center justify-between gap-3 p-3 hover:bg-surface-2">
                  <span className="font-semibold">{findWritingTask(h.taskId)?.title[lang] ?? h.taskId}</span>
                  <span className="chip">{(h.feedback as { estimated_level?: string }).estimated_level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
