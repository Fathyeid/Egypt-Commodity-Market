import type { Cefr, L10n } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

/** Writing tasks are language-independent: the learner writes in their target language. */
export type WritingTask = { id: string; type: "email" | "essay" | "report" | "dialogue"; level: Cefr; title: L10n; prompt: L10n; minWords: number };

export const WRITING_TASKS: WritingTask[] = [
  { id: "w-intro", type: "email", level: "A1", title: t("رسالة تعارف", "Introduce yourself"), prompt: t("اكتب رسالة قصيرة لصديق جديد: اسمك، من أين أنت، عملك أو دراستك، وماذا تحب.", "Write a short message to a new friend: your name, where you're from, your job or studies, and what you like."), minWords: 30 },
  { id: "w-weekend", type: "dialogue", level: "A2", title: t("حوار: خطط نهاية الأسبوع", "Dialogue: weekend plans"), prompt: t("اكتب حواراً من 6 أسطر بينك وبين صديق تتفقان فيه على ما ستفعلانه في نهاية الأسبوع.", "Write a 6-line dialogue between you and a friend agreeing on what to do at the weekend."), minWords: 40 },
  { id: "w-complaint", type: "email", level: "B1", title: t("بريد شكوى", "Complaint email"), prompt: t("طلبت منتجاً عبر الإنترنت ووصل تالفاً. اكتب بريداً رسمياً للشركة تشرح المشكلة وتطلب حلاً.", "You ordered a product online and it arrived damaged. Write a formal email to the company explaining the problem and asking for a solution."), minWords: 80 },
  { id: "w-opinion", type: "essay", level: "B1", title: t("مقال رأي: العمل من المنزل", "Opinion essay: working from home"), prompt: t("هل العمل من المنزل أفضل من العمل في المكتب؟ اكتب مقالاً قصيراً تعرض فيه رأيك مع سببين.", "Is working from home better than working in an office? Write a short essay giving your opinion with two reasons."), minWords: 120 },
  { id: "w-report", type: "report", level: "B2", title: t("تقرير اجتماع", "Meeting report"), prompt: t("اكتب تقريراً موجزاً لمديرك عن اجتماع فريق: ما نوقش، والقرارات، والخطوات التالية.", "Write a brief report to your manager about a team meeting: what was discussed, decisions taken and next steps."), minWords: 150 },
];

export const findWritingTask = (id: string) => WRITING_TASKS.find((w) => w.id === id) ?? null;
