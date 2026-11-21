import "server-only";
import { z } from "zod";
import type { AIResult, ChatMessage } from "./provider";

/**
 * Google Gemini through the Generative Language API (Google AI Studio key).
 * The free tier costs nothing, so usage is recorded with cost 0; the daily
 * per-user message limit still applies. Server-side only: the key never reaches the browser.
 */
const MODEL = () => process.env.GEMINI_MODEL || "gemini-flash-latest";
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

export async function generateGemini<S extends z.ZodType>(opts: {
  system: string;
  messages: ChatMessage[];
  schema: S;
  maxTokens?: number;
}): Promise<AIResult<z.infer<S>>> {
  const model = MODEL();
  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: opts.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: toGeminiSchema(opts.schema),
      maxOutputTokens: opts.maxTokens ?? 4000,
      temperature: 0.7,
    },
  };
  try {
    const res = await fetch(ENDPOINT(model), {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });
    if (res.status === 401 || res.status === 403) {
      console.error("Gemini auth error:", res.status, (await res.text()).slice(0, 300));
      return { ok: false, error: "not_configured" };
    }
    if (res.status === 429 || res.status >= 500) return { ok: false, error: "busy" };
    if (!res.ok) {
      console.error(`Gemini API error ${res.status}:`, (await res.text()).slice(0, 500));
      return { ok: false, error: "failed" };
    }
    const data = (await res.json()) as GeminiResponse;
    if (data.promptFeedback?.blockReason) return { ok: false, error: "refused" };
    const cand = data.candidates?.[0];
    if (cand?.finishReason && ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION"].includes(cand.finishReason)) {
      return { ok: false, error: "refused" };
    }
    const text = cand?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      console.error("Gemini returned non-JSON output:", text.slice(0, 200));
      return { ok: false, error: "failed" };
    }
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      console.error("Gemini output failed validation:", parsed.error.message.slice(0, 300));
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
  } catch (e) {
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) return { ok: false, error: "busy" };
    console.error("Gemini error:", e);
    return { ok: false, error: "failed" };
  }
}
