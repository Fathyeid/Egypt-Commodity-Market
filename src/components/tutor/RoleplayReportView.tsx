import type { RoleplayReport } from "@/lib/ai/schemas";
import type { Dictionary } from "@/lib/i18n";
import { Bidi } from "@/components/ui/Bidi";

export function RoleplayReportView({ report, t, language }: { report: RoleplayReport; t: Dictionary["ai"]; language: string }) {
  return (
    <section className="card space-y-5 p-5 sm:p-7" data-testid="roleplay-report">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t.reportTitle}</h2>
          <p className="mt-1 text-xs text-faint">{t.reportNote}</p>
        </div>
        <div className="rounded-2xl bg-brand-soft px-4 py-2 text-center">
          <div className="text-xs text-brand">{t.estimatedLevel}</div>
          <div className="text-2xl font-bold text-brand">{report.estimated_level}</div>
        </div>
      </div>
      <p dir="auto"><Bidi text={report.summary} /></p>
      <div className="grid gap-3 sm:grid-cols-3">
        {([["grammar", report.grammar], ["vocabulary", report.vocabulary], ["fluency", report.fluency]] as const).map(([k, v]) => (
          <div key={k} className="rounded-xl bg-surface-2 p-4">
            <h3 className="mb-1 text-sm font-semibold">{t[k]}</h3>
            <p dir="auto" className="text-sm"><Bidi text={v} /></p>
          </div>
        ))}
      </div>
      {report.errors.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">{t.errors}</h3>
          <ul className="space-y-2">
            {report.errors.map((e, i) => (
              <li key={i} className="rounded-xl border-s-4 border-accent bg-accent-soft px-3 py-2 text-sm">
                <p dir="auto" lang={language}><s className="text-danger">{e.original}</s> → <b className="text-ok">{e.corrected}</b></p>
                <p dir="auto" className="mt-0.5"><Bidi text={e.explanation} /></p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.better_phrases.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">{t.betterPhrases}</h3>
          <ul className="space-y-2">
            {report.better_phrases.map((p, i) => (
              <li key={i} className="rounded-xl border border-line px-3 py-2 text-sm">
                <p dir="auto" lang={language}><span className="text-muted">{p.original}</span> → <b>{p.better}</b></p>
                <p dir="auto" className="mt-0.5 text-muted"><Bidi text={p.why} /></p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3 className="mb-2 font-semibold">{t.nextSteps}</h3>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          {report.next_steps.map((s, i) => <li key={i} dir="auto"><Bidi text={s} /></li>)}
        </ul>
      </div>
    </section>
  );
}
