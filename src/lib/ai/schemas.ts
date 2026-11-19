import { z } from "zod";

/** One correction of the learner's last message. */
export const Correction = z.object({
  original: z.string().describe("The learner's exact wrong fragment"),
  corrected: z.string().describe("The corrected fragment"),
  explanation: z.string().describe("Why it was wrong and how to avoid it, in the learner's explanation language, 1-2 sentences"),
  category: z.enum(["grammar", "vocabulary", "spelling", "word_order", "register", "other"]),
  rule_tag: z.string().describe("Short kebab-case rule id, e.g. past-simple, articles, perfekt-sein"),
});
export type Correction = z.infer<typeof Correction>;

export const TutorReply = z.object({
  reply: z.string().describe("Your message to the learner"),
  corrections: z.array(Correction).describe("Mistakes in the learner's LAST message only; empty if none"),
  new_words: z.array(z.object({ term: z.string(), meaning: z.string() })).describe("Up to 3 useful words you introduced; may be empty"),
});
export type TutorReply = z.infer<typeof TutorReply>;

export const RoleplayTurn = z.object({
  reply: z.string().describe("Your in-character line"),
  corrections: z.array(Correction).describe("Mistakes in the learner's LAST message, for the final report; empty if none"),
});
export type RoleplayTurn = z.infer<typeof RoleplayTurn>;

export const RoleplayReport = z.object({
  summary: z.string(),
  grammar: z.string(),
  vocabulary: z.string(),
  fluency: z.string(),
  errors: z.array(z.object({ original: z.string(), corrected: z.string(), explanation: z.string() })),
  better_phrases: z.array(z.object({ original: z.string(), better: z.string(), why: z.string() })),
  estimated_level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  next_steps: z.array(z.string()),
});
export type RoleplayReport = z.infer<typeof RoleplayReport>;
