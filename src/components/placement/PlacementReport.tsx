import Link from "next/link";
import type { PlacementResult, Level } from "@/lib/placement/engine";
import { PLACEMENT_SKILLS } from "@/content/types";
import { fmt } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n";

const SCALE: Level[] = ["A0", "A1", "A2", "B1", "B2", "C1"];

export function PlacementReport({ lang, dict, result, takenAt, courseTitle, courseLevel, retake }: { lang: string; dict: Dictionary; result: PlacementResult; takenAt: Date; courseTitle: string | null; courseLevel: string; retake: React.ReactNode }) {
  const t = dict.placement;
  const overallIdx = SCALE.indexOf(result.overall);
  const measured = PLACEMENT_SKILLS.map((s) => ({ s, ...result.skills[s] })).filter((x) => x.level);
  const idx = (l: Level | null) => (l ? SCALE.indexOf(l) : -1);
  const strengths = measured.filter((x) => idx(x.level) > overallIdx);
  const weak = measured.filter((x) => idx(x.level) < overallIdx);
  const minIdx = Math.min(...measured.map((x) => idx(x.level)));
  const focus = weak.length ? weak : measured.filter((x) => idx(x.level) === minIdx && minIdx < Math.max(...measured.map((y) => idx(y.level))));
  const date = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium" }).format(takenAt);

  return (
    <div className="space-y-5">
      <section className="card p-5 text-center sm:p-8">
        <p className="text-muted">{t.overall}</p>
        <p className="mt-1 text-5xl font-bold text-brand" data-testid="overall-level">{result.overall}</p>
        <p className="mt-1 text-sm text-faint">{dict.levels[result.overall]} · {fmt(t.takenOn, { date })}</p>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">{t.perSkill}</h2>
        <ul className="space-y-3">
          {PLACEMENT_SKILLS.map((s) => {
            const v = result.skills[s];
            const pct = v.level ? ((SCALE.indexOf(v.level) + 1) / SCALE.length) * 100 : 0;
            return (
              <li key={s} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm sm:grid-cols-[8rem_1fr_3rem_8rem]">
                <span className="font-semibold">{dict.skills[s]}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-2"><span className={`block h-full rounded-full ${focus.some((f) => f.s === s) ? "bg-accent" : "bg-brand"}`} style={{ width: `${pct}%` }} /></span>
                <span className="rounded-md bg-surface-2 py-0.5 text-center text-xs font-bold">{v.level ?? "—"}</span>
                <span className="col-span-3 text-xs text-faint sm:col-span-1">{fmt(t.correctOf, { a: v.correct, b: v.total })}</span>
              </li>
            );
          })}
          {(["writing", "speaking", "pronunciation"] as const).map((s) => (
            <li key={s} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-sm sm:grid-cols-[8rem_1fr]">
              <span className="font-semibold text-muted">{dict.skills[s]}</span>
              <span className="text-xs text-faint">{t.notAssessed}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-faint">{t.notMeasured}</p>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-3 font-semibold">{t.planTitle}</h2>
        <ul className="list-disc space-y-1.5 ps-5">
          {strengths.length > 0 && <li>{t.strengths}: {strengths.map((x) => dict.skills[x.s]).join("، ")}</li>}
          <li>{focus.length ? fmt(t.planFocus, { skills: focus.map((x) => dict.skills[x.s]).join(lang === "ar" ? "، " : ", ") }) : t.planBalanced}</li>
          <li>{courseTitle ? fmt(t.planCourse, { course: courseTitle }) : fmt(t.planCourseMissing, { level: courseLevel })}</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/${lang}/learn`} className="btn-primary">{dict.nav.learn}</Link>
          {retake}
        </div>
        <p className="mt-4 text-xs text-faint">{t.method}</p>
      </section>
    </div>
  );
}
