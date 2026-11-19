"use client";

import { Volume2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const BCP47: Record<string, string> = { en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT", pt: "pt-BR", tr: "tr-TR", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ar: "ar-SA" };

/* Browser voices as an external store (speechSynthesis loads voices asynchronously). */
let voicesCache: SpeechSynthesisVoice[] | null = null;
const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;
function readVoices() {
  if (voicesCache === null && supported()) {
    const v = window.speechSynthesis.getVoices();
    if (v.length) voicesCache = v;
  }
  return voicesCache;
}
function subscribeVoices(cb: () => void) {
  if (!supported()) return () => {};
  const onChange = () => {
    voicesCache = window.speechSynthesis.getVoices();
    cb();
  };
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

/** Uses the browser's built-in speech synthesis (free, on-device). Shows an honest note if no voice exists. */
function useVoice(language: string) {
  const voices = useSyncExternalStore(subscribeVoices, readVoices, () => null);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(timer);
  }, []);
  const tag = BCP47[language] ?? language;
  const voice = voices?.find((v) => v.lang === tag) ?? voices?.find((v) => v.lang.toLowerCase().startsWith(language)) ?? null;
  return { ready: voices !== null || timedOut, voice };
}

export function SpeakButton({ text, language, label, noVoiceLabel, size = "md" }: { text: string; language: string; label: string; noVoiceLabel: string; size?: "sm" | "md" }) {
  const { ready, voice } = useVoice(language);
  const [speaking, setSpeaking] = useState(false);
  const unavailable = ready && !voice;
  const speak = () => {
    if (!voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={speak}
        disabled={!voice}
        aria-label={`${label}: ${text}`}
        title={unavailable ? noVoiceLabel : label}
        className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface font-semibold text-brand transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50 ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${speaking ? "bg-brand-soft" : ""}`}
      >
        <Volume2 className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
        {label}
      </button>
      {unavailable && size === "md" && <span className="text-xs text-faint">{noVoiceLabel}</span>}
    </span>
  );
}
