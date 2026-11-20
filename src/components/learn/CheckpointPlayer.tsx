"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PublicExercise, GradeResult } from "@/content";
import { submitCheckpointAction } from "@/lib/actions";
import { ExerciseInput, isAnswered, orderToText, type Answer, type ExerciseLabels } from "./ExerciseInputs";
import type { Dictionary } from "@/lib/i18n/ar";
import { fmt } from "@/lib/i18n/format";

type Outcome = { score: number; correct: number; total: number; passed: boolean; xp: number; results: ({ id: string } & GradeResult)[] };

export function CheckpointPlayer({ unitId, exercises, lang, language, labels, t, backHref }: { unitId: string; exercises: PublicExercise[]; lang: "ar" | "en"; language: string; labels: ExerciseLabels; t: Dictionary["checkpoint"]; backHref: string }) {
  const [values, setValues] = useState<Record<string, Answer>>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  const allAnswered = exercises.every((q) => isAnswered(q, values[q.id]));

  return (
    <div className="space-y-6">
      {exercises.map((q, n) => {
        const r = outcome?.results.find((x) => x.id === q.id);
        return (
          <div key={q.id} className="card p-5" data-testid={`cp-${n}`}>
            <div className="mb-2 text-xs font-semibold text-faint">#{n + 1}</div>
            <ExerciseInput ex={q} value={values[q.id]} onChange={(v) => setValues((s) => ({ ...s, [q.id]: v }))} ui={lang} language={language} labels={labels} disabled={!!outcome || pending} />
            {r && (
              <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${r.correct ? "text-ok" : "text-danger"}`}>
                {r.correct ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
                {r.correct ? t.correct : <span dir="auto">{fmt(t.expected, { a: r.expected })}</span>}
              </p>
            )}
          </div>
        );
      })}
      {outcome ? (
        <div role="status" className={`rounded-2xl p-5 text-center ${outcome.passed ? "bg-brand-soft" : "bg-surface-2"}`} data-testid="cp-result">
          <p className="text-2xl font-bold">{fmt(t.score, { n: outcome.score, a: outcome.correct, b: outcome.total })}</p>
          <p className="mt-1 font-semibold">{outcome.passed ? t.passed : t.failed}</p>
          <p className="mt-1 text-sm text-brand">{fmt(t.xp, { n: outcome.xp })}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {!outcome.passed && <button type="button" className="btn-ghost" onClick={() => { setOutcome(null); setValues({}); }}>{t.retry}</button>}
            <Link href={backHref} className="btn-primary">{t.back}</Link>
          </div>
        </div>
      ) : (
        <>
          {error && <p role="alert" className="text-sm text-danger">{t.error}</p>}
          <button
            type="button"
            className="btn-primary w-full"
            disabled={!allAnswered || pending}
            data-testid="cp-submit"
            onClick={() =>
              start(async () => {
                const payload = Object.fromEntries(exercises.map((q) => [q.id, orderToText(q, values[q.id])]));
                const r = await submitCheckpointAction(unitId, payload);
                if (r.ok) setOutcome(r.result);
                else setError(true);
              })
            }
          >
            {t.submit}
          </button>
        </>
      )}
    </div>
  );
}
