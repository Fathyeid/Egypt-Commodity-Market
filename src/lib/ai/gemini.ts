import "server-only";
import { z } from "zod";
import type { AIResult, ChatMessage } from "./provider";

/**
 * Google Gemini through the Generative Language API (Google AI Studio key).
 * The free tier costs nothing, so usage is recorded with cost 0; the daily
 * per-user message limit still applies. Server-side only: the key never reaches the browser.
 */
const ENDPOINT = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  modelVersion?: string;
};

/** JSON Schema for Gemini's structured output (drops keys it doesn't accept). */
export function toGeminiSchema(schema: z.ZodType): unknown {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12", unrepresentable: "any" }) as Record<string, unknown>;
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip);
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === "$schema" || k === "additionalProperties") continue;
        out[k] = strip(v);
      }
      return out;
    }
    return node;
  };
  return strip(json);
}

/** Key as pasted into the hosting dashboard: trims spaces, new lines and stray quotes. */
export const geminiKey = (raw = process.env.GEMINI_API_KEY ?? "") => raw.trim().replace(/^["']+|["']+$/g, "").trim();

/** Models to try in order: the configured one, then widely available fallbacks. */
export function geminiModels(configured = process.env.GEMINI_MODEL): string[] {
  return [...new Set([configured?.trim(), "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"].filter((m): m is string => !!m))];
}

type Attempt = { model: string; strictSchema: boolean };
type Outcome<T> = AIResult<T> | { retry: "model" | "schema" };

async function callOnce<S extends z.ZodType>(
  opts: { system: string; messages: ChatMessage[]; schema: S; maxTokens?: number },
  { model, strictSchema }: Attempt,
): Promise<Outcome<z.infer<S>>> {
  const jsonSchema = toGeminiSchema(opts.schema);
  const system = strictSchema
    ? opts.system
    : `${opts.system}\n\nReply with a single JSON object only, matching this JSON Schema exactly:\n${JSON.stringify(jsonSchema)}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: opts.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: {
      responseMimeType: "application/json",
      ...(strictSchema ? { responseJsonSchema: jsonSchema } : {}),
      maxOutputTokens: opts.maxTokens ?? 4000,
      temperature: 0.7,
    },
  };
  const res = await fetch(ENDPOINT(model), {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": geminiKey() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 600);
    // Google answers a bad key with 400 API_KEY_INVALID (not 401), and a missing permission with 403.
    if (res.status === 401 || res.status === 403 || /API_KEY_INVALID|API key not valid|PERMISSION_DENIED/i.test(text)) {
      console.error(`Gemini key rejected (${res.status}):`, text);
      return { ok: false, error: "not_configured" };
    }
    if (res.status === 404) {
      console.error(`Gemini model unavailable: ${model}`);
      return { retry: "model" };
    }
    if (res.status === 429 || res.status >= 500) {
      console.error(`Gemini busy (${res.status}) on ${model}:`, text.slice(0, 200));
      return { ok: false, error: "busy" };
    }
    console.error(`Gemini API error ${res.status} on ${model}:`, text);
    // A schema the model doesn't accept: try again with the schema in the instructions instead.
    return strictSchema ? { retry: "schema" } : { ok: false, error: "failed" };
  }
  const data = (await res.json()) as GeminiResponse;
  if (data.promptFeedback?.blockReason) return { ok: false, error: "refused" };
  const cand = data.candidates?.[0];
  if (cand?.finishReason && ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION"].includes(cand.finishReason)) {
    return { ok: false, error: "refused" };
  }
  const text = (cand?.content?.parts?.map((p) => p.text ?? "").join("") ?? "").trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    console.error(`Gemini returned non-JSON output on ${model}:`, text.slice(0, 200));
    return { ok: false, error: "failed" };
  }
  const parsed = opts.schema.safeParse(raw);
  if (!parsed.success) {
    console.error(`Gemini output failed validation on ${model}:`, parsed.error.message.slice(0, 300));
    return { ok: false, error: "failed" };
  }
  const u = data.usageMetadata ?? {};
  return {
    ok: true,
    data: parsed.data as z.infer<S>,
    model: data.modelVersion || model,
    inputTokens: u.promptTokenCount ?? 0,
    outputTokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0),
    costMicros: 0, // free tier
  };
}

export async function generateGemini<S extends z.ZodType>(opts: {
  system: string;
  messages: ChatMessage[];
  schema: S;
  maxTokens?: number;
}): Promise<AIResult<z.infer<S>>> {
  if (!geminiKey()) return { ok: false, error: "not_configured" };
  for (const model of geminiModels()) {
    for (const strictSchema of [true, false]) {
      try {
        const out = await callOnce(opts, { model, strictSchema });
        if (!("retry" in out)) return out;
        if (out.retry === "model") break; // next model
      } catch (e) {
        if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) return { ok: false, error: "busy" };
        console.error("Gemini error:", e);
        return { ok: false, error: "failed" };
      }
    }
  }
  return { ok: false, error: "failed" };
}
