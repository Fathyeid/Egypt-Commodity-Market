import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioLines, BookOpenCheck, ChartLine, Headphones, Layers, MessagesSquare, PenLine, Users } from "lucide-react";
import { Header } from "@/components/site/Header";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import { LAUNCH_LANGUAGES } from "@/lib/db/languages";

const FEATURE_ICONS = {
  tutor: MessagesSquare,
  speech: AudioLines,
  placement: BookOpenCheck,
  vocab: Layers,
  listening: Headphones,
  writing: PenLine,
  reports: ChartLine,
  community: Users,
} as const;

export default async function Landing({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.landing;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page pb-24">
        <section className="grid items-center gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div>
            <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">{t.eyebrow}</span>
            <h1 className="mt-4 text-4xl leading-tight font-bold tracking-tight text-balance md:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">{t.lead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${lang}/sign-up`} className="btn-primary px-6 py-3">
                {t.ctaStart}
              </Link>
              <Link href={`/${lang}/sign-in`} className="btn-ghost px-6 py-3">
                {t.ctaSignIn}
              </Link>
            </div>
          </div>

          <figure className="card p-5 shadow-card" aria-label={t.previewLabel}>
            <figcaption className="mb-3 flex items-center gap-3 border-b border-line pb-3">
              <span className="size-9 rounded-full bg-gradient-to-br from-brand to-accent" aria-hidden />
              <div>
                <div className="font-semibold">{t.previewTutor}</div>
                <span className="chip">{t.previewLabel}</span>
              </div>
            </figcaption>
            <div dir="ltr" lang="de" className="space-y-2 text-[0.95rem]">
              <p className="max-w-[88%] rounded-2xl bg-surface-2 px-4 py-2.5">Wie war dein Wochenende?</p>
              <p className="ms-auto max-w-[88%] rounded-2xl bg-brand px-4 py-2.5 text-brand-ink">Ich habe ins Kino gegangen.</p>
            </div>
            <div className="mt-2 rounded-xl border-s-4 border-accent bg-accent-soft px-3 py-2 text-sm">
              <p dir="ltr" lang="de">
                <s className="text-danger">habe … gegangen</s> → <b className="text-ok">bin … gegangen</b>
              </p>
              <p className="mt-1">{t.previewFix}</p>
            </div>
          </figure>
        </section>

        <section className="py-10">
          <h2 className="text-2xl font-bold">{t.featuresTitle}</h2>
          <p className="mt-1 mb-6 text-muted">{t.featuresSub}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(FEATURE_ICONS) as (keyof typeof FEATURE_ICONS)[]).map((k) => {
              const Icon = FEATURE_ICONS[k];
              const [title, body] = t.features[k];
              return (
                <article key={k} className="card p-5 transition-shadow hover:shadow-card">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 mb-1 font-semibold">{title}</h3>
                  <p className="text-sm text-muted">{body}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-faint">{t.statusNote}</p>
        </section>

        <section className="py-10">
          <h2 className="text-2xl font-bold">{t.languagesTitle}</h2>
          <p className="mt-1 mb-6 text-muted">{t.languagesSub}</p>
          <ul className="flex flex-wrap gap-2.5">
            {LAUNCH_LANGUAGES.map((l) => (
              <li key={l.code} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 ps-1.5 pe-4">
                <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-sm font-semibold" lang={l.code} aria-hidden>
                  {l.glyph}
                </span>
                <span>{lang === "ar" ? l.nameAr : l.nameEn}</span>
                <span className="text-sm text-faint" lang={l.code}>
                  {l.nativeName}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="border-t border-line py-8 text-sm text-faint">
        <div className="container-page">{fmt(t.footer, { year: 2026 })}</div>
      </footer>
    </>
  );
}
