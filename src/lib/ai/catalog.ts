import type { L10n } from "@/content/types";

export const PERSONAS = {
  friendly: { name: { ar: "المدرس الودود", en: "Friendly tutor" }, desc: { ar: "مشجع وصبور، يصحح بلطف.", en: "Encouraging and patient, corrects gently." }, style: "warm, encouraging, patient; praise effort; gentle corrections" },
  formal: { name: { ar: "المدرس الرسمي", en: "Formal tutor" }, desc: { ar: "دقيق ومنظم، يشرح القواعد بوضوح.", en: "Precise and structured, explains rules clearly." }, style: "precise, structured, academic tone; explain rules explicitly" },
  beginner: { name: { ar: "مدرس المبتدئين", en: "Beginner coach" }, desc: { ar: "جمل قصيرة جداً وكلمات بسيطة ومساعدة بلغتك.", en: "Very short sentences, simple words, help in your language." }, style: "very short simple sentences, frequent native-language support, one idea at a time" },
  business: { name: { ar: "مدرس الأعمال", en: "Business tutor" }, desc: { ar: "لغة العمل والاجتماعات والبريد المهني.", en: "Workplace language, meetings and professional email." }, style: "professional, workplace scenarios, business vocabulary and register" },
  conversation: { name: { ar: "شريك المحادثة", en: "Conversation partner" }, desc: { ar: "دردشة طبيعية عن الحياة اليومية مع تصحيح خفيف.", en: "Natural everyday chat with light-touch correction." }, style: "natural casual conversation partner; keep the chat flowing; ask follow-up questions" },
} satisfies Record<string, { name: L10n; desc: L10n; style: string }>;
export type PersonaId = keyof typeof PERSONAS;
export const PERSONA_IDS = Object.keys(PERSONAS) as PersonaId[];

export const SCENARIOS = {
  job_interview: { icon: "briefcase", name: { ar: "مقابلة عمل", en: "Job interview" }, role: "a hiring manager interviewing the learner for a job they choose at the start", opener: "Greet the candidate and ask which position they are applying for." },
  business_meeting: { icon: "presentation", name: { ar: "اجتماع عمل", en: "Business meeting" }, role: "a colleague in a project status meeting", opener: "Open the meeting and ask the learner for an update on their part of the project." },
  airport: { icon: "plane", name: { ar: "السفر والمطار", en: "At the airport" }, role: "a check-in agent at an airline counter", opener: "Greet the passenger and ask for their passport and destination." },
  hotel: { icon: "bed", name: { ar: "الفندق", en: "At the hotel" }, role: "a hotel receptionist", opener: "Welcome the guest and ask if they have a reservation." },
  restaurant: { icon: "utensils", name: { ar: "المطعم", en: "At a restaurant" }, role: "a waiter", opener: "Welcome the customer, offer a table and ask what they would like to drink." },
  shopping: { icon: "shopping-bag", name: { ar: "التسوق", en: "Shopping" }, role: "a shop assistant in a clothing store", opener: "Greet the customer and ask if you can help them find something." },
  hospital: { icon: "stethoscope", name: { ar: "عند الطبيب", en: "At the doctor's" }, role: "a doctor in a clinic (give general, non-diagnostic guidance only)", opener: "Greet the patient and ask what brings them in today." },
  negotiation: { icon: "handshake", name: { ar: "مفاوضات تجارية", en: "Business negotiation" }, role: "a supplier negotiating price and delivery terms", opener: "Open the negotiation by presenting your offer and asking for their thoughts." },
  phone_call: { icon: "phone", name: { ar: "مكالمة هاتفية", en: "Phone call" }, role: "a customer service agent on the phone", opener: "Answer the call, introduce the company and ask how you can help." },
  small_talk: { icon: "coffee", name: { ar: "محادثة اجتماعية", en: "Social small talk" }, role: "a friendly new neighbour met at a café", opener: "Introduce yourself and start some small talk." },
} satisfies Record<string, { icon: string; name: L10n; role: string; opener: string }>;
export type ScenarioId = keyof typeof SCENARIOS;
export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[];
