import type { L10n } from "@/content/types";

/** Public practice content only. Never drawn from a learner's private work. */
export const WORK_SCENARIOS = {
  supplier_followup: {
    icon: "handshake",
    name: { ar: "متابعة مع مورّد", en: "Supplier follow-up" },
    description: { ar: "اسأل عن عرض سعر واتفق على الخطوة الجاية.", en: "Ask about a quote and agree on the next step." },
    goals: {
      ar: ["عرّف بنفسك وبسبب التواصل", "اسأل عن السعر وموعد التسليم", "لخّص الاتفاق وحدد الخطوة الجاية"],
      en: ["Introduce yourself and why you are calling", "Ask about price and delivery", "Summarise and agree on the next step"],
    },
    role: "a supplier following up on a fictional price quote; this is language practice, not real commercial advice or a real offer",
    opener: "Greet the learner, say you are following up on a quote, and ask what product they are interested in. Let them choose the product. Use fictional details only.",
  },
  customer_update: {
    icon: "phone",
    name: { ar: "تحديث لعميل", en: "Customer update" },
    description: { ar: "اشرح تأخيرًا وقدّم بديلًا بطريقة مهنية.", en: "Explain a delay and offer an alternative professionally." },
    goals: {
      ar: ["اشرح سبب التأخير باختصار", "ردّ على سؤال العميل بهدوء", "اقترح بديلًا واتفق على متابعة"],
      en: ["Briefly explain the delay", "Respond calmly to a customer's question", "Offer an alternative and agree on a follow-up"],
    },
    role: "a customer asking about a delayed fictional order; be polite but ask for a clear update and an alternative",
    opener: "Greet the learner and ask why your fictional order has not arrived yet. Do not invent real company or customer details.",
  },
  team_update: {
    icon: "presentation",
    name: { ar: "تحديث لفريق الشغل", en: "Team progress update" },
    description: { ar: "اعرض اللي خلصته واطلب المساعدة بوضوح.", en: "Share your progress and ask clearly for help." },
    goals: {
      ar: ["احكِ عن حاجة خلصتها", "وضّح عائقًا محتاج مساعدة فيه", "اتفق على أولوية للخطوة الجاية"],
      en: ["Describe something you have finished", "Explain a blocker you need help with", "Agree on the next priority"],
    },
    role: "a supportive colleague in a short fictional team check-in; ask about progress, a blocker and the next priority",
    opener: "Welcome the learner to a quick team check-in and ask what they have been working on. Let them choose a fictional project.",
  },
} satisfies Record<string, { icon: string; name: L10n; description: L10n; goals: { ar: string[]; en: string[] }; role: string; opener: string }>;

export type WorkScenarioId = keyof typeof WORK_SCENARIOS;
export const WORK_SCENARIO_IDS = Object.keys(WORK_SCENARIOS) as WorkScenarioId[];
