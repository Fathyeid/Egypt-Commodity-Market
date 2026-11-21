"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// The browser fires beforeinstallprompt once; keep it outside React so any mount can use it.
let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

type Mode = "none" | "prompt" | "ios";
function getMode(): Mode {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  if (standalone) return "none";
  if (deferred) return "prompt";
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "none";
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** "Install app" button: native prompt on Android/desktop, short instructions on iPhone/iPad. */
export function InstallButton({ label, iosHelp, closeLabel }: { label: string; iosHelp: string; closeLabel: string }) {
  const mode = useSyncExternalStore(subscribe, getMode, () => "none" as Mode);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  if (mode === "none") return null;

  const onClick = async () => {
    if (mode === "ios") return setHelp(true);
    const p = deferred;
    if (!p) return;
    await p.prompt();
    await p.userChoice.catch(() => null);
    deferred = null;
    notify();
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex h-10 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-bold text-brand-ink hover:opacity-90"
        data-testid="install-app"
      >
        <Download className="size-4" aria-hidden />
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">{label}</span>
      </button>
      {help && createPortal(
        <div role="dialog" aria-label={label} className="fixed inset-x-4 top-20 z-50 mx-auto max-w-sm rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="flex items-start gap-3">
            <Share className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <p className="flex-1 text-sm leading-relaxed">{iosHelp}</p>
            <button type="button" onClick={() => setHelp(false)} aria-label={closeLabel} className="grid size-7 place-items-center rounded-full hover:bg-surface-2">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>,
        // Outside <header>: its backdrop-filter would trap position:fixed.
        document.body,
      )}
    </>
  );
}
