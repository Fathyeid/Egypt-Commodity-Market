/**
 * Scripted replies used only when AI_PROVIDER=fake (automated tests).
 * Every reply is prefixed with "[test]" and the UI shows a test-mode banner,
 * so these can never be mistaken for real AI output.
 */
import type { Correction, RoleplayReport, RoleplayTurn, TutorReply } from "./schemas";

function detect(text: string): Correction[] {
  return /\bI has\b/i.test(text)
    ? [{ original: "I has", corrected: "I have", category: "grammar", rule_tag: "have-has", explanation: "[test] With “I” we use “have”, not “has”." }]
    : [];
}

export function fakeTutor(text: string): TutorReply {
  return { reply: `[test] Thanks! You wrote: “${text.slice(0, 80)}”. Tell me more.`, corrections: detect(text), new_words: [{ term: "weekend", meaning: "[test] Saturday and Sunday" }] };
}

export function fakeRoleplay(text: string | null): RoleplayTurn {
  if (text === null) return { reply: "[test] Good evening! Welcome. Do you have a reservation?", corrections: [] };
  return { reply: "[test] I see. And how many nights would you like to stay?", corrections: detect(text) };
}

export function fakeReport(turns: number): RoleplayReport {
  return {
    summary: `[test] Scripted report for ${turns} learner turn(s).`,
    grammar: "[test] Scripted grammar feedback.",
    vocabulary: "[test] Scripted vocabulary feedback.",
    fluency: "[test] Scripted fluency feedback.",
    errors: [{ original: "I has", corrected: "I have", explanation: "[test] Subject–verb agreement." }],
    better_phrases: [{ original: "I want a room", better: "I'd like to book a room", why: "[test] More polite." }],
    estimated_level: "A2",
    next_steps: ["[test] Practise have/has."],
  };
}
