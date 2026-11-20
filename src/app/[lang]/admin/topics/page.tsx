import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { db } from "@/lib/db";
import { listTopics } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin/gate";
import { listLanguages } from "@/lib/learner/repo";
import { TopicForm } from "@/components/admin/TopicForm";

export default async function AdminTopicsPage({ params }: PageProps<"/[lang]/admin/topics">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Topics lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Topics({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  await requireAdmin(lang, `/${lang}/admin/topics`);
  const t = dict.admin;
  const [topics, langs] = await Promise.all([listTopics(db), listLanguages(db)]);
  const languages = langs.filter((l) => l.isTarget).map((l) => ({ code: l.code, name: lang === "ar" ? l.nameAr : l.nameEn }));
  return (
    <div className="space-y-6">
      <Link href={`/${lang}/admin`} className="text-sm text-brand hover:underline">{t.backToAdmin}</Link>
      <h1 className="text-2xl font-bold">{t.topics}</h1>
      {topics.length === 0 ? (
        <p className="card p-5 text-muted">{t.noTopics}</p>
      ) : (
        <ul className="space-y-2">
          {topics.map((x) => (
            <li key={x.id} className="card flex flex-wrap items-center gap-3 p-3">
              <Link href={`/${lang}/admin/topics/${x.id}`} className="flex-1 font-semibold hover:underline">
                {x.title[lang]} <span className="text-xs font-normal text-muted" dir="ltr">({x.language} · {x.level} · {x.id})</span>
              </Link>
              <span className="text-xs text-muted">{t.videoStatuses[x.videoStatus as keyof typeof t.videoStatuses] ?? x.videoStatus}</span>
              <span className="text-xs text-muted">{fmt(t.linkedLessons, { n: x.lessons })}</span>
            </li>
          ))}
        </ul>
      )}
      <h2 className="text-lg font-semibold">{t.newTopic}</h2>
      <TopicForm lang={lang} t={t} languages={languages} topic={null} />
    </div>
  );
}
