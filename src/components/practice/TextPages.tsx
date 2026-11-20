import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Headphones, BookOpen } from "lucide-react";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveTrack, DomainError } from "@/lib/learner/repo";
import { getProgress } from "@/lib/learner/study";
import { resolveText } from "@/lib/learner/skills";
import { textsFor, toPublicText } from "@/content";
import { InteractiveText } from "./InteractiveText";
import { TextQuestions } from "./TextQuestions";

export async function TextList({ lang, dict, kind }: { lang: Locale; dict: Dictionary; kind: "listening" | "reading" }) {
  const user = await requireUser(lang, `/${lang}/learn/${kind}`);
  const track = await getActiveTrack(db, user.id);
  if (!track) redirect(`/${lang}/onboarding`);
  const t = dict.practice;
  const items = textsFor(track.targetLanguage, kind);
  const progress = await getProgress(db, user.id, items.map((i) => `text:${i.id}`));
  const Icon = kind === "listening" ? Headphones : BookOpen;
  return (
    <div className="space-y-5">
      <div>
        <Link href={`/${lang}/learn`} className="text-sm text-brand hover:underline">← {dict.learn.title}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t[kind][0]}</h1>
        <p className="mt-1 text-muted">{t[kind][1]}</p>
      </div>
      {items.length === 0 ? (
        <p className="card p-5 text-muted">{t.noTexts}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => {
            const best = progress.get(`text:${it.id}`);
            return (
              <li key={it.id}>
                <Link href={`/${lang}/learn/${kind}/${it.id}`} className="card flex items-center gap-3 p-4 hover:bg-surface-2" data-testid={`text-${it.id}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="size-5" aria-hidden /></span>
                  <span className="flex-1">
                    <span className="block font-semibold">{it.title[lang]}</span>
                    <span className="chip mt-1">{it.level}</span>
                  </span>
                  {best !== undefined && <span className="flex items-center gap-1 text-sm font-semibold text-ok"><CheckCircle2 className="size-4" aria-hidden />{best}%</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export async function TextDetail({ lang, kind, params }: { lang: Locale; kind: "listening" | "reading"; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dict = await getDictionary(lang);
  const user = await requireUser(lang, `/${lang}/learn/${kind}/${id}`);
  let found;
  try {
    found = await resolveText(db, user.id, id);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }
  if (found.item.kind !== kind) notFound();
  const item = toPublicText(found.item);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href={`/${lang}/learn/${kind}`} className="text-sm text-brand hover:underline">← {dict.practice[kind][0]}</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{item.title[lang]}</h1>
        <span className="chip mt-2">{item.level}</span>
      </div>
      <InteractiveText item={item} lang={lang} t={dict.practice} listenLabel={dict.placement.listen} noVoice={dict.lesson.noVoice} />
      <TextQuestions item={item} lang={lang} t={dict.practice} />
    </div>
  );
}
