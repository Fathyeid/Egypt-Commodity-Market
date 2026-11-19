"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Plus, Star, Trash2 } from "lucide-react";
import { addTrackAction, deleteTrackAction, setActiveTrackAction, updateProfileAction, updateTrackAction, type ActionResult } from "@/lib/actions";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/ar";
import { DAILY_MINUTES, GOALS, SELF_LEVELS } from "@/lib/validation";

type Lang = { code: string; name: string; glyph: string; isTarget: boolean };
type Track = { id: string; targetLanguage: string; goal: string; dailyMinutes: number; selfLevel: string; isActive: boolean };
type T = Pick<Dictionary, "profile" | "common" | "errors" | "goals" | "levels" | "dashboard" | "auth">;

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = (fn: () => Promise<ActionResult>, t: T, okText?: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        setMsg(okText ? { ok: true, text: okText } : null);
        after?.();
        router.refresh();
      } else setMsg({ ok: false, text: t.errors[r.error as keyof T["errors"]] ?? t.errors.generic });
    });
  return { pending, msg, run };
}

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return (
    <p role={m.ok ? "status" : "alert"} className={`rounded-xl px-4 py-2 text-sm ${m.ok ? "bg-brand-soft text-brand" : "bg-danger-soft text-danger"}`}>
      {m.text}
    </p>
  );
}

const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className="input appearance-auto" />;

export function AccountForm({ lang, t, email, name, nativeLanguage, languages }: { lang: string; t: T; email: string; name: string; nativeLanguage: string | null; languages: Lang[] }) {
  const router = useRouter();
  const { pending, msg, run } = useAction();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const uiLocale = String(fd.get("uiLocale"));
        run(
          () => updateProfileAction({ name: fd.get("name"), nativeLanguage: fd.get("nativeLanguage"), uiLocale }),
          t,
          t.common.saved,
          () => {
            if (uiLocale !== lang) router.replace(`/${uiLocale}/profile`);
          },
        );
      }}
    >
      <Msg m={msg} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">{t.auth.name}</label>
          <input id="name" name="name" defaultValue={name} required maxLength={80} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">{t.auth.email}</label>
          <input id="email" value={email} readOnly dir="ltr" className="input text-start text-muted" />
        </div>
        <div>
          <label className="label" htmlFor="nativeLanguage">{t.profile.nativeLanguage}</label>
          <Select id="nativeLanguage" name="nativeLanguage" defaultValue={nativeLanguage ?? ""} required>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="label" htmlFor="uiLocale">{t.profile.uiLanguage}</label>
          <Select id="uiLocale" name="uiLocale" defaultValue={lang}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </Select>
        </div>
      </div>
      <button className="btn-primary" disabled={pending}>
        <Check className="size-4" aria-hidden />
        {t.common.save}
      </button>
    </form>
  );
}

function TrackFields({ t, track }: { t: T; track?: Track }) {
  return (
    <>
      <div>
        <label className="label">{t.profile.goal}</label>
        <Select name="goal" defaultValue={track?.goal ?? "daily"} aria-label={t.profile.goal}>
          {GOALS.map((g) => <option key={g} value={g}>{t.goals[g]}</option>)}
        </Select>
      </div>
      <div>
        <label className="label">{t.profile.dailyMinutes}</label>
        <Select name="dailyMinutes" defaultValue={String(track?.dailyMinutes ?? 15)} aria-label={t.profile.dailyMinutes}>
          {DAILY_MINUTES.map((m) => <option key={m} value={m}>{fmt(t.common.minutes, { n: m })}</option>)}
        </Select>
      </div>
      <div>
        <label className="label">{t.profile.selfLevel}</label>
        <Select name="selfLevel" defaultValue={track?.selfLevel ?? "A1"} aria-label={t.profile.selfLevel}>
          {SELF_LEVELS.map((l) => <option key={l} value={l}>{l} · {t.levels[l]}</option>)}
        </Select>
      </div>
    </>
  );
}

export function TrackList({ t, tracks, languages }: { t: T; tracks: Track[]; languages: Lang[] }) {
  return (
    <ul className="space-y-3">
      {tracks.map((tr) => (
        <TrackItem key={tr.id} t={t} track={tr} lang={languages.find((l) => l.code === tr.targetLanguage)} canDelete={tracks.length > 1} />
      ))}
    </ul>
  );
}

function TrackItem({ t, track, lang, canDelete }: { t: T; track: Track; lang?: Lang; canDelete: boolean }) {
  const { pending, msg, run } = useAction();
  return (
    <li className={`rounded-2xl border p-4 ${track.isActive ? "border-brand" : "border-line"}`} data-testid={`track-${track.targetLanguage}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span lang={lang?.code} className="grid size-8 place-items-center rounded-full bg-surface-2 text-sm font-semibold" aria-hidden>{lang?.glyph}</span>
        <span className="font-semibold">{lang?.name ?? track.targetLanguage}</span>
        {track.isActive && <span className="chip bg-brand-soft text-brand">{t.dashboard.active}</span>}
        <div className="ms-auto flex gap-2">
          {!track.isActive && (
            <button type="button" className="btn-ghost px-3 py-1.5 text-sm" disabled={pending} onClick={() => run(() => setActiveTrackAction(track.id), t)}>
              <Star className="size-4" aria-hidden />
              {t.profile.makeActive}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn-danger px-3 py-1.5 text-sm"
              disabled={pending}
              onClick={() => {
                if (confirm(t.profile.confirmDelete)) run(() => deleteTrackAction(track.id), t);
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {t.profile.delete}
            </button>
          )}
        </div>
      </div>
      <form
        className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          run(() => updateTrackAction(track.id, { goal: fd.get("goal"), dailyMinutes: fd.get("dailyMinutes"), selfLevel: fd.get("selfLevel") }), t, t.common.saved);
        }}
      >
        <TrackFields t={t} track={track} />
        <button className="btn-ghost" disabled={pending}>{t.common.save}</button>
      </form>
      <div className="mt-2"><Msg m={msg} /></div>
    </li>
  );
}

export function AddTrackForm({ t, languages, taken, nativeLanguage }: { t: T; languages: Lang[]; taken: string[]; nativeLanguage: string | null }) {
  const [open, setOpen] = useState(false);
  const { pending, msg, run } = useAction();
  const options = languages.filter((l) => l.isTarget && !taken.includes(l.code) && l.code !== nativeLanguage);
  if (!options.length) return null;
  if (!open)
    return (
      <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        {t.profile.addTrack}
      </button>
    );
  return (
    <form
      className="space-y-3 rounded-2xl border border-dashed border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run(
          () => addTrackAction({ targetLanguage: fd.get("targetLanguage"), goal: fd.get("goal"), dailyMinutes: fd.get("dailyMinutes"), selfLevel: fd.get("selfLevel") }),
          t,
          undefined,
          () => setOpen(false),
        );
      }}
    >
      <Msg m={msg} />
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label">{t.profile.targetLanguage}</label>
          <Select name="targetLanguage" required aria-label={t.profile.targetLanguage}>
            {options.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </Select>
        </div>
        <TrackFields t={t} />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" disabled={pending}>{t.profile.addTrack}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t.common.cancel}</button>
      </div>
    </form>
  );
}
