import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/site/Header";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { cachedCoursesForLanguage } from "@/lib/shared-cache";
import { getProgress } from "@/lib/learner/study";
import { dueWords, wordCounts } from "@/lib/learner/srs";
import { dailyMistakes } from "@/lib/learner/daily";
import { chooseDailyLesson, dailyReviewLimit } from "@/lib/learner/daily-policy";
import { getLesson, outlineLessonIds } from "@/lib/curriculum";
import { toPublicLesson } from "@/content";
import { DailySession } from "@/components/daily/DailySession";
export default async function DailyPage({params}:PageProps<"/[lang]/learn/daily">){
 const {lang}=await params;if(!isLocale(lang))notFound();const dict=await getDictionary(lang);
 return <><Header lang={lang} dict={dict}/><main className="container-page max-w-4xl py-6 pb-28"><Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2"/>}><Daily lang={lang}/></Suspense></main></>;
}
async function Daily({lang}:{lang:Locale}){
 const user=await requireUser(lang,`/${lang}/learn/daily`);const track=await getActiveTrack(db,user.id);if(!track)redirect(`/${lang}/onboarding`);
 const dict=await getDictionary(lang);const courses=await cachedCoursesForLanguage(track.targetLanguage);
 const course=courses.find(c=>c.level===(track.placementLevel??track.selfLevel))??courses.find(c=>c.level==="A1")??courses[0];
 const ids=course?outlineLessonIds(course):[];
 const [progress,cards,counts,mistakes]=await Promise.all([getProgress(db,user.id,ids),dueWords(db,user.id,track.targetLanguage,dailyReviewLimit(track.dailyMinutes)),wordCounts(db,user.id,track.targetLanguage),dailyMistakes(db,user.id,track.id)]);
 const choice=chooseDailyLesson(ids.map(id=>({id,score:progress.get(id)})));
 const lesson=choice?await getLesson(db,choice.id):null;
 return <DailySession key={track.id} lang={lang} language={track.targetLanguage} level={course?.level??track.selfLevel} minutes={track.dailyMinutes} repair={choice?.score!==undefined} cards={cards.map(c=>({...c,dueAt:c.dueAt.toISOString()}))} nextDueAt={counts.nextDueAt} mistakes={mistakes} lesson={lesson?toPublicLesson(lesson.lesson):null} dict={dict} attribution={lesson?.attribution??null}/>;
}
