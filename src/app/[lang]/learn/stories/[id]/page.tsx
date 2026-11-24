import {lang as rootLang} from "next/root-params";
import {Suspense} from "react";
import {notFound} from "next/navigation";
import {Header} from "@/components/site/Header";
import {StoryPlayer} from "@/components/stories/StoryPlayer";
import {getDictionary} from "@/lib/i18n";
import {isLocale,type Locale} from "@/lib/i18n/config";
import {requireUser} from "@/lib/auth/session";
import {getActiveTrack} from "@/lib/learner/repo";
import {db} from "@/lib/db";
import {storyById,publicStory} from "@/lib/stories/catalog";
export default async function Page({params}:PageProps<"/[lang]/learn/stories/[id]">){const lang=await rootLang();if(!isLocale(lang))notFound();const dict=await getDictionary(lang);return <><Header lang={lang} dict={dict}/><main className="container-page max-w-3xl py-8 pb-28"><Suspense fallback={<p>…</p>}><Story lang={lang} params={params}/></Suspense></main></>;}
async function Story({lang,params}:{lang:Locale;params:Promise<{id:string}>}){const {id}=await params;const user=await requireUser(lang,`/${lang}/learn/stories/${id}`),track=await getActiveTrack(db,user.id),s=storyById(id);if(!s||s.language!==track?.targetLanguage)notFound();return <StoryPlayer story={publicStory(s)} lang={lang}/>;}
