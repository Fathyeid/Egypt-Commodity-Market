/** USD per 1M tokens (Anthropic first-party list prices, Nov 2026). Unknown models use the default model's prices. */
const PRICES: Record<string, { input: number; output: number; cacheRead: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-opus-5": { input: 5, output: 25, cacheRead: 0.5 },
  "claude-opus-4-8": { input: 5, output: 25, cacheRead: 0.5 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1 },
  "claude-sonnet-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01 },
};

export function costMicros(model: string, t: { input: number; cacheWrite: number; cacheRead: number; output: number }): number {
  const p = PRICES[model] ?? PRICES["claude-opus-5-5"];
  // Cache writes are billed at 1.25× input (5-minute TTL).
  const usd = (t.input * p.input + t.cacheWrite * p.input * 1.25 + t.cacheRead * p.cacheRead + t.output * p.output) / 1_000_000;
  return Math.ceil(usd * 1_000_000);
}
