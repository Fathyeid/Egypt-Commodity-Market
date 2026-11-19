import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { ChatClient, type ChatMsg } from "@/components/tutor/ChatClient";
import { RoleplayReportView } from "@/components/tutor/RoleplayReportView";
import { AiStatusBanner } from "@/components/tutor/AiStatusBanner";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getConversation } from "@/lib/learner/conversations";
import { DomainError } from "@/lib/learner/repo";
import { learningTracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PERSONAS, SCENARIOS } from "@/lib/ai/catalog";
import { aiStatus } from "@/lib/ai/provider";
import type { Correction, RoleplayReport } from "@/lib/ai/schemas";

export default async function ConversationPage({ params }: PageProps<"/[lang]/tutor/[id]">) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-3xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Conversation lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Conversation({ lang, dict, params }: { lang: Locale; dict: Dictionary; params: PageProps<"/[lang]/tutor/[id]">["params"] }) {
  const { id } = await params;
  const user = await requireUser(lang, `/${lang}/tutor`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  let data;
  try {
    data = await getConversation(db, user.id, id);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }
  const { conversation: c, messages } = data;
  const [track] = await db.select({ language: learningTracks.targetLanguage }).from(learningTracks).where(eq(learningTracks.id, c.trackId));
  const t = dict.ai;
  const title = c.kind === "tutor" ? PERSONAS[c.persona as keyof typeof PERSONAS]?.name[lang] : SCENARIOS[c.scenario as keyof typeof SCENARIOS]?.name[lang];
  const initial: ChatMsg[] = messages.map((m) => ({
    id: m.id,
    role: m.role as ChatMsg["role"],
    content: m.content,
    corrections: m.role === "user" ? (m.corrections as Correction[] | null) : null,
    newWords: m.role === "assistant" ? ((m.corrections as { newWords?: ChatMsg["newWords"] } | null)?.newWords ?? null) : null,
  }));
  const completed = c.status === "completed";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href={`/${lang}/tutor`} className="text-sm text-brand hover:underline">← {t.tutorTitle}</Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-xs text-faint">{c.kind === "tutor" ? t.personaLabel : t.scenarioLabel}</p>
        </div>
        <Link href={`/${lang}/tutor`} className="btn-ghost px-4 py-2 text-sm">{t.newConversation}</Link>
      </div>
      <AiStatusBanner t={t} />
      {completed && c.report ? <RoleplayReportView report={c.report as RoleplayReport} t={t} language={track.language} /> : null}
      <ChatClient
        lang={lang}
        language={track.language}
        conversationId={c.id}
        kind={c.kind as "tutor" | "roleplay"}
        initial={initial}
        t={t}
        noVoice={dict.lesson.noVoice}
        disabled={completed || aiStatus() === "not_configured"}
      />
    </div>
  );
}
