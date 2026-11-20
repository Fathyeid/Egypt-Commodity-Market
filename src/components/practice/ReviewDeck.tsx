"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { reviewWordAction } from "@/lib/actions";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { Dictionary } from "@/lib/i18n/ar";

type Card = { id: string; term: string; meaning: string | null };
const GRADES = ["again", "hard", "good", "easy"] as const;

/** Flashcards: see the word, try to recall, reveal, then grade honestly. */
export function ReviewDeck({ cards, language, lang, t, listen, noVoice }: { cards: Card[]; language: string; lang: string; t: Dictionary["review"]; listen: string; noVoice: string }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [error, setError] = useState(false);
  const [counts, setCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [pending, start] = useTransition();
  const card = cards[i];

  if (!card) {
    const done = counts.hard + counts.good + counts.easy;
    return (
      <div className="card space-y-3 p-6 text-center" data-testid="review-done">
        <h2 className="text-xl font-bold">{t.doneTitle}</h2>
        <p className="text-muted">{t.doneBody.replace("{a}", String(done)).replace("{b}", String(cards.length))}</p>
        <Link href={`/${lang}/learn`} className="btn-primary">{t.back}</Link>
      </div>
    );
  }

  const grade = (g: (typeof GRADES)[number]) =>
    start(async () => {
      const r = await reviewWordAction(card.id, g);
      if (!r.ok) return setError(true);
      setError(false);
      setCounts((c) => ({ ...c, [g]: c[g] + 1 }));
      setShown(false);
      setI((n) => n + 1);
    });

  return (
    <div className="card space-y-5 p-6" data-testid="review-card">
      <p className="text-sm text-muted">{t.progress.replace("{a}", String(i + 1)).replace("{b}", String(cards.length))}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <p dir="auto" lang={language} className="text-3xl font-bold">{card.term}</p>
        <SpeakButton text={card.term} language={language} label={listen} noVoiceLabel={noVoice} size="sm" />
      </div>
      {shown ? (
        <>
          <p dir="auto" className="text-center text-lg text-muted" data-testid="review-meaning">{card.meaning || t.noMeaning}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map((g) => (
              <button key={g} type="button" disabled={pending} onClick={() => grade(g)} className={g === "again" ? "btn-danger" : g === "good" ? "btn-primary" : "btn-ghost"} data-testid={`grade-${g}`}>
                {t.grades[g]}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <button type="button" className="btn-primary" onClick={() => setShown(true)} data-testid="reveal">{t.reveal}</button>
        </div>
      )}
      {error && <p role="alert" className="text-center text-sm text-danger">{t.error}</p>}
    </div>
  );
}
