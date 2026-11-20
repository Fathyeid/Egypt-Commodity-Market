"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSavedWordAction } from "@/lib/actions";
import { SpeakButton } from "@/components/learn/SpeakButton";
import { Bidi } from "@/components/ui/Bidi";

export function SavedWords({ words, language, labels }: { words: { id: string; term: string; meaning: string | null }[]; language: string; labels: { remove: string; listen: string; noVoice: string } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <ul className="divide-y divide-line" data-testid="saved-words">
      {words.map((w) => (
        <li key={w.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
          <b dir="auto" lang={language}>{w.term}</b>
          {w.meaning && <span className="text-sm text-muted" dir="auto"><Bidi text={w.meaning} /></span>}
          <span className="ms-auto flex items-center gap-2">
            <SpeakButton text={w.term} language={language} label={labels.listen} noVoiceLabel={labels.noVoice} size="sm" />
            <button type="button" aria-label={labels.remove} title={labels.remove} disabled={pending} className="grid size-8 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
              onClick={() => start(async () => { await deleteSavedWordAction(w.id); router.refresh(); })}>
              <Trash2 className="size-4" aria-hidden />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
