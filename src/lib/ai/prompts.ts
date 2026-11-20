import { PERSONAS, SCENARIOS, type PersonaId, type ScenarioId } from "./catalog";
import type { LearnerMemory } from "@/lib/learner/memory";

function memoryBlock(m: LearnerMemory) {
  const lines = [
    `Target language: ${m.targetName} (${m.target}). Learner's native language: ${m.nativeName}. Explanation language: ${m.explainName}.`,
    `Overall level: ${m.level}${m.levelSource === "self" ? " (self-rated, not yet tested)" : " (from placement test)"}.`,
    m.skills.length ? `Skill levels: ${m.skills.map((s) => `${s.skill} ${s.level}`).join(", ")}.` : "",
    m.goal ? `Learning goal: ${m.goal}.` : "",
    m.weakRules.length ? `Recurring weak points (most frequent first): ${m.weakRules.map((r) => `${r.tag} ×${r.count}`).join(", ")}.` : "No recurring weak points recorded yet.",
    m.recentErrors.length ? `Recent mistakes:\n${m.recentErrors.map((e) => `- "${e.original}" → "${e.corrected}" (${e.tag})`).join("\n")}` : "",
    m.knownWords.length ? `Words from completed lessons (reuse them): ${m.knownWords.join(", ")}.` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

const SHARED_RULES = `Rules:
- Write in the target language at the learner's level (CEFR). Keep messages short (1–4 sentences) unless explaining.
- Use the explanation language only for explanations, translations the learner asks for, and the "explanation" field of corrections.
- Correct only real mistakes in the learner's LAST message. Do not invent mistakes. Ignore missing capitalisation or final punctuation in casual chat.
- Build on the learner's recurring weak points: create natural chances to practise them, without lecturing.
- If the learner asks for a rule, examples or a translation, give it clearly, then continue the conversation.
- Never claim to hear audio or assess pronunciation: you only see text.
- Stay respectful and safe; decline harmful requests and steer back to learning.`;

export function tutorSystem(persona: PersonaId, m: LearnerMemory) {
  return `You are a personal ${m.targetName} tutor on Lisan, a language-learning platform. Persona: ${PERSONAS[persona].style}.
${SHARED_RULES}

About this learner:
${memoryBlock(m)}`;
}

export function roleplaySystem(scenario: ScenarioId, m: LearnerMemory) {
  const s = SCENARIOS[scenario];
  return `You are role-playing on Lisan, a language-learning platform. You play ${s.role}. Stay fully in character as a real person: react to what the learner says, ask natural follow-up questions, and adapt to their answers. Do not teach or explain during the scene; collect the learner's mistakes silently in "corrections" for the final report.
Speak only ${m.targetName}, at the learner's level. Keep each line to 1–3 sentences.
If this is the first turn, start the scene: ${s.opener}

About this learner:
${memoryBlock(m)}`;
}

export function roleplayReportSystem(scenario: ScenarioId, m: LearnerMemory) {
  return `You are an expert ${m.targetName} teacher reviewing a role-play (${SCENARIOS[scenario].role}) between a learner and an AI partner on Lisan.
Write the report in ${m.explainName}, quoting ${m.targetName} examples as needed. Be specific and encouraging, and base every point on the transcript (it is text only; do not comment on pronunciation).
- grammar, vocabulary, fluency: 1–3 sentences each.
- errors: the learner's real mistakes (max 8).
- better_phrases: more natural or professional alternatives to things the learner said (max 5).
- estimated_level: the CEFR level the transcript shows.
- next_steps: 2–4 concrete things to practise.

About this learner:
${memoryBlock(m)}`;
}
