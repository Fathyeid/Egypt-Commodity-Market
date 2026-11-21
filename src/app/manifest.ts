import type { MetadataRoute } from "next";

/** Makes Lisan installable as an app (Android, desktop Chrome/Edge, iOS "Add to Home Screen"). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "لسان · Lisan",
    short_name: "لسان",
    description: "تعلّم 12 لغة بمنهج مبني على CEFR ومدرس ذكي. Learn 12 languages with a CEFR curriculum and an AI tutor.",
    lang: "ar",
    dir: "rtl",
    start_url: "/ar/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f7fc",
    theme_color: "#1d5fd6",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "الدروس", url: "/ar/learn", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "المدرس", url: "/ar/tutor", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
