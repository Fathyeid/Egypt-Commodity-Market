"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PublicPlacementItem } from "@/content";
import { answerPlacementAction } from "@/lib/actions";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/ar";
import { SpeakButton } from "@/components/learn/SpeakButton";

type Props = { lang: string; language: string; testId: string; item: PublicPlacementItem; answered: number; total: number; t: Dictionary["placement"]; skills: Dictionary["skills"]; noVoice: string; errors: Dictionary["errors"] };

export function PlacementRunner({ lang, language, testId, item, answered, total, t, skills, noVoice, errors }: Props) {
  const router = useRouter();
  const [choice, setChoice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      if (choice === null) return;
      const r = await answerPlacementAction(testId, item.id, choice);
      if (!r.ok) {
        setError(errors[r.error as keyof typeof errors] ?? errors.generic);
        router.refresh();
        return;
      }
      setChoice(null);
      if (r.done) router.replace(`/${lang}/placement`);
      else router.refresh();
    });

  return (
    <div className="card mx-auto max-w-2xl p-5 shadow-card sm:p-8">
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(answered / total) * 100}%` }} />
      </div>
      <div className="mb-4 flex items-center justify-between text-sm text-faint">
        <span>{fmt(t.question, { a: answered + 1, b: total })}</span>
        <span className="chip">{skills[item.skill]}</span>
      </div>

      <div key={item.id} className="animate-fade-up space-y-4">
        {item.passage && (
          <blockquote lang={language} dir="auto" className="rounded-xl bg-surface-2 p-4 text-start leading-relaxed">{item.passage}</blockquote>
        )}
        {item.audio && <SpeakButton text={item.audio} language={language} label={t.listen} noVoiceLabel={noVoice} />}
        {item.note && <p dir="auto" className="text-start text-sm text-muted" data-testid="placement-note">{item.note}</p>}
        <p lang={language} dir="auto" className="text-start text-lg font-semibold">{item.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={item.prompt}>
          {item.options.map((o, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={choice === i}
              dir="auto"
              lang={item.nativeOptions ? undefined : language}
              disabled={pending}
              onClick={() => setChoice(i)}
              className={`rounded-xl border-[1.5px] px-4 py-3 text-start transition-colors ${choice === i ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-faint"}`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}
      <button type="button" className="btn-primary mt-6 w-full" disabled={choice === null || pending} onClick={submit} data-testid="placement-submit">
        {t.submit}
      </button>
    </div>
  );
}
