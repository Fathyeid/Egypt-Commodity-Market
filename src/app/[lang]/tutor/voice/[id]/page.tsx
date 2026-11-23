import {Suspense} from "react";
import {notFound} from "next/navigation";
import {lang as rootLang} from "next/root-params";
import {Header} from "@/components/site/Header";
import {getDictionary} from "@/lib/i18n";
import {isLocale,type Locale} from "@/lib/i18n/config";
import {requireUser} from "@/lib/auth/session";
import {db} from "@/lib/db";
import {learningTracks} from "@/lib/db/schema";
import {and,eq} from "drizzle-orm";
import {getConversation} from "@/lib/learner/conversations";
import {DomainError} from "@/lib/learner/repo";
import {SCENARIOS} from "@/lib/ai/catalog";
import {VOICE_SESSIONS} from "@/lib/ai/voice-sessions";
import {AiStatusBanner} from "@/components/tutor/AiStatusBanner";
import {VoiceSession} from "@/components/tutor/VoiceSession";
import {aiStatus} from "@/lib/ai/provider";
import type {RoleplayReport} from "@/lib/ai/schemas";
export default async function Page({params}:PageProps<"/[lang]/tutor/voice/[id]">){const lang=await rootLang();if(!isLocale(lang))notFound();const dict=await getDictionary(lang);return <><Header lang={lang} dict={dict}/><main className="container-page max-w-4xl py-6 pb-28"><Suspense fallback={<div className="h-96 animate-pulse bg-surface-2"/>}><Session lang={lang} params={params}/></Suspense></main></>;}
async function Session({lang,params}:{lang:Locale;params:PageProps<"/[lang]/tutor/voice/[id]">["params"]}){const {id}=await params;const user=await requireUser(lang,`/${lang}/tutor/voice`);if(!/^[0-9a-f-]{36}$/i.test(id))notFound();let data;try{data=await getConversation(db,user.id,id);}catch(e){if(e instanceof DomainError)notFound();throw e;}const c=data.conversation;if(c.kind!=="roleplay"||!c.scenario||!(c.scenario in VOICE_SESSIONS))notFound();const [track]=await db.select().from(learningTracks).where(and(eq(learningTracks.id,c.trackId),eq(learningTracks.userId,user.id)));if(!track)notFound();const scene=c.scenario as keyof typeof VOICE_SESSIONS;const dict=await getDictionary(lang);return <><AiStatusBanner t={dict.ai}/><VoiceSession lang={lang} language={track.targetLanguage} id={id} title={SCENARIOS[scene].name[lang]} goals={[...VOICE_SESSIONS[scene].goals[lang]]} initial={data.messages.map(m=>({id:m.id,role:m.role as "user"|"assistant",content:m.content}))} report={c.status==="completed"?c.report as RoleplayReport:null} disabled={aiStatus()==="not_configured"||c.status==="completed"} dict={dict}/></>;}
