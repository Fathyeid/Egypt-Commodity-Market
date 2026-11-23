import {Suspense} from "react";
import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {Headphones} from "lucide-react";
import {Header} from "@/components/site/Header";
import {getDictionary} from "@/lib/i18n";
import {isLocale,type Locale} from "@/lib/i18n/config";
import {requireUser} from "@/lib/auth/session";
import {db} from "@/lib/db";
import {getActiveTrack} from "@/lib/learner/repo";
import {SCENARIOS} from "@/lib/ai/catalog";
import {VOICE_SESSIONS} from "@/lib/ai/voice-sessions";
import {aiStatus} from "@/lib/ai/provider";
import {listConversations} from "@/lib/learner/conversations";
import {VoiceStart} from "@/components/tutor/VoiceStart";
import {AiStatusBanner} from "@/components/tutor/AiStatusBanner";
export default async function Page({params}:PageProps<"/[lang]/tutor/voice">){const {lang}=await params;if(!isLocale(lang))notFound();const dict=await getDictionary(lang);return <><Header lang={lang} dict={dict}/><main className="container-page max-w-5xl py-6 pb-28"><Suspense fallback={<div className="h-96 animate-pulse bg-surface-2"/>}><Hub lang={lang}/></Suspense></main></>;}
async function Hub({lang}:{lang:Locale}){const user=await requireUser(lang,`/${lang}/tutor/voice`);const track=await getActiveTrack(db,user.id);if(!track)redirect(`/${lang}/onboarding`);const dict=await getDictionary(lang);const ar=lang==="ar";const recent=(await listConversations(db,user.id,20)).filter(c=>c.trackId===track.id&&c.kind==="roleplay"&&c.scenario&&c.scenario in VOICE_SESSIONS).slice(0,5);return <div className="space-y-6"><section className="card bg-brand-soft p-6"><Headphones className="size-8 text-brand"/><h1 className="mt-3 text-3xl font-bold">{ar?"اتكلم أكتر. اتردد أقل.":"Speak more. Hesitate less."}</h1><p className="mt-3 max-w-2xl text-muted">{ar?"حصة محادثة كاملة في موقف تختاره. اتكلم بالميكروفون، راجع الكلام، اسمع رد شريكك، وفي الآخر خُد تقريرًا على كلامك الحقيقي.":"A complete conversation session in a scene you choose. Speak into your microphone, review the words, hear your partner, then get feedback on what you actually said."}</p><p className="mt-3 text-xs text-muted">{ar?"بصوت المتصفح وبنفس حد المدرس اليومي، بدون خدمة صوت مدفوعة. التعرف والصوت يعتمدان على جهازك ومتصفحك. متاح بديل كتابي. التقييم لغوي للنص وليس قياسًا طبيًا أو صوتيًا للنطق.":"Uses browser speech and your existing tutor limits, with no paid voice service. Voice availability depends on your device and browser. Typing is always available. Feedback assesses text, not acoustic pronunciation."}</p></section><AiStatusBanner t={dict.ai}/><div className="grid gap-4 sm:grid-cols-2">{(Object.keys(VOICE_SESSIONS) as (keyof typeof VOICE_SESSIONS)[]).map(id=><article key={id} className="card p-5"><h2 className="text-xl font-bold">{SCENARIOS[id].name[lang]}</h2><ul className="mt-3 space-y-2 text-sm text-muted">{VOICE_SESSIONS[id].goals[lang].map(g=><li key={g}>✓ {g}</li>)}</ul><VoiceStart lang={lang} scenario={id} disabled={aiStatus()==="not_configured"} errors={dict.ai.errorsMap}/></article>)}</div>{recent.length>0&&<section><h2 className="mb-3 font-bold">{ar?"كمل حصة أو راجع تقريرك":"Continue a session or review feedback"}</h2><ul className="space-y-2">{recent.map(c=><li key={c.id}><Link className="card flex justify-between gap-3 p-4" href={`/${lang}/tutor/voice/${c.id}`}><span>{SCENARIOS[c.scenario as keyof typeof SCENARIOS].name[lang]}</span><span className="text-sm text-brand">{c.status==="completed"?dict.ai.report:dict.ai.continue}</span></Link></li>)}</ul></section>}</div>;}
