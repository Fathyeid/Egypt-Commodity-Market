"use client";

import { useState, useTransition } from "react";
import { startConversationAction } from "@/lib/actions";

export function StartConversationButton({ lang, kind, id, label, disabled, errors }: { lang: string; kind: "tutor" | "roleplay"; id: string; label: string; disabled?: boolean; errors: Record<string, string> }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="mt-3">
      <button
        type="button"
        className="btn-primary px-4 py-2 text-sm"
        disabled={disabled || pending}
        data-testid={`start-${kind}-${id}`}
        onClick={() =>
          start(async () => {
            const r = await startConversationAction(lang, kind, id);
            if (r && !r.ok) setError(errors[r.error] ?? errors.generic);
          })
        }
      >
        {label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
