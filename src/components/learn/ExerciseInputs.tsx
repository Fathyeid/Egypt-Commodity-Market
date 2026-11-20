"use client";

import { useMemo } from "react";
import type { PublicExercise } from "@/content";
import type { L10n } from "@/content/types";
import { SpeakButton } from "./SpeakButton";
import { Bidi } from "@/components/ui/Bidi";

export type Answer = number | string | string[] | undefined;
export type ExerciseLabels = { typeHere: string; tapWords: string; clear: string; pickMeaning: string; listen: string; noVoice: string };

type Props = { ex: PublicExercise; value: Answer; onChange: (v: Answer) => void; ui: "ar" | "en"; language: string; labels: ExerciseLabels; disabled?: boolean };

/** Renders the input for one exercise. Purely controlled; grading happens on the server. */
export function ExerciseInput({ ex, value, onChange, ui, language, labels, disabled }: Props) {
  const l = (x?: L10n) => (x ? x[ui] : "");
  switch (ex.type) {
    case "mcq":
    case "listen":
      return (
        <div className="space-y-3">
          {ex.type === "listen" ? (
            <div className="space-y-2">
              <SpeakButton text={ex.audio} language={language} label={labels.listen} noVoiceLabel={labels.noVoice} />
              <p className="font-semibold"><Bidi text={l(ex.prompt)} /></p>
            </div>
          ) : (
            <p dir="auto" lang={language} className="text-lg font-semibold">{ex.prompt}</p>
          )}
          {ex.type === "mcq" && ex.hint && <p className="text-sm text-muted"><Bidi text={l(ex.hint)} /></p>}
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
            {ex.options.map((o, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={value === i}
                disabled={disabled}
                onClick={() => onChange(i)}
                lang={language}
                dir="auto"
                className={`rounded-xl border-[1.5px] px-4 py-2.5 text-start transition-colors disabled:cursor-default ${value === i ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-faint"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    case "fill":
    case "translate":
    case "dictation":
      return (
        <div className="space-y-3">
          {ex.type === "fill" && <p dir="auto" lang={language} className="text-lg font-semibold">{ex.prompt}</p>}
          {ex.type === "fill" && ex.hint && <p className="text-sm text-muted"><Bidi text={l(ex.hint)} /></p>}
          {ex.type === "translate" && <p className="text-lg font-semibold"><Bidi text={l(ex.prompt)} /></p>}
          {ex.type === "dictation" && <SpeakButton text={ex.audio} language={language} label={labels.listen} noVoiceLabel={labels.noVoice} />}
          <input
            dir="auto"
            lang={language}
            className="input"
            placeholder={labels.typeHere}
            aria-label={labels.typeHere}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      );
    case "order":
      return (
        <div className="space-y-2">
          {ex.hint && <p className="font-semibold"><Bidi text={l(ex.hint)} /></p>}
          <OrderInput words={ex.words} value={Array.isArray(value) ? value : []} onChange={onChange} labels={labels} language={language} disabled={disabled} />
        </div>
      );
    case "match":
      return <MatchInput left={ex.left} right={ex.right} value={Array.isArray(value) ? value : []} onChange={onChange} ui={ui} labels={labels} language={language} disabled={disabled} />;
  }
}

function OrderInput({ words, value, onChange, labels, language, disabled }: { words: string[]; value: string[]; onChange: (v: Answer) => void; labels: ExerciseLabels; language: string; disabled?: boolean }) {
  // value holds indexes (as strings) of picked words, in order.
  const picked = value.map(Number);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{labels.tapWords}</p>
      <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed border-line bg-surface-2 p-2">
        {picked.map((i, pos) => (
          <button key={pos} type="button" disabled={disabled} onClick={() => onChange(value.filter((_, p) => p !== pos))} className="rounded-lg bg-brand px-3 py-1.5 font-semibold text-brand-ink">
            {words[i]}
          </button>
        ))}
      </div>
      <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="flex flex-wrap gap-2">
        {words.map((w, i) =>
          picked.includes(i) ? null : (
            <button key={i} type="button" disabled={disabled} onClick={() => onChange([...value, String(i)])} className="rounded-lg border border-line bg-surface px-3 py-1.5 font-semibold hover:bg-surface-2">
              {w}
            </button>
          ),
        )}
      </div>
      {picked.length > 0 && !disabled && (
        <button type="button" className="text-sm text-brand hover:underline" onClick={() => onChange([])}>
          {labels.clear}
        </button>
      )}
    </div>
  );
}

/** Turns picked word indexes into the sentence sent for grading. */
export function orderToText(ex: PublicExercise, value: Answer): Answer {
  if (ex.type !== "order" || !Array.isArray(value)) return value;
  return value.map((i) => ex.words[Number(i)]).join(" ");
}

function MatchInput({ left, right, value, onChange, ui, labels, language, disabled }: { left: string[]; right: L10n[]; value: string[]; onChange: (v: Answer) => void; ui: "ar" | "en"; labels: ExerciseLabels; language: string; disabled?: boolean }) {
  const options = useMemo(() => right.map((r) => ({ key: r.en, text: r[ui] })), [right, ui]);
  return (
    <div className="space-y-2.5">
      {left.map((term, i) => (
        <div key={term} className="grid items-center gap-2 sm:grid-cols-[1fr_1.4fr]">
          <span dir="auto" lang={language} className="font-semibold">{term}</span>
          <select
            className="input appearance-auto py-2"
            aria-label={`${labels.pickMeaning}: ${term}`}
            value={value[i] ?? ""}
            disabled={disabled}
            onChange={(e) => {
              const next = [...value];
              while (next.length < left.length) next.push("");
              next[i] = e.target.value;
              onChange(next);
            }}
          >
            <option value="">{labels.pickMeaning}</option>
            {options.map((o) => (
              <option key={o.key} value={o.key}>{o.text}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export function isAnswered(ex: PublicExercise, v: Answer): boolean {
  if (v === undefined) return false;
  if (ex.type === "match") return Array.isArray(v) && v.length === ex.left.length && v.every(Boolean);
  if (ex.type === "order") return Array.isArray(v) && v.length === ex.words.length;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}
