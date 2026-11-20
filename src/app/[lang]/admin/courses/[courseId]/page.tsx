import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { db } from "@/lib/db";
import { LESSON_STATUSES, PAGE_SIZE, courseLessons, courseStats, type LessonStatus } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin/gate";
import { setCourseStatusAction } from "@/lib/admin/actions";
import { StatusBadge, StatusButtons } from "@/components/admin/StatusForm";

type Props = PageProps<"/[lang]/admin/courses/[courseId]">;

export default async function AdminCoursePage({ params, searchParams }: Props) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <CourseReview lang={lang} dict={dict} params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function CourseReview({ lang, dict, params, searchParams }: { lang: Locale; dict: Dictionary } & Pick<Props, "params" | "searchParams">) {
  const { courseId } = await params;
  const sp = await searchParams;
  await requireAdmin(lang, `/${lang}/admin/courses/${courseId}`);
  const t = dict.admin;
  const course = (await courseStats(db)).find((c) => c.id === courseId);
  if (!course) notFound();
  const status: LessonStatus | "all" = (LESSON_STATUSES as readonly string[]).includes(String(sp.status)) ? (sp.status as LessonStatus) : "all";
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await courseLessons(db, courseId, status, page);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (s: string, p = 1) => `/${lang}/admin/courses/${courseId}?status=${s}&page=${p}`;
  const filters: [string, string, number][] = [
    ["all", t.all, course.draft + course.published + course.rejected],
    ["draft", t.draft, course.draft],
    ["published", t.published, course.published],
    ["rejected", t.rejected, course.rejected],
  ];
  return (
    <div className="space-y-5">
      <Link href={`/${lang}/admin`} className="text-sm text-brand hover:underline">{t.backToAdmin}</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{course.title[lang]}</h1>
        <div className="flex flex-wrap gap-2">
          {course.draft > 0 && (
            <form action={setCourseStatusAction}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="from" value="draft" />
              <input type="hidden" name="to" value="published" />
              <button className="btn-primary px-3 py-1.5 text-sm">{fmt(t.publishAll, { n: course.draft })}</button>
            </form>
          )}
          {course.published > 0 && (
            <form action={setCourseStatusAction}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="from" value="published" />
              <input type="hidden" name="to" value="draft" />
              <button className="btn-ghost px-3 py-1.5 text-sm">{t.unpublishAll}</button>
            </form>
          )}
        </div>
      </div>
      <nav className="flex flex-wrap gap-2">
        {filters.map(([key, label, n]) => (
          <Link key={key} href={href(key)} aria-current={status === key ? "page" : undefined} className={`rounded-full border px-3 py-1 text-sm ${status === key ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface"}`}>
            {label} ({n})
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="card p-5 text-muted">{t.empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center gap-3 p-3" data-testid={`admin-lesson-${r.id}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/${lang}/admin/lessons/${r.id}`} className="font-semibold hover:underline">{r.title[lang]}</Link>
                  <StatusBadge status={r.status} t={t} />
                </div>
                <p className="text-xs text-muted">
                  {r.unitTitle[lang]} · {t.sources[r.source as keyof typeof t.sources] ?? r.source} · <span dir="ltr">{r.id}</span>
                </p>
              </div>
              <StatusButtons id={r.id} status={r.status} t={t} />
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          {page > 1 ? <Link href={href(status, page - 1)} className="btn-ghost px-3 py-1.5">{t.prev}</Link> : <span />}
          <span className="text-muted">{fmt(t.page, { a: page, b: pages })}</span>
          {page < pages ? <Link href={href(status, page + 1)} className="btn-ghost px-3 py-1.5">{t.next}</Link> : <span />}
        </div>
      )}
    </div>
  );
}
