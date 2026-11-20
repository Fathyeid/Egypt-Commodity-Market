import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { costMicros } from "./pricing";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AIResult<T> =
  | { ok: true; data: T; model: string; inputTokens: number; outputTokens: number; costMicros: number }
  | { ok: false; error: "not_configured" | "refused" | "busy" | "failed" };

export type AIStatus = "live" | "test" | "not_configured";

/**
 * Status of the AI integration.
 * - live: ANTHROPIC_API_KEY is set (owner approved and configured it).
 * - test: AI_PROVIDER=fake — scripted replies for automated tests, clearly labelled in the UI.
 * - not_configured: nothing is set; AI features show an honest "not configured" state.
 */
export function aiStatus(): AIStatus {
  if (process.env.AI_PROVIDER === "fake") return "test";
  return process.env.ANTHROPIC_API_KEY ? "live" : "not_configured";
}

const MODEL = () => process.env.AI_MODEL || "claude-opus-5-5";
const EFFORT = () => (process.env.AI_EFFORT as "low" | "medium" | "high" | undefined) || "low";

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

/** One structured-output call. Server-side only; the key never reaches the browser. */
export async function generate<S extends z.ZodType>(opts: {
  system: string;
  messages: ChatMessage[];
  schema: S;
  maxTokens?: number;
  fake: () => z.infer<S>;
}): Promise<AIResult<z.infer<S>>> {
  const status = aiStatus();
  if (status === "not_configured") return { ok: false, error: "not_configured" };
  if (status === "test") return { ok: true, data: opts.fake(), model: "test", inputTokens: 0, outputTokens: 0, costMicros: 0 };

  try {
    const res = await getClient().beta.messages.parse({
      model: MODEL(),
      max_tokens: opts.maxTokens ?? 4000,
      system: opts.system,
      messages: opts.messages,
      // Caches the growing conversation prefix between turns.
      cache_control: { type: "ephemeral" },
      output_config: { format: betaZodOutputFormat(opts.schema), effort: EFFORT() },
      // If the primary model declines, the API retries on a fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    if (res.stop_reason === "refusal") return { ok: false, error: "refused" };
    if (!res.parsed_output) return { ok: false, error: "failed" };
    const u = res.usage;
    return {
      ok: true,
      data: res.parsed_output as z.infer<S>,
      model: res.model,
      inputTokens: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
      outputTokens: u.output_tokens ?? 0,
      costMicros: costMicros(res.model, {
        input: u.input_tokens ?? 0,
        cacheWrite: u.cache_creation_input_tokens ?? 0,
        cacheRead: u.cache_read_input_tokens ?? 0,
        output: u.output_tokens ?? 0,
      }),
    };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
      console.error("AI auth error:", e.message);
      return { ok: false, error: "not_configured" };
    }
    if (e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError) return { ok: false, error: "busy" };
    if (e instanceof Anthropic.APIError) console.error(`AI API error ${e.status}:`, e.message);
    else console.error("AI error:", e);
    return { ok: false, error: "failed" };
  }
}
