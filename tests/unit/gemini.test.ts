import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { activeProvider, aiStatus, generate } from "@/lib/ai/provider";
import { toGeminiSchema } from "@/lib/ai/gemini";

const Schema = z.object({ reply: z.string(), items: z.array(z.object({ term: z.string() })) });
const call = () => generate({ system: "sys", messages: [{ role: "user", content: "hi" }, { role: "assistant", content: "yo" }], schema: Schema, fake: () => ({ reply: "fake", items: [] }) });

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async () => new Response(typeof body === "string" ? body : JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("provider selection", () => {
  it("is not configured without keys and live with a Gemini key", () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(aiStatus()).toBe("not_configured");
    vi.stubEnv("GEMINI_API_KEY", "k");
    expect(aiStatus()).toBe("live");
    expect(activeProvider()).toBe("gemini");
  });

  it("AI_PROVIDER picks between two configured keys", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "a");
    vi.stubEnv("GEMINI_API_KEY", "g");
    vi.stubEnv("AI_PROVIDER", "");
    expect(activeProvider()).toBe("anthropic");
    vi.stubEnv("AI_PROVIDER", "gemini");
    expect(activeProvider()).toBe("gemini");
  });
});

describe("Gemini generate", () => {
  const setup = () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "gemini-test");
  };

  it("sends a structured request and parses the JSON answer at no cost", async () => {
    setup();
    const fetchFn = mockFetch(200, {
      candidates: [{ content: { parts: [{ text: JSON.stringify({ reply: "Hallo!", items: [{ term: "Haus" }] }) }] }, finishReason: "STOP" }],
      usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 5 },
      modelVersion: "gemini-test-001",
    });
    const r = await call();
    expect(r).toEqual({ ok: true, data: { reply: "Hallo!", items: [{ term: "Haus" }] }, model: "gemini-test-001", inputTokens: 12, outputTokens: 5, costMicros: 0 });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/models/gemini-test:generateContent");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
    const body = JSON.parse(String(init.body));
    expect(body.contents.map((c: { role: string }) => c.role)).toEqual(["user", "model"]);
    expect(body.systemInstruction.parts[0].text).toBe("sys");
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });

  it("maps errors honestly", async () => {
    setup();
    mockFetch(429, "quota");
    expect(await call()).toEqual({ ok: false, error: "busy" });
    mockFetch(403, "bad key");
    expect(await call()).toEqual({ ok: false, error: "not_configured" });
    mockFetch(200, { promptFeedback: { blockReason: "SAFETY" } });
    expect(await call()).toEqual({ ok: false, error: "refused" });
    mockFetch(200, { candidates: [{ content: { parts: [{ text: '{"reply": 3}' }] } }] });
    expect(await call()).toEqual({ ok: false, error: "failed" });
  });

  it("builds a JSON schema without keys Gemini rejects", () => {
    const s = JSON.stringify(toGeminiSchema(Schema));
    expect(s).not.toContain("$schema");
    expect(s).not.toContain("additionalProperties");
    expect(s).toContain('"reply"');
  });
});
