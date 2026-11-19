"use client";

import type { Dictionary } from "@/lib/i18n/ar";

export type AuthDict = Dictionary["auth"];

/** Maps better-auth error codes/status to our localized messages. */
export function authErrorMessage(t: AuthDict, err: { code?: string; status?: number } | null | undefined): string {
  if (!err) return t.errors.generic;
  if (err.status === 429) return t.errors.rate;
  const code = err.code ?? "";
  if (code.includes("INVALID_EMAIL_OR_PASSWORD") || code === "INVALID_PASSWORD" || code === "USER_NOT_FOUND") return t.errors.invalid;
  if (code.startsWith("USER_ALREADY_EXISTS")) return t.errors.exists;
  if (code === "PASSWORD_TOO_SHORT") return t.errors.weak;
  if (code === "INVALID_EMAIL") return t.errors.email;
  return t.errors.generic;
}

/** Only allow same-site redirects inside the current locale. */
export function safeNext(next: string | null, lang: string): string | null {
  if (!next) return null;
  if (!next.startsWith(`/${lang}/`) || next.startsWith("//")) return null;
  return next;
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">
      {message}
    </p>
  );
}

export function GoogleButton({ enabled, label, offLabel, onClick, busy }: { enabled: boolean; label: string; offLabel: string; onClick: () => void; busy: boolean }) {
  return (
    <div>
      <button type="button" className="btn-ghost w-full" disabled={!enabled || busy} onClick={onClick} aria-describedby={enabled ? undefined : "google-off"}>
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.7H2v2.8A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2a11 11 0 0 0 0 9.9L5.7 14z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.8C6.6 7.3 9.1 5.4 12 5.4z" />
        </svg>
        {label}
      </button>
      {!enabled && (
        <p id="google-off" className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-faint">
          <span className="size-1.5 rounded-full bg-faint" aria-hidden />
          {offLabel}
        </p>
      )}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-faint">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
