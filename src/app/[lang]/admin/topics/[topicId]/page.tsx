import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { db } from "@/lib/db";
import { getTopic, listTopics, unitsForLanguage } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin/gate";
import { linkTopicAction } from "@/lib/admin/actions";
import { listLanguages } from "@/lib/learner/repo";
import { TopicForm } from "@/components/admin/TopicForm";
import { TopicPanel } from "@/components/learn/TopicPanel";
import { LANGUAGE_NAMES } from "@/lib/factory/generate";

type Props = PageProps<"/[lang]/admin/topics/[topicId]">;

export default async function AdminTopicPage({ params }: Props) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <EditTopic lang={lang} dict={dict} params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function EditTopic({ lang, dict, params }: { lang: Locale; dict: Dictionary } & Pick<Props, "params">) {
  const { topicId } = await params;
  await requireAdmin(lang, `/${lang}/admin/topics/${topicId}`);
  const t = dict.admin;
  const topic = await getTopic(db, topicId);
  if (!topic) notFound();
  const [langs, units, stats] = await Promise.all([listLanguages(db), unitsForLanguage(db, topic.language), listTopics(db, topic.language)]);
  const languages = langs.filter((l) => l.isTarget).map((l) => ({ code: l.code, name: lang === "ar" ? l.nameAr : l.nameEn }));
  const linked = stats.find((s) => s.id === topic.id)?.lessons ?? 0;
  return (
    <div className="space-y-6">
      <Link href={`/${lang}/admin/topics`} className="text-sm text-brand hover:underline">← {t.topics}</Link>
      <h1 className="text-2xl font-bold">{t.editTopic}: {topic.title[lang]}</h1>
      {(topic.videoId || topic.explanation) && (
        <TopicPanel topic={{ id: topic.id, title: topic.title, explanation: topic.explanation, videoId: topic.videoId, videoTitle: topic.videoTitle }} lang={lang} label={dict.lesson.topicVideo} />
      )}
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${LANGUAGE_NAMES[topic.language]?.en ?? topic.language} grammar ${topic.title.en} ${topic.level}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost"
        data-testid="youtube-search"
      >
        {t.searchYoutube}
      </a>
      <TopicForm lang={lang} t={t} languages={languages} topic={topic} />
      <form action={linkTopicAction} className="card flex flex-wrap items-end gap-3 p-5">
        <input type="hidden" name="topicId" value={topic.id} />
        <label className="min-w-64 flex-1 space-y-1 text-sm">
          <span className="font-semibold">{t.linkUnit}</span>
          <select name="unitId" className="input">
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.level} · {u.title[lang]}</option>
            ))}
          </select>
        </label>
        <button className="btn-ghost">{t.link}</button>
        <span className="text-sm text-muted" data-testid="linked-count">{fmt(t.linkedLessons, { n: linked })}</span>
      </form>
    </div>
  );
}
