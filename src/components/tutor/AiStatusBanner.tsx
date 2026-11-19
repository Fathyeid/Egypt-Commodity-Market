import { aiStatus } from "@/lib/ai/provider";
import type { Dictionary } from "@/lib/i18n";

export function AiStatusBanner({ t }: { t: Dictionary["ai"] }) {
  const status = aiStatus();
  if (status === "live") return null;
  return (
    <p role="status" data-testid="ai-status" className={`rounded-xl px-4 py-3 text-sm ${status === "test" ? "bg-accent-soft" : "bg-surface-2 text-muted"}`}>
      {status === "test" ? t.testMode : t.notConfigured}
    </p>
  );
}
