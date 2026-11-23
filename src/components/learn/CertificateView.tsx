"use client";
import { useState } from "react";
import type { Certificate } from "@/lib/learner/certificates";

export function CertificateView({ certificate: c, token, lang, verified = false }: { certificate: Certificate; token?: string; lang: "ar" | "en"; verified?: boolean }) {
  const [link, setLink] = useState("");
  const ar = lang === "ar";
  return <div className="mx-auto max-w-3xl space-y-5">
    <article className="card border-2 border-brand p-6 text-center sm:p-12" data-testid="certificate">
      <p className="text-xl font-bold text-brand">{ar ? "لسان" : "Lisan"}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted">{ar ? "شهادة إتمام وحدة" : "Unit completion certificate"}</p>
      <h1 className="mt-6 break-words text-3xl font-bold">{c.name}</h1>
      <p className="mt-5 text-muted">{ar ? "أتمّ الدروس واجتاز اختبار كل درس واختبار الوحدة بنسبة 70% على الأقل" : "Completed the lessons and passed every lesson quiz and the unit checkpoint with at least 70%"}</p>
      <h2 className="mt-4 text-xl font-bold">{c.unit[lang]}</h2>
      <p className="mt-2 text-brand" dir="ltr">{c.language.toUpperCase()} · {c.level}</p>
      <p className="mt-6 text-sm text-muted">{new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(c.completedAt))}</p>
      <p className="mt-8 border-t border-line pt-4 text-xs text-faint">{ar ? "شهادة إتمام من لسان، وليست اعتمادًا خارجيًا أو إثباتًا لإجادة مستوى CEFR." : "A Lisan completion certificate. Not an external accreditation or proof of CEFR proficiency."}</p>
      {verified && <p className="mt-3 text-sm font-semibold text-ok">{ar ? "التوقيع الرقمي صحيح. البيانات مثبتة وقت الإصدار." : "Valid digital signature. Details reflect the time of issue."}</p>}
    </article>
    {!verified && <div className="space-y-3 print:hidden">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => window.print()}>{ar ? "طباعة / حفظ PDF" : "Print / Save PDF"}</button>
        {token && <button type="button" className="btn-ghost" onClick={() => setLink(`${window.location.origin}/${lang}/certificate?token=${encodeURIComponent(token)}`)}>{ar ? "إنشاء رابط تحقق قابل للمشاركة" : "Create a shareable verification link"}</button>}
      </div>
      <p className="text-xs text-faint">{ar ? "رابط التحقق يكشف اسمك وتفاصيل الشهادة لأي شخص معه الرابط. لا يتم إرساله أو نشره تلقائيًا." : "Anyone with the verification link can see your name and certificate details. It is not sent or published automatically."}</p>
      {link && <input className="input text-xs" readOnly value={link} aria-label={ar ? "رابط التحقق" : "Verification link"} onFocus={(e) => e.target.select()} />}
    </div>}
  </div>;
}
