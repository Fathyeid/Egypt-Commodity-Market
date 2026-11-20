"use client";

import { startTransition, useActionState } from "react";
import { saveTopicAction, type TopicFormState } from "@/lib/admin/actions";
import type { Dictionary } from "@/lib/i18n";
import type { L10n } from "@/content/types";

export type TopicValues = {
  id: string;
  language: string;
  level: string;
  kind: string;
  title: L10n;
  explanation: L10n | null;
  videoId: string | null;
  videoTitle: string | null;
  videoStatus: string;
  status: string;
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function TopicForm({ lang, t, languages, topic }: { lang: string; t: Dictionary["admin"]; languages: { code: string; name: string }[]; topic: TopicValues | null }) {
  const [state, action, pending] = useActionState<TopicFormState, FormData>(saveTopicAction, null);
  const v = topic;
  const field = "space-y-1 text-sm";
  return (
    // Submit manually so a failed save keeps what the admin typed (form actions reset the form).
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6" data-testid="topic-form">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="isNew" value={v ? "0" : "1"} />
      <label className={field}>
        <span className="font-semibold">{t.topicId}</span>
        <input name="id" required pattern="[\w-]+" defaultValue={v?.id} readOnly={!!v} className="input" dir="ltr" />
      </label>
      <label className={field}>
        <span className="font-semibold">{t.language}</span>
        <select name="language" defaultValue={v?.language ?? languages[0]?.code} className="input">
          {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </label>
      <label className={field}>
        <span className="font-semibold">{t.level}</span>
        <select name="level" defaultValue={v?.level ?? "A1"} className="input">
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <label className={field}>
        <span className="font-semibold">{t.kind}</span>
        <select name="kind" defaultValue={v?.kind ?? "grammar"} className="input">
          {(Object.keys(t.kinds) as (keyof typeof t.kinds)[]).map((k) => <option key={k} value={k}>{t.kinds[k]}</option>)}
        </select>
      </label>
      <label className={field}>
        <span className="font-semibold">{t.titleAr}</span>
        <input name="titleAr" required defaultValue={v?.title.ar} className="input" dir="rtl" />
      </label>
      <label className={field}>
        <span className="font-semibold">{t.titleEn}</span>
        <input name="titleEn" required defaultValue={v?.title.en} className="input" dir="ltr" />
      </label>
      <label className={`${field} sm:col-span-2`}>
        <span className="font-semibold">{t.explanationAr}</span>
        <textarea name="explanationAr" rows={5} defaultValue={v?.explanation?.ar} className="input" dir="rtl" />
      </label>
      <label className={`${field} sm:col-span-2`}>
        <span className="font-semibold">{t.explanationEn}</span>
        <textarea name="explanationEn" rows={5} defaultValue={v?.explanation?.en} className="input" dir="ltr" />
      </label>
      <label className={field}>
        <span className="font-semibold">{t.topicStatus}</span>
        <select name="status" defaultValue={v?.status ?? "draft"} className="input">
          <option value="draft">{t.draft}</option>
          <option value="published">{t.published}</option>
        </select>
      </label>
      <span />
      <label className={field}>
        <span className="font-semibold">{t.videoUrl}</span>
        <input name="videoUrl" defaultValue={v?.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : ""} className="input" dir="ltr" placeholder="https://www.youtube.com/watch?v=…" />
      </label>
      <label className={field}>
        <span className="font-semibold">{t.videoTitle}</span>
        <input name="videoTitle" defaultValue={v?.videoTitle ?? ""} className="input" dir="auto" />
      </label>
      <label className={field}>
        <span className="font-semibold">{t.videoStatus}</span>
        <select name="videoStatus" defaultValue={v?.videoStatus ?? "suggested"} className="input">
          {(Object.keys(t.videoStatuses) as (keyof typeof t.videoStatuses)[]).map((k) => <option key={k} value={k}>{t.videoStatuses[k]}</option>)}
        </select>
      </label>
      <div className="flex items-end gap-3 sm:col-span-2">
        <button className="btn-primary" disabled={pending}>{t.save}</button>
        <p role="status" className={`text-sm ${state?.ok ? "text-brand" : "text-danger"}`}>
          {state?.ok ? t.saved : state?.error ? t[state.error] : ""}
        </p>
      </div>
    </form>
  );
}
