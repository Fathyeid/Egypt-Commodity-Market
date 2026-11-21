import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { dueWords, wordCounts } from "@/lib/learner/srs";
import { SESSION_MINUTES, sessionMinutes, sessionSize } from "@/lib/learner/review-policy";
import { ReviewDeck } from "@/components/practice/ReviewDeck";

export default async function ReviewPage({ params, searchParams }: PageProps<"/[lang]/learn/review">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Review lang={lang} dict={dict} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Review({ lang, dict, searchParams }: { lang: Locale; dict: Dictionary; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const minutes = sessionMinutes((await searchParams).minutes);
  const user = await requireUser(lang, `/${lang}/learn/review`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.review;
  const [cards, counts] = await Promise.all([dueWords(db, user.id, track.targetLanguage, sessionSize(minutes)), wordCounts(db, user.id, track.targetLanguage)]);
  return (
    <div className="space-y-5">
      <div>
        <Link href={`/${lang}/learn`} className="text-sm text-brand hover:underline">← {dict.learn.title}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <p className="mt-1 text-sm text-muted">{fmt(t.stats, { due: counts.due, learned: counts.learned, total: counts.total })}</p>
      </div>
      <nav aria-label={t.sessionTitle} className="card space-y-3 p-4" data-testid="review-budget">
        <p className="font-semibold">{t.sessionTitle}</p>
        <div className="flex flex-wrap gap-2">
          {SESSION_MINUTES.map((n) => <Link key={n} href={`/${lang}/learn/review?minutes=${n}`} aria-current={minutes === n ? "page" : undefined} className={minutes === n ? "btn-primary" : "btn-ghost"}>{n === 2 ? t.twoMinutes : fmt(t.minutes, { n })}</Link>)}
        </div>
        <p className="text-xs text-muted">{fmt(t.sessionHint, { n: Math.min(cards.length, sessionSize(minutes)) })}</p>
      </nav>
      <ReviewDeck key={`${track.id}:${minutes}`} nextDueAt={counts.nextDueAt} cards={cards.map((card) => ({ ...card, dueAt: card.dueAt.toISOString() }))} emptyText={counts.total === 0 ? t.emptyDeck : t.nothingDue} language={track.targetLanguage} lang={lang} t={t} listen={dict.placement.listen} noVoice={dict.lesson.noVoice} />
      <p className="text-xs text-faint">{t.howItWorks}</p>
    </div>
  );
}
