import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { PlacementReport } from "@/components/placement/PlacementReport";
import { StartPlacementButton } from "@/components/placement/StartPlacementButton";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack } from "@/lib/learner/repo";
import { latestPlacement } from "@/lib/learner/study";
import { placementAvailable } from "@/lib/learner/placement-bank";
import { cachedCoursesForLanguage } from "@/lib/shared-cache";
import { TOTAL_ITEMS } from "@/lib/placement/engine";

export default async function PlacementPage({ params }: PageProps<"/[lang]/placement">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{dict.placement.title}</h1>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Content lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Content({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await requireUser(lang, `/${lang}/placement`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.placement;
  if (!placementAvailable(track.targetLanguage)) {
    return <p className="card p-5 text-muted">{t.unavailable}</p>;
  }
  const last = await latestPlacement(db, user.id, track.id);
  if (last?.status === "completed" && last.result) {
    const level = last.result.overall === "A0" ? "A1" : last.result.overall;
    const course = (await cachedCoursesForLanguage(track.targetLanguage)).find((c) => c.level === level);
    return (
      <PlacementReport
        lang={lang}
        dict={dict}
        result={last.result}
        takenAt={last.completedAt ?? last.startedAt}
        courseTitle={course ? course.title[lang] : null}
        courseLevel={level}
        retake={<StartPlacementButton lang={lang} label={t.retake} variant="ghost" errorText={dict.errors.generic} />}
      />
    );
  }
  return (
    <section className="card space-y-4 p-5 sm:p-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
        <ClipboardCheck className="size-6" aria-hidden />
      </span>
      <p className="text-lg">{fmt(t.intro, { n: TOTAL_ITEMS })}</p>
      <p className="text-sm text-muted">{t.audioNote}</p>
      <p className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-muted">{t.notMeasured}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <StartPlacementButton lang={lang} label={last?.status === "in_progress" ? t.resume : t.start} errorText={dict.errors.generic} />
      </div>
    </section>
  );
}
