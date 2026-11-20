import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { TextList } from "@/components/practice/TextPages";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export default async function Page({ params }: PageProps<"/[lang]/learn/reading">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page max-w-4xl py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <TextList lang={lang} dict={dict} kind="reading" />
        </Suspense>
      </main>
    </>
  );
}
