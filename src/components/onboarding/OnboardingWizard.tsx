"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { completeOnboardingAction } from "@/lib/actions";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/ar";
import { DAILY_MINUTES, GOALS, SELF_LEVELS } from "@/lib/validation";

export type LangOption = { code: string; name: string; nativeName: string; glyph: string; isTarget: boolean };
type Step = "native" | "target" | "goal" | "time" | "level" | "summary";
const STEPS: Step[] = ["native", "target", "goal", "time", "level", "summary"];

type Props = {
  lang: string;
  languages: LangOption[];
  initialNative: string | null;
  t: Pick<Dictionary, "onboarding" | "goals" | "times" | "levels" | "common" | "errors" | "profile">;
};

export function OnboardingWizard({ lang, languages, initialNative, t }: Props) {
  const [i, setI] = useState(initialNative ? 1 : 0);
  const [v, setV] = useState<{ native: string | null; target: string | null; goal: string | null; time: string | null; level: string | null }>({
    native: initialNative,
    target: null,
    goal: null,
    time: null,
    level: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const step = STEPS[i];
  const total = STEPS.length - 1;
  const canNext = step === "summary" || !!v[step as keyof typeof v];
  const isRtl = lang === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  const pick = (key: keyof typeof v, value: string) => {
    setError(null);
    setV((s) => ({ ...s, [key]: value, ...(key === "native" && s.target === value ? { target: null } : {}) }));
  };

  const submit = () =>
    start(async () => {
      const res = await completeOnboardingAction(lang, {
        nativeLanguage: v.native,
        targetLanguage: v.target,
        goal: v.goal,
        dailyMinutes: Number(v.time),
        selfLevel: v.level,
      });
      if (res && !res.ok) setError(t.errors[res.error as keyof typeof t.errors] ?? t.errors.generic);
    });

  const langName = (c: string | null) => languages.find((l) => l.code === c)?.name ?? "—";

  return (
    <div className="card mx-auto w-full max-w-2xl p-5 shadow-card sm:p-8">
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(i / total) * 100}%` }} />
      </div>
      {step !== "summary" && <p className="text-sm text-faint">{fmt(t.onboarding.step, { a: i + 1, b: total })}</p>}
      <h1 className="mt-1 mb-5 text-xl font-bold sm:text-2xl">{t.onboarding[step === "summary" ? "summary" : step]}</h1>

      <div key={step} className="animate-fade-up">
        {(step === "native" || step === "target") && (
          <Options>
            {languages
              .filter((l) => (step === "target" ? l.isTarget && l.code !== v.native : true))
              .map((l) => (
                <Option key={l.code} selected={v[step] === l.code} onClick={() => pick(step, l.code)} glyph={l.glyph} glyphLang={l.code} label={l.name} sub={l.nativeName} subLang={l.code} />
              ))}
          </Options>
        )}
        {step === "goal" && (
          <Options>
            {GOALS.map((g) => (
              <Option key={g} selected={v.goal === g} onClick={() => pick("goal", g)} label={t.goals[g]} />
            ))}
          </Options>
        )}
        {step === "time" && (
          <Options>
            {DAILY_MINUTES.map((m) => {
              const [label, sub] = t.times[String(m) as keyof typeof t.times];
              return <Option key={m} selected={v.time === String(m)} onClick={() => pick("time", String(m))} label={label} sub={sub} />;
            })}
          </Options>
        )}
        {step === "level" && (
          <>
            <Options>
              {SELF_LEVELS.map((lv) => (
                <Option key={lv} selected={v.level === lv} onClick={() => pick("level", lv)} label={lv} sub={t.levels[lv]} />
              ))}
            </Options>
            <p className="mt-3 text-sm text-faint">{t.onboarding.levelNote}</p>
          </>
        )}
        {step === "summary" && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
            <dt className="text-muted">{t.profile.nativeLanguage}</dt>
            <dd className="font-semibold">{langName(v.native)}</dd>
            <dt className="text-muted">{t.profile.targetLanguage}</dt>
            <dd className="font-semibold">{langName(v.target)}</dd>
            <dt className="text-muted">{t.profile.goal}</dt>
            <dd className="font-semibold">{v.goal ? t.goals[v.goal as keyof typeof t.goals] : "—"}</dd>
            <dt className="text-muted">{t.profile.dailyMinutes}</dt>
            <dd className="font-semibold">{v.time ? fmt(t.common.minutes, { n: v.time }) : "—"}</dd>
            <dt className="text-muted">{t.profile.selfLevel}</dt>
            <dd className="font-semibold">{v.level ? `${v.level} · ${t.levels[v.level as keyof typeof t.levels]}` : "—"}</dd>
          </dl>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" className={`btn-ghost ${i === 0 ? "invisible" : ""}`} onClick={() => setI((n) => Math.max(0, n - 1))} disabled={pending}>
          <BackIcon className="size-4" aria-hidden />
          {t.common.back}
        </button>
        {step === "summary" ? (
          <button type="button" data-testid="wizard-next" className="btn-primary" onClick={submit} disabled={pending}>
            {pending ? t.onboarding.saving : t.common.finish}
            {!pending && <Check className="size-4" aria-hidden />}
          </button>
        ) : (
          <button type="button" data-testid="wizard-next" className="btn-primary" onClick={() => setI((n) => n + 1)} disabled={!canNext}>
            {t.common.next}
            <NextIcon className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3">{children}</div>;
}

function Option({ selected, onClick, label, sub, glyph, glyphLang, subLang }: { selected: boolean; onClick: () => void; label: string; sub?: string; glyph?: string; glyphLang?: string; subLang?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border-[1.5px] p-3.5 text-start transition-colors ${selected ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-faint"}`}
    >
      {glyph && (
        <span lang={glyphLang} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 font-semibold" aria-hidden>
          {glyph}
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        {sub && (
          <span lang={subLang} className="block text-sm text-muted">
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}
