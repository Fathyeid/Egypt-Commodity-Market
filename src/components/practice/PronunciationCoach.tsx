"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/ar";
import type { PronResult } from "@/lib/speech/azure";
import { downsample, encodeWav } from "@/lib/speech/wav";
import { fmt } from "@/lib/i18n/format";
import { SpeakButton } from "@/components/learn/SpeakButton";
import { scoreTranscript } from "@/lib/speech/browser-score";

const BCP47: Record<string, string> = {
  en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT", pt: "pt-BR", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", ru: "ru-RU", tr: "tr-TR", ar: "ar-EG",
};
type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type RecognitionCtor = new () => Recognition;
const recognitionCtor = (): RecognitionCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const MAX_SECONDS = 15;
/** server: Azure (or the test double) scores recorded audio. browser: free check with the built-in speech recognizer. */
type Props = { language: string; sentences: { level: string; text: string }[]; t: Dictionary["practice"]; listenLabel: string; noVoice: string; mode: "server" | "browser" };

export function PronunciationCoach({ language, sentences, t, listenLabel, noVoice, mode }: Props) {
  const [text, setText] = useState(sentences[0]?.text ?? "");
  const [state, setState] = useState<"idle" | "recording" | "analyzing">("idle");
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<(PronResult & { provider: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openWord, setOpenWord] = useState<number | null>(null);
  const recognizer = useRef<Recognition | null>(null);
  const rec = useRef<{ ctx: AudioContext; stream: MediaStream; node: ScriptProcessorNode; chunks: Float32Array[]; timer: ReturnType<typeof setInterval> } | null>(null);
  const errText = (code: string) => (t.errorsMap as Record<string, string>)[code] ?? t.errorsMap.generic;

  useEffect(() => () => stopTracks(), []);

  function stopTracks() {
    const r = rec.current;
    if (!r) return;
    clearInterval(r.timer);
    r.node.disconnect();
    r.stream.getTracks().forEach((tr) => tr.stop());
    void r.ctx.close();
    rec.current = null;
  }

  async function save(body: unknown) {
    try {
      await fetch("/api/pronunciation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    } catch {
      /* history is best-effort; the learner already sees the result */
    }
  }

  function startBrowser() {
    const Ctor = recognitionCtor();
    if (!Ctor) return setError(t.micUnsupported);
    const r = new Ctor();
    r.lang = BCP47[language] ?? language;
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 5;
    const heard: string[] = [];
    let failed: string | null = null;
    const started = Date.now();
    r.onresult = (e) => {
      for (const res of Array.from(e.results)) for (const alt of Array.from(res)) if (alt.transcript.trim()) heard.push(alt.transcript.trim());
    };
    r.onerror = (e) => {
      failed = e.error === "not-allowed" || e.error === "service-not-allowed" ? t.micDenied : e.error === "no-speech" ? errText("no_speech") : null;
    };
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250);
    r.onend = () => {
      clearInterval(timer);
      recognizer.current = null;
      setState("idle");
      if (failed) return setError(failed);
      if (!heard.length) return setError(errText("no_speech"));
      const scored = scoreTranscript(text, heard, language);
      setResult({ ...scored, provider: "browser" });
      void save({ mode: "browser", text, seconds: Math.min(Math.round((Date.now() - started) / 1000), 30), result: scored });
    };
    recognizer.current = r;
    setSeconds(0);
    setState("recording");
    try {
      r.start();
    } catch {
      clearInterval(timer);
      recognizer.current = null;
      setState("idle");
      setError(t.micUnsupported);
    }
  }

  async function start() {
    setError(null);
    setResult(null);
    if (mode === "browser") return startBrowser();
    if (!navigator.mediaDevices?.getUserMedia) return setError(t.micUnsupported);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    } catch {
      return setError(t.micDenied);
    }
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);
    const chunks: Float32Array[] = [];
    node.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    source.connect(node);
    node.connect(ctx.destination);
    const started = Date.now();
    const timer = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) void stopAndSend();
    }, 250);
    rec.current = { ctx, stream, node, chunks, timer };
    setSeconds(0);
    setState("recording");
  }

  async function stopAndSend() {
    if (recognizer.current) {
      setState("analyzing");
      recognizer.current.stop();
      return;
    }
    const r = rec.current;
    if (!r) return;
    const rate = r.ctx.sampleRate;
    const total = r.chunks.reduce((n, c) => n + c.length, 0);
    const all = new Float32Array(total);
    let off = 0;
    for (const c of r.chunks) {
      all.set(c, off);
      off += c.length;
    }
    stopTracks();
    setState("analyzing");
    const wav = encodeWav(downsample(all, rate));
    const form = new FormData();
    form.append("audio", new Blob([wav], { type: "audio/wav" }), "speech.wav");
    form.append("text", text);
    try {
      const res = await fetch("/api/pronunciation", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) setError(errText(json.error));
      else setResult(json);
    } catch {
      setError(errText("failed"));
    }
    setState("idle");
  }

  const color = (a: number | null) => (a === null ? "bg-surface-2" : a >= 80 ? "bg-brand-soft text-brand" : a >= 60 ? "bg-accent-soft" : "bg-danger-soft text-danger");
  const scoreKeys = ["pronunciation", "accuracy", "fluency", "completeness", "prosody"] as const;

  return (
    <div className="space-y-5">
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">{t.pickSentence}</h2>
        <div className="flex flex-wrap gap-2">
          {sentences.map((s) => (
            <button key={s.text} type="button" dir="auto" lang={language} onClick={() => { setText(s.text); setResult(null); }} aria-pressed={text === s.text}
              className={`rounded-full border px-3 py-1.5 text-sm ${text === s.text ? "border-brand bg-brand-soft" : "border-line bg-surface hover:bg-surface-2"}`}>
              <span className="me-1 text-xs text-faint">{s.level}</span>{s.text}
            </button>
          ))}
        </div>
        <label className="label" htmlFor="own">{t.ownSentence}</label>
        <input id="own" dir="auto" lang={language} className="input" maxLength={200} value={text} onChange={(e) => { setText(e.target.value); setResult(null); }} />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <SpeakButton text={text} language={language} label={t.listenModel} noVoiceLabel={noVoice} />
          {state === "recording" ? (
            <button type="button" className="btn-primary bg-danger hover:bg-danger" onClick={() => void stopAndSend()}>
              <Square className="size-4" aria-hidden />
              {t.stopRec} · {fmt(t.recording, { s: seconds })}
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled={!text.trim() || state === "analyzing"} onClick={() => void start()} data-testid="record">
              <Mic className="size-4" aria-hidden />
              {state === "analyzing" ? t.analyzing : t.record}
            </button>
          )}
        </div>
        <p className="text-xs text-faint">{listenLabel && t.limits}</p>
      </section>

      {error && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">{error}</p>}

      {result && (
        <section className="card space-y-4 p-5" data-testid="pron-result">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {scoreKeys.map((k) => (
              <div key={k} className="rounded-xl bg-surface-2 p-3 text-center">
                <div className="text-xs text-muted">{t.scores[k]}</div>
                <div className="text-2xl font-bold">{result.scores[k] ?? "—"}</div>
                {result.scores[k] === null && <div className="text-[10px] text-faint">{t.notMeasured}</div>}
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-2 font-semibold">{t.wordsHeading}</h3>
            <div dir="auto" lang={language} className="flex flex-wrap gap-2">
              {result.words.map((w, i) => (
                <button key={i} type="button" onClick={() => setOpenWord(openWord === i ? null : i)} className={`rounded-lg px-2.5 py-1 font-semibold ${color(w.accuracy)}`} title={(t.errorTypes as Record<string, string>)[w.errorType] ?? w.errorType}>
                  {w.word} <span className="text-xs font-normal opacity-80">{w.accuracy ?? "—"}</span>
                </button>
              ))}
            </div>
            {openWord !== null && result.words[openWord] && (
              <div className="mt-3 rounded-xl border border-line p-3 text-sm">
                <p className="mb-1 font-semibold">
                  <span dir="auto" lang={language}>{result.words[openWord].word}</span> · {(t.errorTypes as Record<string, string>)[result.words[openWord].errorType] ?? result.words[openWord].errorType}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.words[openWord].phonemes.map((p, j) => (
                    <span key={j} className={`rounded px-1.5 py-0.5 font-mono text-xs ${color(p.accuracy)}`}>/{p.phoneme}/ {p.accuracy ?? ""}</span>
                  ))}
                </div>
                <div className="mt-2"><SpeakButton text={result.words[openWord].word} language={language} label={t.listenModel} noVoiceLabel={noVoice} size="sm" /></div>
              </div>
            )}
          </div>
          <p className="text-xs text-faint">{t.recognized}: <span dir="auto" lang={language}>{result.recognized}</span></p>
        </section>
      )}
    </div>
  );
}
