import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { verifyCertificate } from "@/lib/learner/certificates";
import { CertificateView } from "@/components/learn/CertificateView";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page(props: PageProps<"/[lang]/certificate">) {
 return <main className="container-page py-10"><Suspense fallback={<p>…</p>}><Verify {...props} /></Suspense></main>;
}
async function Verify({params,searchParams}: PageProps<"/[lang]/certificate">) {
 const {lang} = await params; if (!isLocale(lang)) notFound();
 const {token} = await searchParams;
 const c = typeof token === "string" ? verifyCertificate(token) : null;
 if (!c) return <p className="card p-6" role="alert">{lang === "ar" ? "رابط الشهادة غير صالح أو تغيّر توقيع الإصدار." : "Invalid certificate link or changed signing key."}</p>;
 return <CertificateView certificate={c} lang={lang} verified />;
}
