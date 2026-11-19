import { Header } from "@/components/site/Header";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

export function AuthShell({ lang, dict, title, sub, children }: { lang: Locale; dict: Dictionary; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="container-page flex justify-center py-10 sm:py-16">
        <div className="card w-full max-w-md p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          {sub && <p className="mt-1 mb-6 text-muted">{sub}</p>}
          {children}
        </div>
      </main>
    </>
  );
}
