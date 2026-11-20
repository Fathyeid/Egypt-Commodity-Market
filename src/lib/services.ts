import "server-only";
import { aiStatus } from "./ai/provider";

/**
 * Single source of truth for which external integrations are configured.
 * UI reads this to show an honest "not configured" state instead of pretending.
 */
export type ServiceKey = "database" | "google" | "email" | "ai" | "speech" | "payments";

export function serviceStatus(): Record<ServiceKey, boolean> {
  const has = (...keys: string[]) => keys.every((k) => !!process.env[k]);
  return {
    database: has("DATABASE_URL"),
    google: has("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
    email: has("RESEND_API_KEY", "EMAIL_FROM"),
    ai: aiStatus() === "live", // live only once the owner sets ANTHROPIC_API_KEY
    speech: false, // Phase 4 — awaiting owner approval
    payments: false, // Phase 6 — awaiting owner approval
  };
}
