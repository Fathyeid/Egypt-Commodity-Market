"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { reviewWordAction } from "@/lib/actions";
import { SpeakButton } from "@/components/learn/SpeakButton";
import { GRADES, intervalMinutes, type CardState } from "@/lib/learner/review-policy";
import type { Dictionary } from "@/lib/i18n/ar";

type Card = CardState & { id: string; term: string; meaning: string | null; dueAt: string; source: string };

/** Snapshot a small session. A saved server-side due version is required to grade. */
export function ReviewDeck({ cards: initial, emptyText, language, lang, t, listen, noVoice, nextDueAt, onComplete }: { cards: Card[]; emptyText: string; language: string; lang: string; t: Dictionary["review"]; listen: string; noVoice: string; nextDueAt: string | null; onComplete?: (reviewed:number)=>void }) {
  const [cards] = useState(initial);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [ended, setEnded] = useState(false);
  const [counts, setCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [next, setNext] = useState(nextDueAt);
  const [pending, start] = useTransition();
  const inFlight = useRef(false);
  const card = cards[i];
  const nextLabel = next ? new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(next)) : null;
  const nextNote = nextLabel && <p className="text-sm text-muted" data-testid="review-next">{t.nextReview.replace("{time}", nextLabel)}</p>;
  const interval = (g: (typeof GRADES)[number]) => {
    const mins = intervalMinutes(card, g);
    return mins < 60 ? t.minutes.replace("{n}", String(mins)) : mins < 1440 ? t.hours.replace("{n}", String(Math.round(mins / 60))) : t.days.replace("{n}", String(Math.round(mins / 1440 * 10) / 10));
  };

  if (cards.length === 0) return (
    <div className="card space-y-3 p-6 text-center" data-testid="review-empty">
      <p className="text-muted">{emptyText}</p>{nextNote}
      <Link href={`/${lang}/learn`} className="btn-primary">{t.back}</Link>
    </div>
  );

  if (!card || ended) {
    const done = counts.hard + counts.good + counts.easy;
    const reviewed = done + counts.again;
    return (
      <div className="card space-y-3 p-6 text-center" data-testid="review-done" role="status">
        <h2 className="text-xl font-bold">{t.doneTitle}</h2>
        <p className="text-muted">{t.doneBody.replace("{a}", String(done)).replace("{b}", String(reviewed))}</p>
        {counts.again > 0 && <p className="text-sm">{t.againNote.replace("{n}", String(counts.again))}</p>}
        {stale && <p className="text-sm text-muted">{t.stale}</p>}
        {nextNote}
        {onComplete && <button type="button" className="btn-primary" onClick={()=>onComplete(reviewed)}>{lang === "ar" ? "كمل الحصة" : "Continue session"}</button>}
        <div className="flex flex-wrap justify-center gap-2">
          <a href={`/${lang}/learn/review`} className="btn-ghost">{t.more}</a>
          <Link href={`/${lang}/learn`} className="btn-primary">{t.back}</Link>
        </div>
      </div>
    );
  }

  const grade = (g: (typeof GRADES)[number]) => {
    if (inFlight.current) return;
    inFlight.current = true;
    start(async () => {
      try {
        const r = await reviewWordAction(card.id, g, card.dueAt);
        if (!r.ok) { setError(true); return; }
        setError(false);
        if (r.accepted) setCounts((c) => ({ ...c, [g]: c[g] + 1 }));
        else setStale(true);
        setNext((old) => !old || r.dueAt < old ? r.dueAt : old);
        setShown(false);
        setI((n) => n + 1);
      } catch { setError(true); }
      finally { inFlight.current = false; }
    });
  };

  return (
    <div className="card space-y-5 p-6" data-testid="review-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">{t.progress.replace("{a}", String(i + 1)).replace("{b}", String(cards.length))}</p>
        <button type="button" disabled={pending} onClick={() => setEnded(true)} className="btn-ghost text-sm" data-testid="review-pause">{t.pause}</button>
      </div>
      {stale && <p role="status" className="text-sm text-muted">{t.stale}</p>}
      {card.source.startsWith("mistake:") && <p className="text-sm text-brand" data-testid="mistake-card">{t.fromMistake}</p>}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <p dir="auto" lang={language} className="break-words text-3xl font-bold">{card.term}</p>
        <SpeakButton text={card.term} language={language} label={listen} noVoiceLabel={noVoice} size="sm" />
      </div>
      {shown ? <>
        <p dir="auto" className="whitespace-pre-line text-center text-lg text-muted" data-testid="review-meaning">{card.meaning || t.noMeaning}</p>
        <p className="text-center text-xs text-faint">{t.scheduleHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button key={g} type="button" disabled={pending} onClick={() => grade(g)} className={g === "again" ? "btn-danger" : g === "good" ? "btn-primary" : "btn-ghost"} data-testid={`grade-${g}`}>
              <span>{t.grades[g]}<small className="block text-xs">{interval(g)}</small></span>
            </button>
          ))}
        </div>
      </> : <div className="text-center"><button type="button" className="btn-primary" onClick={() => setShown(true)} data-testid="reveal">{t.reveal}</button></div>}
      {error && <p role="alert" className="text-center text-sm text-danger">{t.error}</p>}
    </div>
  );
}
