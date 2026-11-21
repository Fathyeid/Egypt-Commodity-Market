import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { db } from "@/lib/db";
import { courseStats } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin/gate";
import { setCourseStatusAction } from "@/lib/admin/actions";
import { cachedLanguages } from "@/lib/shared-cache";

export default async function AdminPage({ params }: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <Overview lang={lang} dict={dict} />
        </Suspense>
      </main>
    </>
  );
}

async function Overview({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  await requireAdmin(lang, `/${lang}/admin`);
  const t = dict.admin;
  const [stats, langs] = await Promise.all([courseStats(db), cachedLanguages()]);
  const name = (code: string) => {
    const l = langs.find((x) => x.code === code);
    return l ? (lang === "ar" ? l.nameAr : l.nameEn) : code;
  };
  const byLang = [...new Set(stats.map((s) => s.language))];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <Link href={`/${lang}/admin/topics`} className="btn-ghost">{t.topics}</Link>
      </div>
      <p className="card border-brand/30 bg-brand-soft/40 p-4 text-sm">{t.notice}</p>
      {byLang.map((code) => (
        <section key={code} className="card overflow-x-auto p-5 sm:p-6" data-testid={`admin-lang-${code}`}>
          <h2 className="mb-3 font-semibold">{name(code)}</h2>
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="text-muted">
              <tr className="text-start">
                <th className="py-1 text-start font-medium">{t.level}</th>
                <th className="py-1 text-start font-medium">{t.draft}</th>
                <th className="py-1 text-start font-medium">{t.published}</th>
                <th className="py-1 text-start font-medium">{t.rejected}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {stats
                .filter((s) => s.language === code)
                .map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-2 font-semibold">{s.level}</td>
                    <td className="py-2">{s.draft}</td>
                    <td className="py-2">{s.published}</td>
                    <td className="py-2">{s.rejected}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/${lang}/admin/courses/${s.id}?status=draft`} className="btn-ghost px-3 py-1.5 text-sm" data-testid={`review-${s.id}`}>{t.review}</Link>
                        {s.draft > 0 && (
                          <form action={setCourseStatusAction}>
                            <input type="hidden" name="courseId" value={s.id} />
                            <input type="hidden" name="from" value="draft" />
                            <input type="hidden" name="to" value="published" />
                            <button className="btn-primary px-3 py-1.5 text-sm" data-testid={`publish-all-${s.id}`}>{fmt(t.publishAll, { n: s.draft })}</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
