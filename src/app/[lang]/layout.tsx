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
    alternates: { canonical: `/${lang}`, languages: { ar: "/ar", en: "/en", "x-default": "/ar" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f7f4",
  width: "device-width",
  initialScale: 1,
};

// Applies a saved dark-mode choice before first paint. Light is the default.
const themeScript = `try{if(localStorage.getItem("lisan-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)} data-theme="light" className={plexArabic.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
