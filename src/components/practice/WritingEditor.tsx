"use client";

import { useState, useTransition } from "react";
import type { WritingTask } from "@/content/writing";
import type { Dictionary } from "@/lib/i18n/ar";
import { submitWritingAction } from "@/lib/actions";
import { fmt } from "@/lib/i18n/format";
import { Bidi } from "@/components/ui/Bidi";

export function WritingEditor({ lang, language, tasks, t, errors, disabled }: { lang: "ar" | "en"; language: string; tasks: WritingTask[]; t: Dictionary["practice"]; errors: Record<string, string>; disabled: boolean }) {
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? "");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const task = tasks.find((x) => x.id === taskId)!;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup">
        {tasks.map((w) => (
          <button key={w.id} type="button" role="radio" aria-checked={taskId === w.id} onClick={() => setTaskId(w.id)} data-testid={`task-${w.id}`}
            className={`rounded-2xl border-[1.5px] p-3 text-start transition-colors ${taskId === w.id ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-faint"}`}>
            <span className="block font-semibold">{w.title[lang]}</span>
            <span className="chip mt-1">{w.level}</span>
          </button>
        ))}
      </div>
      <div className="card space-y-3 p-5">
        <p className="font-semibold"><Bidi text={task.prompt[lang]} /></p>
        <p className="text-xs text-faint">{fmt(t.minWords, { n: task.minWords })}</p>
        <label className="label" htmlFor="writing">{t.yourText}</label>
        <textarea id="writing" dir="auto" lang={language} rows={10} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.placeholder} className="input min-h-48 resize-y leading-relaxed" disabled={disabled} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`text-sm ${words >= task.minWords ? "text-ok" : "text-faint"}`}>{fmt(t.wordCount, { n: words })}</span>
          <button type="button" className="btn-primary" disabled={disabled || pending || words < 5}
            onClick={() => start(async () => { setError(null); const r = await submitWritingAction(lang, taskId, text); if (r && !r.ok) setError(errors[r.error] ?? errors.generic); })}>
            {pending ? t.evaluating : t.submitWriting}
          </button>
        </div>
        {error && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
