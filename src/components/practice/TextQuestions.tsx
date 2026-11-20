"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PublicTextItem } from "@/content";
import type { Dictionary } from "@/lib/i18n/ar";
import { submitTextAnswersAction } from "@/lib/actions";
import { fmt } from "@/lib/i18n/format";
import { Bidi } from "@/components/ui/Bidi";

export function TextQuestions({ item, lang, t }: { item: PublicTextItem; lang: "ar" | "en"; t: Dictionary["practice"] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ correct: number; total: number; results: { id: string; correct: boolean; expected: string }[] } | null>(null);
  const [pending, start] = useTransition();
  return (
    <section className="card space-y-5 p-5 sm:p-6">
      <h2 className="font-semibold">{t.questions}</h2>
      {item.questions.map((q, n) => {
        const r = result?.results.find((x) => x.id === q.id);
        return (
          <div key={q.id} data-testid={`tq-${q.id}`}>
            <p className="mb-2 font-semibold">{n + 1}. <Bidi text={q.prompt[lang]} /></p>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
              {q.options.map((o, i) => (
                <button key={i} type="button" role="radio" aria-checked={answers[q.id] === i} disabled={!!result || pending} dir="auto" lang={item.language}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={`rounded-xl border-[1.5px] px-4 py-2.5 text-start transition-colors ${answers[q.id] === i ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-faint"}`}>
                  {o}
                </button>
              ))}
            </div>
            {r && (
              <p role="status" className={`mt-2 flex items-center gap-1.5 text-sm ${r.correct ? "text-ok" : "text-danger"}`}>
                {r.correct ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
                {r.correct ? "✓" : <span dir="auto">{fmt(t.correctAnswer, { x: r.expected })}</span>}
              </p>
            )}
          </div>
        );
      })}
      {result ? (
        <p className="rounded-xl bg-brand-soft p-3 text-center font-bold" role="status">{fmt(t.score, { a: result.correct, b: result.total })}</p>
      ) : (
        <button type="button" className="btn-primary w-full" disabled={pending || item.questions.some((q) => answers[q.id] === undefined)}
          onClick={() => start(async () => { const r = await submitTextAnswersAction(item.id, answers); if (r.ok) setResult(r.result); })}>
          {t.submit}
        </button>
      )}
    </section>
  );
}
