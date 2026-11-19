import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { PlacementRunner } from "@/components/placement/PlacementRunner";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getPlacementState } from "@/lib/learner/study";
import { DomainError } from "@/lib/learner/repo";

export default async function PlacementTestPage({ params }: PageProps<"/[lang]/placement/[testId]">) {
  // The locale is a static root param; the test id is only known at request time, so it's read inside <Suspense>.
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="mx-auto h-80 max-w-2xl animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Runner lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Runner({ lang, dict, params }: { lang: Locale; dict: Dictionary; params: PageProps<"/[lang]/placement/[testId]">["params"] }) {
  const { testId } = await params;
  const user = await requireUser(lang, `/${lang}/placement`);
  if (!/^[0-9a-f-]{36}$/i.test(testId)) notFound();
  let state;
  try {
    state = await getPlacementState(db, user.id, testId);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }
  if (!state.next) redirect(`/${lang}/placement`);
  return (
    <PlacementRunner
      lang={lang}
      language={state.test.language}
      testId={testId}
      item={state.next}
      answered={state.answered}
      total={state.total}
      t={dict.placement}
      skills={dict.skills}
      noVoice={dict.lesson.noVoice}
      errors={dict.errors}
    />
  );
}
