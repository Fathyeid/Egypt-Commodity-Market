import { Suspense } from "react";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Header } from "@/components/site/Header";
import { TextDetail } from "@/components/practice/TextPages";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export default async function Page({ params }: PageProps<"/[lang]/learn/listening/[id]">) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page py-6 pb-28 sm:py-10">
        <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
          <TextDetail lang={lang} kind="listening" params={params} />
        </Suspense>
      </main>
    </>
  );
}
