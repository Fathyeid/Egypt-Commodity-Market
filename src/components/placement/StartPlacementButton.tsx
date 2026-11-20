"use client";

import { useState, useTransition } from "react";
import { startPlacementAction } from "@/lib/actions";

export function StartPlacementButton({ lang, label, variant = "primary", errorText }: { lang: string; label: string; variant?: "primary" | "ghost"; errorText: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  return (
    <>
      <button
        type="button"
        className={variant === "primary" ? "btn-primary" : "btn-ghost"}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await startPlacementAction(lang);
            if (r && !r.ok) setError(true);
          })
        }
      >
        {label}
      </button>
      {error && <p role="alert" className="w-full text-sm text-danger">{errorText}</p>}
    </>
  );
}
