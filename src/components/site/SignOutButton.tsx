"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function SignOutButton({ lang, label, compact }: { lang: string; label: string; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.replace(`/${lang}`);
        router.refresh();
      }}
      className={compact ? "grid size-10 place-items-center rounded-full border border-line bg-surface hover:bg-surface-2" : "btn-ghost"}
      aria-label={label}
      title={label}
    >
      <LogOut className="size-[18px] rtl:-scale-x-100" />
      {!compact && <span>{label}</span>}
    </button>
  );
}
