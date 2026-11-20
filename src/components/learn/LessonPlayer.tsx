"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { PublicExercise, PublicLesson, GradeResult } from "@/content";
import type { L10n } from "@/content/types";
import { checkExerciseAction, submitQuizAction } from "@/lib/actions";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/ar";
import { ExerciseInput, isAnswered, orderToText, type Answer, type ExerciseLabels } from "./ExerciseInputs";
import { SpeakButton } from "./SpeakButton";
import { Bidi } from "@/components/ui/Bidi";

const SECTIONS = ["explanation", "vocabulary", "pronunciation", "examples", "grammar", "exercises", "quiz", "review"] as const;
type Section = (typeof SECTIONS)[number];

type Props = {
  lang: "ar" | "en";
  language: string;
  lesson: PublicLesson;
  t: Dictionary["lesson"];
  common: Dictionary["common"];
  listenLabel: string;
  backHref: string;
  nextHref: string | null;
  nextLabel: string;
};

export function LessonPlayer({ lang, language, lesson, t, common, listenLabel, backHref, nextHref, nextLabel }: Props) {
  const [i, setI] = useState(0);
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  const section: Section = SECTIONS[i];
  const l = (x: L10n) => x[lang];
  const labels: ExerciseLabels = { typeHere: t.typeHere, tapWords: t.tapWords, clear: t.clear, pickMeaning: t.pickMeaning, listen: listenLabel, noVoice: t.noVoice };
  const isRtl = lang === "ar";
  const Prev = isRtl ? ArrowRight : ArrowLeft;
  const Next = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label={l(lesson.title)} className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {SECTIONS.map((s, idx) => (
          <button
            key={s}
            type="button"
            onClick={() => setI(idx)}
            aria-current={idx === i ? "step" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${idx === i ? "bg-brand text-brand-ink" : idx < i ? "bg-brand-soft text-brand" : "bg-surface-2 text-muted"}`}
          >
            {idx + 1}. {t.sections[s]}
          </button>
        ))}
      </nav>

      <section className="card p-5 sm:p-7" aria-labelledby="section-title">
        <h2 id="section-title" className="mb-4 text-xl font-bold">{t.sections[section]}</h2>

        {section === "explanation" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-brand-soft px-4 py-3">
              <div className="text-xs font-semibold text-brand">{t.goal}</div>
              <p className="mt-0.5"><Bidi text={l(lesson.goal)} /></p>
            </div>
            <p className="text-lg leading-relaxed"><Bidi text={l(lesson.explanation)} /></p>
            <table className="w-full border-collapse overflow-hidden rounded-xl text-sm" data-testid="lesson-plan">
              <caption className="mb-2 text-start font-semibold">{t.planTitle}</caption>
              <tbody>
                {SECTIONS.slice(1).map((key, n) => {
                  const count = key === "vocabulary" ? lesson.vocabulary.length : key === "pronunciation" ? lesson.pronunciation.length : key === "examples" ? lesson.examples.length : key === "exercises" ? lesson.exercises.length : key === "quiz" ? lesson.quiz.length : key === "review" ? lesson.review.length : null;
                  return (
                    <tr key={key} className="border-b border-line last:border-0 even:bg-surface-2">
                      <td className="w-10 px-3 py-2 font-bold text-brand">{n + 1}</td>
                      <td className="px-3 py-2">
                        <button type="button" className="font-semibold hover:underline" onClick={() => setI(n + 1)}>{t.sections[key]}</button>
                      </td>
                      <td className="px-3 py-2 text-end text-muted">{count !== null ? count : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {section === "vocabulary" && (
          <NumberedTable
            head={[t.colWord, t.colMeaning]}
            rows={lesson.vocabulary.map((v) => ({ key: v.term, text: v.term, sub: l(v.meaning), extra: v.example }))}
            language={language}
            listenLabel={listenLabel}
            noVoice={t.noVoice}
          />
        )}

        {section === "pronunciation" && (
          <div className="space-y-4">
            <p className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-muted">{t.pronNote}</p>
            <NumberedTable
              head={[t.colSentence, t.colTip]}
              rows={lesson.pronunciation.map((p) => ({ key: p.text, text: p.text, sub: l(p.tip) }))}
              language={language}
              listenLabel={listenLabel}
              noVoice={t.noVoice}
            />
          </div>
        )}

        {section === "examples" && (
          <NumberedTable
            head={[t.colSentence, t.colMeaning]}
            rows={lesson.examples.map((e) => ({ key: e.text, text: e.text, sub: l(e.meaning) }))}
            language={language}
            listenLabel={listenLabel}
            noVoice={t.noVoice}
          />
        )}

        {section === "grammar" && (
          <div className="space-y-4">
            <h3 className="font-semibold"><Bidi text={l(lesson.grammar.title)} /></h3>
            <p className="leading-relaxed"><Bidi text={l(lesson.grammar.body)} /></p>
            {lesson.grammar.table && (
              <div className="overflow-x-auto">
                <table dir="ltr" lang={language} className="w-full border-collapse text-start text-sm">
                  <tbody>
                    {lesson.grammar.table.map((row, r) => (
                      <tr key={r} className="border-b border-line last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-3 py-2 ${c === 0 ? "font-semibold" : ""}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {section === "exercises" && (
          <div className="space-y-6">
            {lesson.exercises.map((ex, n) => (
              <PracticeExercise key={ex.id} n={n + 1} ex={ex} lessonId={lesson.id} lang={lang} language={language} labels={labels} t={t} />
            ))}
          </div>
        )}

        {section === "quiz" && (
          <Quiz lesson={lesson} lang={lang} language={language} labels={labels} t={t} getStarted={() => started.current} />
        )}

        {section === "review" && (
          <div className="space-y-4">
            <ol className="space-y-2">
              {lesson.review.map((r, n) => (
                <li key={n} className="flex gap-3 rounded-xl border border-line p-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{n + 1}</span>
                  <span className="self-center"><Bidi text={l(r)} /></span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={backHref} className="btn-ghost">{t.backToCourse}</Link>
              {nextHref && <Link href={nextHref} className="btn-primary">{nextLabel}</Link>}
            </div>
          </div>
        )}
      </section>

      <div className="mt-5 flex justify-between">
        <button type="button" className={`btn-ghost ${i === 0 ? "invisible" : ""}`} onClick={() => setI((n) => Math.max(0, n - 1))}>
          <Prev className="size-4" aria-hidden />
          {t.prev}
        </button>
        {i < SECTIONS.length - 1 && (
          <button type="button" className="btn-primary" onClick={() => { setI((n) => n + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            {t.nextSection}
            <Next className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <span className="sr-only">{common.loading}</span>
    </div>
  );
}

function Feedback({ result, t, lang }: { result: GradeResult; t: Dictionary["lesson"]; lang: "ar" | "en" }) {
  return (
    <div role="status" className={`mt-3 rounded-xl px-4 py-3 text-sm ${result.correct ? "bg-brand-soft" : "bg-danger-soft"}`}>
      <p className={`flex items-center gap-2 font-semibold ${result.correct ? "text-brand" : "text-danger"}`}>
        {result.correct ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
        {result.correct ? t.correct : t.wrong}
        {!result.correct && <span dir="auto" className="font-normal text-text">{result.expected}</span>}
      </p>
      {result.explain && <p className="mt-1 text-text"><Bidi text={result.explain[lang]} /></p>}
    </div>
  );
}

function PracticeExercise({ n, ex, lessonId, lang, language, labels, t }: { n: number; ex: PublicExercise; lessonId: string; lang: "ar" | "en"; language: string; labels: ExerciseLabels; t: Dictionary["lesson"] }) {
  const [value, setValue] = useState<Answer>(undefined);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="border-b border-line pb-6 last:border-0 last:pb-0" data-testid={`exercise-${ex.id}`}>
      <div className="mb-2 text-xs font-semibold text-faint">#{n}</div>
      <ExerciseInput ex={ex} value={value} onChange={(v) => { setValue(v); setResult(null); }} ui={lang} language={language} labels={labels} disabled={pending} />
      <button
        type="button"
        className="btn-primary mt-3 px-4 py-2 text-sm"
        disabled={!isAnswered(ex, value) || pending}
        onClick={() =>
          start(async () => {
            const r = await checkExerciseAction(lessonId, ex.id, orderToText(ex, value));
            if (r.ok) setResult(r.result);
          })
        }
      >
        {t.check}
      </button>
      {result && <Feedback result={result} t={t} lang={lang} />}
    </div>
  );
}

type QuizOutcome = { score: number; correct: number; total: number; xp: number; results: (GradeResult & { id: string })[] };

function Quiz({ lesson, lang, language, labels, t, getStarted }: { lesson: PublicLesson; lang: "ar" | "en"; language: string; labels: ExerciseLabels; t: Dictionary["lesson"]; getStarted: () => number }) {
  const [values, setValues] = useState<Record<string, Answer>>({});
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [pending, start] = useTransition();
  const allAnswered = lesson.quiz.every((q) => isAnswered(q, values[q.id]));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{t.quizNote}</p>
      {lesson.quiz.map((q, n) => {
        const r = outcome?.results.find((x) => x.id === q.id);
        return (
          <div key={q.id} className="border-b border-line pb-6 last:border-0" data-testid={`quiz-${q.id}`}>
            <div className="mb-2 text-xs font-semibold text-faint">#{n + 1}</div>
            <ExerciseInput ex={q} value={values[q.id]} onChange={(v) => setValues((s) => ({ ...s, [q.id]: v }))} ui={lang} language={language} labels={labels} disabled={!!outcome || pending} />
            {r && <Feedback result={r} t={t} lang={lang} />}
          </div>
        );
      })}
      {outcome ? (
        <div role="status" className="rounded-2xl bg-brand-soft p-5 text-center">
          <p className="text-2xl font-bold">{fmt(t.score, { n: outcome.score, a: outcome.correct, b: outcome.total })}</p>
          <p className="mt-1 font-semibold text-brand">{fmt(t.xp, { n: outcome.xp })}</p>
          <button type="button" className="btn-ghost mt-4" onClick={() => { setOutcome(null); setValues({}); }}>{t.retry}</button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-primary w-full"
          disabled={!allAnswered || pending}
          onClick={() =>
            start(async () => {
              const payload = Object.fromEntries(lesson.quiz.map((q) => [q.id, orderToText(q, values[q.id])]));
              const r = await submitQuizAction(lesson.id, payload, (Date.now() - getStarted()) / 1000, lang);
              if (r.ok) setOutcome(r.result);
            })
          }
        >
          {t.submitQuiz}
        </button>
      )}
    </div>
  );
}

/** Numbered, zebra-striped table: # | target-language text | meaning/tip | listen. */
function NumberedTable({ head, rows, language, listenLabel, noVoice }: { head: [string, string]; rows: { key: string; text: string; sub: string; extra?: string }[]; language: string; listenLabel: string; noVoice: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-sm" data-testid="numbered-table">
        <thead className="bg-brand text-brand-ink">
          <tr>
            <th className="w-10 px-3 py-2 text-start">#</th>
            <th className="px-3 py-2 text-start">{head[0]}</th>
            <th className="px-3 py-2 text-start">{head[1]}</th>
            <th className="w-12 px-2 py-2" aria-label={listenLabel} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, n) => (
            <tr key={r.key + n} className="border-t border-line align-top even:bg-surface-2">
              <td className="px-3 py-2.5 font-bold text-brand">{n + 1}</td>
              <td className="px-3 py-2.5">
                <span dir="auto" lang={language} className="block text-base font-semibold">{r.text}</span>
                {r.extra && <span dir="auto" lang={language} className="mt-0.5 block text-xs text-faint">{r.extra}</span>}
              </td>
              <td className="px-3 py-2.5 text-muted"><Bidi text={r.sub} /></td>
              <td className="px-2 py-2"><SpeakButton text={r.text} language={language} label={listenLabel} noVoiceLabel={noVoice} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
