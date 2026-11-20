import { describe, expect, it } from "vitest";
import ar from "@/lib/i18n/ar";
import en from "@/lib/i18n/en";
import { fmt } from "@/lib/i18n/format";
import { onboardingInput, trackInput } from "@/lib/validation";

function keys(o: unknown, prefix = ""): string[] {
  if (typeof o !== "object" || o === null || Array.isArray(o)) return [prefix];
  return Object.entries(o).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe("dictionaries", () => {
  it("ar and en have identical keys and no empty strings", () => {
    expect(keys(en).sort()).toEqual(keys(ar).sort());
    const empty = (d: object) => JSON.stringify(d).includes('""');
    expect(empty(ar)).toBe(false);
    expect(empty(en)).toBe(false);
  });
  it("fmt fills placeholders", () => {
    expect(fmt("Step {a} of {b}", { a: 1, b: 5 })).toBe("Step 1 of 5");
  });
});

describe("validation", () => {
  it("accepts a valid track and coerces minutes", () => {
    expect(trackInput.parse({ targetLanguage: "de", goal: "work", dailyMinutes: "30", selfLevel: "B1" }).dailyMinutes).toBe(30);
  });
  it("rejects unsupported minutes, goals and same native/target", () => {
    expect(trackInput.safeParse({ targetLanguage: "de", goal: "work", dailyMinutes: 7, selfLevel: "B1" }).success).toBe(false);
    expect(trackInput.safeParse({ targetLanguage: "de", goal: "fun", dailyMinutes: 5, selfLevel: "B1" }).success).toBe(false);
    expect(onboardingInput.safeParse({ nativeLanguage: "de", targetLanguage: "de", goal: "work", dailyMinutes: 5, selfLevel: "B1" }).success).toBe(false);
  });
});
