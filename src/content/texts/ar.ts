import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

/** Modern Standard Arabic texts; glossary meanings in English (Arabic learners' explanation is the same text). */
export const arTexts: TextItem[] = [
  {
    id: "ar-l-maqha", language: "ar", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المقهى", "At the café"),
    lines: [
      "النادل: أهلاً وسهلاً! ماذا تشرب؟",
      "جون: أريد فنجان قهوة، من فضلك.",
      "النادل: بالسكر أم بدون سكر؟",
      "جون: بقليل من السكر. كم الحساب؟",
      "النادل: عشرون جنيهاً.",
      "جون: تفضّل. شكراً!",
    ],
    glossary: {
      "النادل": t("النادل", "the waiter"), "أهلاً وسهلاً": t("ترحيب", "welcome"), "تشرب": t("تشرب", "you drink"), "أريد": t("أريد", "I want"),
      "فنجان": t("فنجان", "cup"), "قهوة": t("قهوة", "coffee"), "من فضلك": t("من فضلك", "please"), "بالسكر": t("بالسكر", "with sugar"),
      "بدون": t("بدون", "without"), "بقليل": t("بقليل", "with a little"), "الحساب": t("الحساب", "the bill"), "جنيهاً": t("جنيه", "pounds"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا يشرب جون؟", "What does John drink?"), options: ["شاي", "قهوة", "عصير"], answer: 1 },
      { id: "q2", prompt: t("كيف يريد القهوة؟", "How does he want his coffee?"), options: ["بدون سكر", "بقليل من السكر", "بكثير من السكر"], answer: 1 },
      { id: "q3", prompt: t("كم الحساب؟", "How much is the bill?"), options: ["عشرة جنيهات", "عشرون جنيهاً", "مئة جنيه"], answer: 1 },
    ],
  },
  {
    id: "ar-l-souq", language: "ar", kind: "listening", genre: "dialogue", level: "A2",
    title: t("في السوق", "At the market"),
    lines: [
      "البائع: صباح الخير! ماذا تحتاجين؟",
      "إيما: صباح النور. أريد كيلو طماطم ونصف كيلو بطاطس.",
      "البائع: هل تريدين شيئاً آخر؟",
      "إيما: نعم، هل عندك برتقال؟",
      "البائع: طبعاً، البرتقال طازج اليوم. الكيلو بثلاثين جنيهاً.",
      "إيما: ممتاز، سآخذ كيلو واحداً.",
    ],
    glossary: {
      "البائع": t("البائع", "the seller"), "صباح الخير": t("صباح الخير", "good morning"), "صباح النور": t("رد التحية", "good morning (reply)"),
      "تحتاجين": t("تحتاجين", "you need (f.)"), "طماطم": t("طماطم", "tomatoes"), "ونصف": t("ونصف", "and a half"), "بطاطس": t("بطاطس", "potatoes"),
      "شيئاً آخر": t("شيئاً آخر", "something else"), "عندك": t("عندك", "do you have"), "برتقال": t("برتقال", "oranges"), "طازج": t("طازج", "fresh"),
      "سآخذ": t("سآخذ", "I will take"),
    },
    questions: [
      { id: "q1", prompt: t("كم كيلو طماطم تريد إيما؟", "How much tomato does Emma want?"), options: ["نصف كيلو", "كيلو", "كيلوين"], answer: 1 },
      { id: "q2", prompt: t("ماذا تسأل عنه أيضاً؟", "What else does she ask about?"), options: ["تفاح", "برتقال", "موز"], answer: 1 },
      { id: "q3", prompt: t("كم سعر كيلو البرتقال؟", "How much is a kilo of oranges?"), options: ["عشرون جنيهاً", "ثلاثون جنيهاً", "خمسون جنيهاً"], answer: 1 },
    ],
  },
  {
    id: "ar-l-muqabala", language: "ar", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: دراسة العربية في القاهرة", "Interview: studying Arabic in Cairo"),
    lines: [
      "المذيع: يا ماريا، منذ متى تدرسين اللغة العربية في القاهرة؟",
      "ماريا: منذ سنة ونصف. جئت لأني أحب الأدب العربي.",
      "المذيع: ما أصعب شيء واجهتِه؟",
      "ماريا: الفرق بين الفصحى والعامية. في الجامعة نتكلم الفصحى، وفي الشارع العامية.",
      "المذيع: وكيف تتعاملين مع ذلك؟",
      "ماريا: أتكلم مع جيراني كل يوم، والآن أفهم أغلب ما يقولون.",
    ],
    glossary: {
      "المذيع": t("المذيع", "the presenter"), "منذ متى": t("منذ متى", "since when / how long"), "تدرسين": t("تدرسين", "you study (f.)"),
      "سنة ونصف": t("سنة ونصف", "a year and a half"), "الأدب": t("الأدب", "literature"), "أصعب": t("أصعب", "the hardest"), "واجهتِه": t("واجهتِه", "you faced"),
      "الفرق": t("الفرق", "the difference"), "الفصحى": t("الفصحى", "Standard Arabic"), "العامية": t("العامية", "colloquial Arabic"),
      "تتعاملين": t("تتعاملين", "you deal (f.)"), "جيراني": t("جيراني", "my neighbours"), "أغلب": t("أغلب", "most"),
    },
    questions: [
      { id: "q1", prompt: t("منذ متى تدرس ماريا العربية؟", "How long has Maria studied Arabic?"), options: ["ستة أشهر", "سنة ونصف", "خمس سنوات"], answer: 1 },
      { id: "q2", prompt: t("لماذا جاءت إلى القاهرة؟", "Why did she come to Cairo?"), options: ["للعمل", "لأنها تحب الأدب العربي", "لزيارة عائلتها"], answer: 1 },
      { id: "q3", prompt: t("ما أصعب شيء؟", "What is hardest?"), options: ["الكتابة", "الفرق بين الفصحى والعامية", "الطعام"], answer: 1 },
    ],
  },
  {
    id: "ar-r-yawm", language: "ar", kind: "reading", genre: "story", level: "A1",
    title: t("يوم أحمد", "Ahmed's day"),
    lines: [
      "اسمي أحمد، وأسكن في الإسكندرية.",
      "أستيقظ في الساعة السادسة وأشرب الشاي.",
      "أذهب إلى الجامعة بالترام.",
      "أدرس الطب. بعد الظهر ألعب كرة القدم مع أصدقائي.",
      "في المساء أقرأ كتاباً وأنام مبكراً.",
    ],
    glossary: {
      "اسمي": t("اسمي", "my name is"), "وأسكن": t("وأسكن", "and I live"), "الإسكندرية": t("الإسكندرية", "Alexandria"), "أستيقظ": t("أستيقظ", "I wake up"),
      "السادسة": t("السادسة", "six (o'clock)"), "الجامعة": t("الجامعة", "the university"), "بالترام": t("بالترام", "by tram"), "الطب": t("الطب", "medicine"),
      "بعد الظهر": t("بعد الظهر", "in the afternoon"), "أصدقائي": t("أصدقائي", "my friends"), "المساء": t("المساء", "the evening"), "مبكراً": t("مبكراً", "early"),
    },
    questions: [
      { id: "q1", prompt: t("أين يسكن أحمد؟", "Where does Ahmed live?"), options: ["في القاهرة", "في الإسكندرية", "في أسوان"], answer: 1 },
      { id: "q2", prompt: t("كيف يذهب إلى الجامعة؟", "How does he get to university?"), options: ["بالسيارة", "بالترام", "مشياً"], answer: 1 },
      { id: "q3", prompt: t("ماذا يدرس؟", "What does he study?"), options: ["الهندسة", "الطب", "التاريخ"], answer: 1 },
    ],
  },
  {
    id: "ar-r-ilan", language: "ar", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: شقة للإيجار", "Ad: flat for rent"),
    lines: [
      "شقة للإيجار في حي المعادي بالقاهرة.",
      "الشقة فيها غرفتا نوم وصالة ومطبخ حديث.",
      "تقع في الطابق الرابع، ويوجد مصعد.",
      "الإيجار ثمانية آلاف جنيه شهرياً.",
      "قريبة من محطة المترو. لا يُسمح بالحيوانات الأليفة.",
    ],
    glossary: {
      "للإيجار": t("للإيجار", "for rent"), "حي": t("حي", "neighbourhood"), "غرفتا نوم": t("غرفتا نوم", "two bedrooms"), "صالة": t("صالة", "living room"),
      "مطبخ": t("مطبخ", "kitchen"), "حديث": t("حديث", "modern"), "تقع": t("تقع", "is located"), "الطابق": t("الطابق", "the floor"), "مصعد": t("مصعد", "lift / elevator"),
      "شهرياً": t("شهرياً", "monthly"), "قريبة": t("قريبة", "near"), "يُسمح": t("يُسمح", "is allowed"), "الحيوانات الأليفة": t("الحيوانات الأليفة", "pets"),
    },
    questions: [
      { id: "q1", prompt: t("كم غرفة نوم في الشقة؟", "How many bedrooms does the flat have?"), options: ["واحدة", "اثنتان", "ثلاث"], answer: 1 },
      { id: "q2", prompt: t("في أي طابق؟", "Which floor is it on?"), options: ["الثاني", "الرابع", "العاشر"], answer: 1 },
      { id: "q3", prompt: t("هل الحيوانات الأليفة مسموحة؟", "Are pets allowed?"), options: ["نعم", "لا", "القطط فقط"], answer: 1 },
    ],
  },
  {
    id: "ar-r-khabar", language: "ar", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: الطاقة الشمسية في القرى", "News: solar power in villages"),
    lines: [
      "بدأت قرى كثيرة في صعيد مصر تستخدم الطاقة الشمسية.",
      "يضع المزارعون ألواحاً شمسية لتشغيل مضخات المياه.",
      "وهذا يقلّل من استهلاك الوقود ويوفّر المال.",
      "لكن بعض الأسر تقول إن تكلفة الألواح في البداية مرتفعة.",
      "لذلك تقدّم بعض البنوك قروضاً صغيرة بفوائد منخفضة.",
    ],
    glossary: {
      "قرى": t("قرى", "villages"), "صعيد مصر": t("صعيد مصر", "Upper Egypt"), "الطاقة الشمسية": t("الطاقة الشمسية", "solar power"), "المزارعون": t("المزارعون", "farmers"),
      "ألواحاً شمسية": t("ألواحاً شمسية", "solar panels"), "تشغيل": t("تشغيل", "running"), "مضخات المياه": t("مضخات المياه", "water pumps"),
      "يقلّل": t("يقلّل", "reduces"), "استهلاك": t("استهلاك", "consumption"), "الوقود": t("الوقود", "fuel"), "تكلفة": t("تكلفة", "cost"),
      "مرتفعة": t("مرتفعة", "high"), "قروضاً": t("قروضاً", "loans"), "بفوائد منخفضة": t("بفوائد منخفضة", "at low interest"),
    },
    questions: [
      { id: "q1", prompt: t("لماذا يستخدم المزارعون الألواح الشمسية؟", "Why do farmers use solar panels?"), options: ["لتشغيل مضخات المياه", "لإضاءة الشوارع", "لبيع الكهرباء"], answer: 0 },
      { id: "q2", prompt: t("ما المشكلة التي تذكرها بعض الأسر؟", "What problem do some families mention?"), options: ["التكلفة في البداية مرتفعة", "الألواح لا تعمل", "لا توجد شمس"], answer: 0 },
      { id: "q3", prompt: t("ماذا تقدّم بعض البنوك؟", "What do some banks offer?"), options: ["ألواحاً مجانية", "قروضاً صغيرة", "وظائف"], answer: 1 },
    ],
  },
];
