"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}
const getTheme = () => document.documentElement.dataset.theme ?? "light";

export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("lisan-theme", next);
    } catch {}
  };
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className="grid size-10 place-items-center rounded-full border border-line bg-surface text-text hover:bg-surface-2">
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
