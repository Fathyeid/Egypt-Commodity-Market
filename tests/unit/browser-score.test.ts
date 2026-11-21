import { describe, expect, it } from "vitest";
import { scoreTranscript } from "@/lib/speech/browser-score";

describe("free browser pronunciation score", () => {
  it("gives full marks for an exact match, ignoring case and punctuation", () => {
    const r = scoreTranscript("Hello, my name is Sara.", ["hello my name is sara"], "en");
    expect(r.scores.pronunciation).toBe(100);
    expect(r.words.map((w) => w.errorType)).toEqual(["None", "None", "None", "None", "None"]);
    expect(r.scores.fluency).toBeNull();
  });

  it("flags omitted and misheard words", () => {
    const r = scoreTranscript("Ich möchte einen Kaffee bitte", ["ich mochte Kaffee bitte"], "de");
    const byWord = Object.fromEntries(r.words.map((w) => [w.word, w]));
    expect(byWord["einen"].errorType).toBe("Omission");
    expect(byWord["möchte"].accuracy).toBeGreaterThan(50);
    expect(byWord["möchte"].accuracy).toBeLessThan(100);
    expect(r.scores.completeness).toBe(80);
  });

  it("picks the best of several recognizer alternatives", () => {
    const r = scoreTranscript("I would like tea", ["I wood like tea", "I would like tea"], "en");
    expect(r.recognized).toBe("I would like tea");
    expect(r.scores.accuracy).toBe(100);
  });

  it("scores Chinese and Japanese per character", () => {
    const r = scoreTranscript("我喜欢喝茶。", ["我喜欢喝"], "zh");
    expect(r.words).toHaveLength(5);
    expect(r.words.at(-1)?.errorType).toBe("Omission");
  });

  it("ignores Arabic diacritics and letter variants", () => {
    const r = scoreTranscript("أنا أحبُّ القهوةَ", ["انا احب القهوه"], "ar");
    expect(r.scores.accuracy).toBe(100);
  });

  it("handles silence", () => {
    const r = scoreTranscript("Good morning", [], "en");
    expect(r.scores.pronunciation).toBe(0);
  });
});
