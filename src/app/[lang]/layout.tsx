import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { dirOf, isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  // Plex Sans Arabic also covers Latin, so one family serves both locales.
  weight: ["400", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.brand}` },
    description: dict.meta.description,
    metadataBase: new URL(siteUrl() ?? "http://localhost:3000"),
    applicationName: dict.brand,
    appleWebApp: { capable: true, title: dict.brand, statusBarStyle: "default" },
    alternates: { canonical: `/${lang}`, languages: { ar: "/ar", en: "/en", "x-default": "/ar" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#1d5fd6",
  width: "device-width",
  initialScale: 1,
};

// Applies a saved dark-mode choice before first paint. Light is the default.
const themeScript = `try{if(localStorage.getItem("lisan-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

// Self-heal after a deploy: Vercel serves only the live deployment's files, so
// a tab still running the previous build (or a phone that dropped a chunk
// request on a flaky network) fails to load a JS chunk and every link goes
// dead. Reload once (60s guard against loops) to pick up the current build.
const chunkReloadScript = `(function(){function c(m){return/ChunkLoadError|Loading chunk [\\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(String(m||""))}function r(){try{var t=+sessionStorage.getItem("lisan-cle-reload")||0;if(Date.now()-t<6e4)return;sessionStorage.setItem("lisan-cle-reload",String(Date.now()))}catch(e){}location.reload()}window.addEventListener("error",function(e){var m=e&&(e.message||(e.error&&e.error.message));if(c(m))r()},true);window.addEventListener("unhandledrejection",function(e){var j=e&&e.reason;if(c(j&&(j.message||j)))r()})})();`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)} data-theme="light" className={plexArabic.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: chunkReloadScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
