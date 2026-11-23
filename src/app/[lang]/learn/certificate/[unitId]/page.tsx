import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { signCertificate, unitCertificate } from "@/lib/learner/certificates";
import { CertificateView } from "@/components/learn/CertificateView";
import { DomainError } from "@/lib/learner/repo";
export default function Page(props: PageProps<"/[lang]/learn/certificate/[unitId]">) {
 return <main className="container-page py-10 pb-28"><Suspense fallback={<p>…</p>}><Owned {...props} /></Suspense></main>;
}
async function Owned({params}: PageProps<"/[lang]/learn/certificate/[unitId]">) {
 const {lang,unitId} = await params; if (!isLocale(lang)) notFound();
 const user = await requireUser(lang);
 let c;
 try { c = await unitCertificate(db,user.id,unitId); } catch(e) { if(e instanceof DomainError) notFound(); throw e; }
 return <div className="space-y-5"><Link className="text-brand print:hidden" href={`/${lang}/learn`}>{lang === "ar" ? "رجوع للدروس" : "Back to lessons"}</Link>{c ? <CertificateView lang={lang} certificate={c} token={signCertificate(c)} /> : <div className="card p-6"><h1 className="text-xl font-bold">{lang === "ar" ? "شهادة إتمام الوحدة" : "Unit completion certificate"}</h1><p className="mt-3 text-muted">{lang === "ar" ? "كمّل كل دروس الوحدة واجتز اختبار كل درس واختبار الوحدة بنسبة 70% على الأقل لفتح الشهادة." : "Complete every lesson and pass each lesson quiz and the unit checkpoint with at least 70% to unlock your certificate."}</p></div>}</div>;
}
