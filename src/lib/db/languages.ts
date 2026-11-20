/** Seed data for the 12 launch languages. Speech capability flags stay false
 *  until a speech provider is configured and verified for that locale (Phase 4). */
export const LAUNCH_LANGUAGES = [
  { code: "en", nameEn: "English", nameAr: "الإنجليزية", nativeName: "English", glyph: "A", script: "latin", direction: "ltr", sttLocale: "en-US" },
  { code: "de", nameEn: "German", nameAr: "الألمانية", nativeName: "Deutsch", glyph: "Ä", script: "latin", direction: "ltr", sttLocale: "de-DE" },
  { code: "fr", nameEn: "French", nameAr: "الفرنسية", nativeName: "Français", glyph: "É", script: "latin", direction: "ltr", sttLocale: "fr-FR" },
  { code: "es", nameEn: "Spanish", nameAr: "الإسبانية", nativeName: "Español", glyph: "Ñ", script: "latin", direction: "ltr", sttLocale: "es-ES" },
  { code: "it", nameEn: "Italian", nameAr: "الإيطالية", nativeName: "Italiano", glyph: "È", script: "latin", direction: "ltr", sttLocale: "it-IT" },
  { code: "pt", nameEn: "Portuguese", nameAr: "البرتغالية", nativeName: "Português", glyph: "Ç", script: "latin", direction: "ltr", sttLocale: "pt-BR" },
  { code: "tr", nameEn: "Turkish", nameAr: "التركية", nativeName: "Türkçe", glyph: "Ş", script: "latin", direction: "ltr", sttLocale: "tr-TR" },
  { code: "ru", nameEn: "Russian", nameAr: "الروسية", nativeName: "Русский", glyph: "Ж", script: "cyrillic", direction: "ltr", sttLocale: "ru-RU" },
  { code: "zh", nameEn: "Chinese", nameAr: "الصينية", nativeName: "中文", glyph: "中", script: "han", direction: "ltr", sttLocale: "zh-CN" },
  { code: "ja", nameEn: "Japanese", nameAr: "اليابانية", nativeName: "日本語", glyph: "あ", script: "kana", direction: "ltr", sttLocale: "ja-JP" },
  { code: "ko", nameEn: "Korean", nameAr: "الكورية", nativeName: "한국어", glyph: "한", script: "hangul", direction: "ltr", sttLocale: "ko-KR" },
  { code: "ar", nameEn: "Arabic", nameAr: "العربية", nativeName: "العربية", glyph: "ع", script: "arabic", direction: "rtl", sttLocale: "ar-EG" },
] as const;
