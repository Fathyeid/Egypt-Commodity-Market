import { describe, expect, it } from "vitest";
import { downsample, encodeWav, wavSeconds } from "@/lib/speech/wav";
import { parseAzureResult } from "@/lib/speech/azure";
import { tokenize } from "@/components/practice/tokenize";
import { textsFor } from "@/content";
import { WRITING_TASKS } from "@/content/writing";
import { PRON_SENTENCES } from "@/content/pronunciation";

describe("wav encoding", () => {
  it("writes a valid 16 kHz mono 16-bit PCM header", () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 0.5]));
    const v = new DataView(wav);
    const str = (o: number, n: number) => String.fromCharCode(...new Uint8Array(wav, o, n));
    expect(str(0, 4)).toBe("RIFF");
    expect(str(8, 4)).toBe("WAVE");
    expect(v.getUint16(22, true)).toBe(1); // mono
    expect(v.getUint32(24, true)).toBe(16000);
    expect(v.getUint16(34, true)).toBe(16);
    expect(v.getUint32(40, true)).toBe(8);
    expect(v.getInt16(46, true)).toBe(32767);
    expect(v.getInt16(48, true)).toBe(-32768);
    expect(wav.byteLength).toBe(52);
  });
  it("downsamples 48 kHz to 16 kHz and measures duration", () => {
    expect(downsample(new Float32Array(48000), 48000).length).toBe(16000);
    expect(wavSeconds(44 + 32000)).toBe(1);
  });
});

describe("Azure result parsing", () => {
  const flat = {
    RecognitionStatus: "Success",
    NBest: [{ Display: "Hello world.", AccuracyScore: 88.4, FluencyScore: 91, CompletenessScore: 100, PronScore: 89.6,
      Words: [{ Word: "hello", AccuracyScore: 95, ErrorType: "None", Phonemes: [{ Phoneme: "h", AccuracyScore: 99 }] }, { Word: "world", AccuracyScore: 42, ErrorType: "Mispronunciation" }] }],
  };
  it("reads the flattened REST shape", () => {
    const r = parseAzureResult(flat)!;
    expect(r.scores).toEqual({ accuracy: 88, fluency: 91, completeness: 100, pronunciation: 90, prosody: null });
    expect(r.words[1]).toEqual({ word: "world", accuracy: 42, errorType: "Mispronunciation", phonemes: [] });
    expect(r.words[0].phonemes).toEqual([{ phoneme: "h", accuracy: 99 }]);
  });
  it("reads the nested PronunciationAssessment shape, including prosody", () => {
    const nested = {
      RecognitionStatus: "Success",
      NBest: [{ Display: "Hi", PronunciationAssessment: { AccuracyScore: 70, FluencyScore: 60, CompletenessScore: 100, PronScore: 72, ProsodyScore: 65 },
        Words: [{ Word: "hi", PronunciationAssessment: { AccuracyScore: 70, ErrorType: "None" } }] }],
    };
    const r = parseAzureResult(nested)!;
    expect(r.scores.prosody).toBe(65);
    expect(r.words[0].accuracy).toBe(70);
  });
  it("returns null when nothing was recognised", () => {
    expect(parseAzureResult({ RecognitionStatus: "NoMatch" })).toBeNull();
  });
});

describe("tokenize", () => {
  it("prefers glossary phrases over single words and keeps punctuation", () => {
    const toks = tokenize("Excuse me, is it far?", ["excuse me", "far"]);
    expect(toks.filter((x) => x.key).map((x) => x.key)).toEqual(["excuse me", "is", "it", "far"]);
    expect(toks.map((x) => x.text).join("")).toBe("Excuse me, is it far?");
  });
  it("handles German umlauts and ß", () => {
    expect(tokenize("Die Straßenbahn fährt.", []).filter((x) => x.key).map((x) => x.text)).toEqual(["Die", "Straßenbahn", "fährt"]);
  });
});

for (const language of ["en", "de"]) {
  describe(`text content: ${language}`, () => {
    for (const kind of ["listening", "reading"] as const) {
      it(`${kind} items are well-formed and every glossary entry appears in its text`, () => {
        const items = textsFor(language, kind);
        expect(items.length).toBeGreaterThanOrEqual(3);
        for (const it of items) {
          expect(it.questions.length).toBeGreaterThanOrEqual(3);
          for (const q of it.questions) expect(q.answer).toBeLessThan(q.options.length);
          const keys = Object.keys(it.glossary);
          const tokens = it.lines.flatMap((l) => tokenize(l, keys)).map((x) => x.key);
          for (const k of keys) {
            expect(k).toBe(k.toLowerCase());
            expect(tokens, `${it.id}: "${k}"`).toContain(k);
          }
        }
      });
    }
    it("has pronunciation sentences", () => expect(PRON_SENTENCES[language].length).toBeGreaterThanOrEqual(4));
  });
}

it("writing tasks have unique ids and bilingual prompts", () => {
  expect(new Set(WRITING_TASKS.map((w) => w.id)).size).toBe(WRITING_TASKS.length);
  for (const w of WRITING_TASKS) expect(w.prompt.ar && w.prompt.en).toBeTruthy();
});
