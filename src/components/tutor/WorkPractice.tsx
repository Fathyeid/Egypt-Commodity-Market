"use client";

import { useState, type ReactNode } from "react";
import { BriefcaseBusiness, Check, Handshake, Phone, Presentation, Target } from "lucide-react";
import { WORK_SCENARIOS, WORK_SCENARIO_IDS, type WorkScenarioId } from "@/lib/ai/work-scenarios";
import type { Locale } from "@/lib/i18n/config";

const ICONS = { handshake: Handshake, phone: Phone, presentation: Presentation };
const COPY = {
  ar: {
    eyebrow: "محادثات للشغل",
    title: "جرّب الموقف هنا، واتكلم بثقة هناك",
    subtitle: "اختار موقفًا واتدرّب مع شريك ذكي بلغة مسارك وعلى مستواك. التصحيح والتقرير بعد المحادثة، عشان تركّز في الكلام.",
    choose: "اختار الموقف",
    mission: "مهمتك في المحادثة",
    selected: "الموقف المختار",
    note: "مواقف خيالية للتدريب اللغوي فقط. استخدم أسماء وتفاصيل غير حقيقية.",
    flow: ["اختار موقفًا", "اتكلم بطريقتك", "راجع تقريرك"],
  },
  en: {
    eyebrow: "Work conversations",
    title: "Practise here. Speak with confidence out there.",
    subtitle: "Choose a situation and practise with an AI partner in your track's language, at your level. Corrections and feedback come after the conversation so you can focus on speaking.",
    choose: "Choose a situation",
    mission: "Your conversation goals",
    selected: "Selected situation",
    note: "Fictional situations for language practice only. Use made-up names and details.",
    flow: ["Pick a situation", "Say it your way", "Review your feedback"],
  },
};

/** Start controls are composed by the caller; selecting a card never calls AI. */
export function WorkPractice({ lang, startControls }: { lang: Locale; startControls: Record<WorkScenarioId, ReactNode> }) {
  const [selected, setSelected] = useState<WorkScenarioId>("supplier_followup");
  const t = COPY[lang];
  const scenario = WORK_SCENARIOS[selected];
  return (
    <section aria-labelledby="work-practice-title" className="space-y-5" data-testid="work-practice">
      <div className="max-w-3xl space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand"><BriefcaseBusiness className="size-4" aria-hidden />{t.eyebrow}</p>
        <h2 id="work-practice-title" className="text-2xl font-bold sm:text-3xl">{t.title}</h2>
        <p className="text-sm leading-7 text-muted sm:text-base">{t.subtitle}</p>
      </div>
      <ol className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted sm:text-sm">
        {t.flow.map((step, i) => <li key={step} className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-brand-soft font-bold text-brand" aria-hidden>{i + 1}</span>{step}</li>)}
      </ol>
      <div role="group" aria-label={t.choose} className="grid gap-3 sm:grid-cols-3">
        {WORK_SCENARIO_IDS.map((id) => {
          const s = WORK_SCENARIOS[id];
          const Icon = ICONS[s.icon as keyof typeof ICONS];
          const active = id === selected;
          return <button key={id} type="button" aria-pressed={active} onClick={() => setSelected(id)} className={`card relative p-4 text-start transition-colors sm:p-5 ${active ? "border-brand bg-brand-soft/40 ring-1 ring-brand" : "hover:border-brand/50 hover:bg-surface-2"}`}>
            <span className={`mb-3 grid size-10 place-items-center rounded-xl ${active ? "bg-brand text-brand-ink" : "bg-surface-2 text-brand"}`}><Icon className="size-5" aria-hidden /></span>
            {active && <Check className="absolute end-4 top-4 size-4 text-brand" aria-label={t.selected} />}
            <span className="block font-bold">{s.name[lang]}</span>
            <span className="mt-1 block text-sm leading-6 text-muted">{s.description[lang]}</span>
          </button>;
        })}
      </div>
      <div className="card grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6" aria-live="polite" aria-atomic="true">
        <div>
          <h3 className="flex items-center gap-2 font-bold"><Target className="size-5 text-brand" aria-hidden />{t.mission}: {scenario.name[lang]}</h3>
          <ul className="mt-3 space-y-2">
            {scenario.goals[lang].map((goal) => <li key={goal} className="flex items-start gap-2 text-sm"><Check className="mt-1 size-4 shrink-0 text-ok" aria-hidden /><span>{goal}</span></li>)}
          </ul>
        </div>
        <div key={selected} className="border-t border-line pt-4 sm:max-w-56 sm:border-s sm:border-t-0 sm:ps-6 sm:pt-0">
          {startControls[selected]}
          <p className="mt-3 text-xs leading-6 text-faint">{t.note}</p>
        </div>
      </div>
    </section>
  );
}
