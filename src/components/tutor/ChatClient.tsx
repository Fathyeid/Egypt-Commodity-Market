"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Mic, MicOff, Send, Sparkles } from "lucide-react";
import { finishRoleplayAction, sendMessageAction } from "@/lib/actions";
import type { Correction } from "@/lib/ai/schemas";
import type { Dictionary } from "@/lib/i18n/ar";
import { SpeakButton } from "@/components/learn/SpeakButton";
import { Bidi } from "@/components/ui/Bidi";

export type ChatMsg = { id: string; role: "user" | "assistant"; content: string; corrections?: Correction[] | null; newWords?: { term: string; meaning: string }[] | null };

type Props = { lang: "ar" | "en"; language: string; conversationId: string; kind: "tutor" | "roleplay"; initial: ChatMsg[]; t: Dictionary["ai"]; noVoice: string; disabled: boolean };

const BCP47: Record<string, string> = { en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT", pt: "pt-BR", tr: "tr-TR", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ar: "ar-SA" };

type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type RecognitionCtor = new () => Recognition;

export function ChatClient({ lang, language, conversationId, kind, initial, t, noVoice, disabled }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [finishing, startFinish] = useTransition();
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState<boolean | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const errText = (code: string) => (t.errorsMap as Record<string, string>)[code] ?? t.errorsMap.generic;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    const timer = setTimeout(() => setMicSupported(!!Ctor), 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = BCP47[language] ?? language;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => setText(Array.from(e.results).map((r) => r[0].transcript).join(" "));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const send = () => {
    const body = text.trim();
    if (!body || pending) return;
    setError(null);
    const tempId = `tmp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: "user", content: body }]);
    setText("");
    start(async () => {
      const r = await sendMessageAction(lang, conversationId, body);
      if (!r.ok) {
        setMessages((m) => m.filter((x) => x.id !== tempId));
        setText(body);
        setError(errText(r.error));
        return;
      }
      setMessages((m) => [
        ...m.filter((x) => x.id !== tempId),
        { id: r.userMessage.id, role: "user", content: r.userMessage.content, corrections: r.userMessage.corrections },
        { id: r.assistantMessage.id, role: "assistant", content: r.assistantMessage.content, newWords: r.assistantMessage.newWords },
      ]);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card min-h-[50vh] space-y-4 p-4 sm:p-6" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
            <div
              dir="auto"
              lang={language}
              data-testid={`msg-${m.role}`}
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-brand text-brand-ink" : "bg-surface-2"}`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && (
              <div className="mt-1">
                <SpeakButton text={m.content} language={language} label={t.listen} noVoiceLabel={noVoice} size="sm" />
              </div>
            )}
            {m.role === "user" && kind === "tutor" && m.corrections?.map((c, i) => (
              <div key={i} data-testid="correction" className="mt-1.5 max-w-[88%] rounded-xl border-s-4 border-accent bg-accent-soft px-3 py-2 text-sm">
                <p className="text-xs font-semibold text-muted">{t.correction}</p>
                <p dir="auto" lang={language}>
                  <s className="text-danger">{c.original}</s> → <b className="text-ok">{c.corrected}</b>
                </p>
                <p dir="auto" className="mt-0.5"><Bidi text={c.explanation} /></p>
              </div>
            ))}
            {m.role === "assistant" && m.newWords && m.newWords.length > 0 && (
              <div className="mt-1.5 max-w-[88%] rounded-xl bg-brand-soft px-3 py-2 text-sm">
                <p className="text-xs font-semibold text-brand">{t.newWords}</p>
                <ul>
                  {m.newWords.map((w) => (
                    <li key={w.term}>
                      <b dir="auto" lang={language}>{w.term}</b>: <span dir="auto"><Bidi text={w.meaning} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles className="size-4 animate-pulse text-brand" aria-hidden />
            {t.thinking}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}

      {!disabled && (
        <form
          className="card flex items-end gap-2 p-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            dir="auto"
            lang={language}
            rows={1}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="max-h-40 min-h-11 flex-1 resize-none rounded-xl bg-transparent px-3 py-2.5 focus:outline-none"
          />
          {micSupported && (
            <button type="button" onClick={toggleMic} aria-pressed={listening} title={listening ? t.micStop : t.mic} aria-label={listening ? t.micStop : t.mic} className={`grid size-11 shrink-0 place-items-center rounded-xl border border-line ${listening ? "bg-danger-soft text-danger" : "bg-surface"}`}>
              {listening ? <MicOff className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
            </button>
          )}
          <button type="submit" className="btn-primary size-11 shrink-0 p-0" disabled={!text.trim() || pending} aria-label={t.send} title={t.send}>
            <Send className="size-5 rtl:-scale-x-100" aria-hidden />
          </button>
        </form>
      )}
      {!disabled && <p className="text-xs text-faint">{micSupported === false ? t.micUnsupported : t.micNote}</p>}

      {kind === "roleplay" && !disabled && messages.some((m) => m.role === "user") && (
        <button
          type="button"
          className="btn-ghost self-center"
          disabled={finishing || pending}
          onClick={() =>
            startFinish(async () => {
              const r = await finishRoleplayAction(lang, conversationId);
              if (!r.ok) setError(errText(r.error));
              else router.refresh();
            })
          }
        >
          {finishing ? t.finishing : t.finish}
        </button>
      )}
    </div>
  );
}
