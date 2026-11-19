"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveTrackAction } from "@/lib/actions";

type T = { id: string; name: string; glyph: string; code: string; isActive: boolean };

export function TrackSwitcher({ tracks, activeLabel }: { tracks: T[]; activeLabel: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <ul className="flex flex-wrap gap-2" aria-busy={pending}>
      {tracks.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            disabled={pending || t.isActive}
            aria-pressed={t.isActive}
            onClick={() =>
              start(async () => {
                await setActiveTrackAction(t.id);
                router.refresh();
              })
            }
            className={`flex items-center gap-2 rounded-full border py-1 ps-1 pe-3.5 text-sm transition-colors disabled:cursor-default ${t.isActive ? "border-brand bg-brand-soft font-semibold" : "border-line bg-surface hover:bg-surface-2"}`}
          >
            <span lang={t.code} className="grid size-7 place-items-center rounded-full bg-surface text-xs font-semibold" aria-hidden>
              {t.glyph}
            </span>
            {t.name}
            {t.isActive && <span className="sr-only">({activeLabel})</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
