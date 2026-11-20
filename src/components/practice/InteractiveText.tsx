"use client";

import { useState, useTransition } from "react";
import { BookmarkPlus, Check, Eye, EyeOff, Play, Square, X } from "lucide-react";
import type { PublicTextItem } from "@/content";
import type { Dictionary } from "@/lib/i18n/ar";
import { saveWordAction } from "@/lib/actions";
import { SpeakButton, speakLines } from "@/components/learn/SpeakButton";
import { Bidi } from "@/components/ui/Bidi";
import { tokenize } from "./tokenize";

type Props = { item: PublicTextItem; lang: "ar" | "en"; t: Dictionary["practice"]; listenLabel: string; noVoice: string };

export function InteractiveText({ item, lang, t, listenLabel, noVoice }: Props) {
  const listening = item.kind === "listening";
  const [showText, setShowText] = useState(!listening);
  const [playing, setPlaying] = useState(false);
  const [noVoiceHit, setNoVoiceHit] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const keys = Object.keys(item.glossary);
  const spoken = item.lines.map((l) => (item.genre === "dialogue" || item.genre === "interview" ? l.replace(/^[^:]{1,30}:\s*/, "") : l));

  const play = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const ok = speakLines(spoken, item.language, () => setPlaying(false));
    setNoVoiceHit(!ok);
    setPlaying(ok);
  };

  const meaning = selected ? item.glossary[selected] : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={play} data-testid="play-all">
          {playing ? <Square className="size-4" aria-hidden /> : <Play className="size-4 rtl:-scale-x-100" aria-hidden />}
          {playing ? t.stop : t.playAll}
        </button>
        {listening && (
          <button type="button" className="btn-ghost" onClick={() => setShowText((v) => !v)} aria-pressed={showText}>
            {showText ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            {showText ? t.hideTranscript : t.showTranscript}
          </button>
        )}
      </div>
      <p className="text-xs text-faint">{noVoiceHit ? noVoice : t.audioNote}</p>

      {showText && (
        <>
          <p className="text-sm text-muted">{t.tapHint}</p>
          <div dir="auto" lang={item.language} className="card space-y-3 p-5 text-lg leading-loose" data-testid="interactive-text">
            {item.lines.map((line, i) => {
              const m = /^([^:]{1,30}):\s*(.*)$/.exec(line);
              const isDialogue = (item.genre === "dialogue" || item.genre === "interview") && m;
              const body = isDialogue ? m[2] : line;
              return (
                <p key={i}>
                  {isDialogue && <b className="me-2 text-brand">{m[1]}:</b>}
                  {tokenize(body, keys).map((tok, j) =>
                    tok.key ? (
                      <button
                        key={j}
                        type="button"
                        onClick={() => setSelected(tok.key)}
                        className={`rounded transition-colors hover:bg-brand-soft ${item.glossary[tok.key] ? "underline decoration-brand/40 decoration-dotted underline-offset-4" : ""} ${selected === tok.key ? "bg-brand-soft" : ""}`}
                      >
                        {tok.text}
                      </button>
                    ) : (
                      <span key={j}>{tok.text}</span>
                    ),
                  )}
                </p>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <div role="dialog" aria-label={selected} className="card fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md p-4 shadow-card sm:bottom-8" data-testid="word-popover">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p dir="auto" lang={item.language} className="text-xl font-bold">{selected}</p>
              <p className="mt-1 text-muted">{meaning ? <Bidi text={meaning[lang]} /> : t.notInGlossary}</p>
            </div>
            <button type="button" onClick={() => setSelected(null)} aria-label="✕" className="grid size-8 place-items-center rounded-full hover:bg-surface-2">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SpeakButton text={selected} language={item.language} label={listenLabel} noVoiceLabel={noVoice} size="sm" />
            <button
              type="button"
              className="btn-ghost px-3 py-1.5 text-sm"
              disabled={pending || savedSet.has(selected)}
              onClick={() =>
                start(async () => {
                  const r = await saveWordAction({ language: item.language, term: selected, meaning: meaning ? meaning[lang] : null, source: item.id });
                  if (r.ok) setSavedSet((s) => new Set(s).add(selected));
                })
              }
            >
              {savedSet.has(selected) ? <Check className="size-4 text-ok" aria-hidden /> : <BookmarkPlus className="size-4" aria-hidden />}
              {savedSet.has(selected) ? t.saved : t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
