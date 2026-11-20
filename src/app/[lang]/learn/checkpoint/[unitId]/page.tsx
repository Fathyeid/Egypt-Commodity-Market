import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { DomainError } from "@/lib/learner/repo";
import { getCheckpoint, PASS_SCORE } from "@/lib/learner/checkpoint";
import { CheckpointPlayer } from "@/components/learn/CheckpointPlayer";

type Props = PageProps<"/[lang]/learn/checkpoint/[unitId]">;

export default async function CheckpointPage({ params }: Props) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-2xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Checkpoint lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Checkpoint({ lang, dict, params }: { lang: Locale; dict: Dictionary } & Pick<Props, "params">) {
  const { unitId } = await params;
  const user = await requireUser(lang, `/${lang}/learn/checkpoint/${unitId}`);
  let data;
  try {
    data = await getCheckpoint(db, user.id, unitId);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }
  const t = dict.checkpoint;
  const l = dict.lesson;
  const back = `/${lang}/learn?level=${data.unit.level}`;
  return (
    <div className="space-y-5">
      <div>
        <Link href={back} className="text-sm text-brand hover:underline">← {dict.learn.title}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{fmt(t.title, { unit: data.unit.title[lang] })}</h1>
        <p className="mt-1 text-muted">{fmt(t.intro, { n: data.exercises.length, p: PASS_SCORE })}</p>
        {data.bestScore !== null && <p className="mt-1 text-sm font-semibold text-brand">{fmt(t.best, { n: data.bestScore })}</p>}
      </div>
      <CheckpointPlayer
        unitId={unitId}
        exercises={data.exercises}
        lang={lang}
        language={data.unit.language}
        labels={{ typeHere: l.typeHere, tapWords: l.tapWords, clear: l.clear, pickMeaning: l.pickMeaning, listen: dict.placement.listen, noVoice: l.noVoice }}
        t={t}
        backHref={back}
      />
    </div>
  );
}
