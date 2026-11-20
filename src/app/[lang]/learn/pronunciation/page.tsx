import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { PronunciationCoach } from "@/components/practice/PronunciationCoach";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { pronHistory } from "@/lib/learner/skills";
import { PRON_SENTENCES } from "@/content/pronunciation";
import { speechStatus } from "@/lib/speech/provider";

export default async function PronunciationPage({ params }: PageProps<"/[lang]/learn/pronunciation">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Coach lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Coach({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/learn/pronunciation`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.practice;
  const status = speechStatus();
  const history = await pronHistory(db, user.id, track.id, 8);
  const sentences = PRON_SENTENCES[track.targetLanguage] ?? [];
  return (
    <div className="space-y-5">
      <div>
        <Link href={`/${lang}/learn`} className="text-sm text-brand hover:underline">← {dict.learn.title}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t.pronunciation[0]}</h1>
        <p className="mt-1 text-muted">{t.pronSub}</p>
      </div>
      {status !== "live" && (
        <p role="status" data-testid="speech-status" className={`rounded-xl px-4 py-3 text-sm ${status === "test" ? "bg-accent-soft" : "bg-surface-2 text-muted"}`}>
          {status === "test" ? t.pronTestMode : t.pronNotConfigured}
        </p>
      )}
      <PronunciationCoach language={track.targetLanguage} sentences={sentences} t={t} listenLabel={dict.placement.listen} noVoice={dict.lesson.noVoice} enabled={status !== "not_configured"} />
      {history.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">{t.pronHistory}</h2>
          <ul className="divide-y divide-line text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 py-2">
                <span dir="auto" lang={track.targetLanguage}>{h.referenceText}</span>
                <b>{(h.scores as { pronunciation: number | null }).pronunciation ?? "—"}</b>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
