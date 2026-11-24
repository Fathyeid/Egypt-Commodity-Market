import {Suspense} from "react";
import {notFound} from "next/navigation";
import {isLocale} from "@/lib/i18n/config";
import {verifyLevelCertificate} from "@/lib/learner/level-completion";
import {LevelCertificateView} from "@/components/learn/LevelCertificateView";
export const metadata={robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default function Page(p:PageProps<"/[lang]/level-certificate">){return <main className="container-page max-w-3xl py-10"><Suspense fallback={<p>…</p>}><Verified {...p}/></Suspense></main>;}
async function Verified({params,searchParams}:PageProps<"/[lang]/level-certificate">){const {lang}=await params;if(!isLocale(lang))notFound();const {token}=await searchParams,c=typeof token==="string"?verifyLevelCertificate(token):null;if(!c)return <p className="card p-6" role="alert">{lang==="ar"?"رابط الشهادة غير صالح أو تغيّر توقيع الإصدار.":"Invalid certificate link or changed signing key."}</p>;return <LevelCertificateView c={c} lang={lang} verified/>;}
