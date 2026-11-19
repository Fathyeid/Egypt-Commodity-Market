import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./ar";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import("./ar").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
export type { Dictionary };
