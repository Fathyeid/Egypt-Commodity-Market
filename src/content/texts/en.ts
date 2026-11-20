import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const enTexts: TextItem[] = [
  {
    id: "en-l-cafe", language: "en", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المقهى", "At the café"),
    lines: [
      "Waiter: Good morning! What would you like?",
      "Sara: A coffee with milk, please.",
      "Waiter: Small or large?",
      "Sara: Large, please. And a croissant.",
      "Waiter: That's five dollars.",
      "Sara: Here you are. Thank you!",
    ],
    glossary: {
      waiter: t("نادل", "person who serves food"), "would you like": t("ماذا تريد (بأدب)", "polite: what do you want"),
      milk: t("حليب", "white drink from cows"), large: t("كبير", "big"), croissant: t("كرواسون", "French pastry"),
      "here you are": t("تفضّل", "said when giving something"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا طلبت سارة لتشربه؟", "What does Sara order to drink?"), options: ["Tea", "Coffee with milk", "Orange juice"], answer: 1 },
      { id: "q2", prompt: t("ما الحجم الذي اختارته؟", "Which size does she choose?"), options: ["Small", "Medium", "Large"], answer: 2 },
      { id: "q3", prompt: t("كم دفعت؟", "How much does she pay?"), options: ["$5", "$15", "$50"], answer: 0 },
    ],
  },
  {
    id: "en-l-directions", language: "en", kind: "listening", genre: "dialogue", level: "A2",
    title: t("السؤال عن الطريق", "Asking for directions"),
    lines: [
      "Omar: Excuse me, is there a pharmacy near here?",
      "Woman: Yes, there's one on King Street.",
      "Omar: How do I get there?",
      "Woman: Go straight, then turn left at the traffic lights. It's next to the bank.",
      "Omar: Is it far?",
      "Woman: No, it's about five minutes on foot.",
      "Omar: Great, thanks a lot!",
    ],
    glossary: {
      "excuse me": t("لو سمحت", "polite way to get attention"), pharmacy: t("صيدلية", "shop that sells medicine"),
      "go straight": t("امشِ مباشرة", "continue forward"), "turn left": t("انعطف يساراً", "go to the left"),
      "traffic lights": t("إشارة المرور", "red/green lights for cars"), "next to": t("بجانب", "beside"),
      "on foot": t("سيراً على الأقدام", "walking"), far: t("بعيد", "a long distance"),
    },
    questions: [
      { id: "q1", prompt: t("عمّ يبحث عمر؟", "What is Omar looking for?"), options: ["A bank", "A pharmacy", "A hotel"], answer: 1 },
      { id: "q2", prompt: t("أين ينعطف؟", "Where should he turn left?"), options: ["At the bank", "At the traffic lights", "At King Street"], answer: 1 },
      { id: "q3", prompt: t("كم تستغرق المسافة؟", "How long does it take?"), options: ["Five minutes on foot", "Fifteen minutes by bus", "One hour"], answer: 0 },
    ],
  },
  {
    id: "en-l-interview", language: "en", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: العمل من المنزل", "Interview: working from home"),
    lines: [
      "Host: Today we're talking to Lina, a designer who has worked from home for three years.",
      "Host: Lina, what do you like most about it?",
      "Lina: Definitely the time I save. I used to spend two hours a day commuting.",
      "Host: And what's the hardest part?",
      "Lina: Staying motivated. Without colleagues around, it's easy to get distracted.",
      "Host: Any advice for our listeners?",
      "Lina: Keep a routine. I start at nine and I always take a proper lunch break.",
    ],
    glossary: {
      designer: t("مصمم/ة", "person who designs things"), "used to": t("اعتدت أن (في الماضي)", "did regularly in the past"),
      commuting: t("التنقل إلى العمل", "travelling to and from work"), motivated: t("متحمس / لديه دافع", "wanting to do things"),
      colleagues: t("زملاء العمل", "people you work with"), distracted: t("مشتّت الانتباه", "not able to focus"),
      routine: t("روتين", "usual way of doing things"), "lunch break": t("استراحة الغداء", "time to eat at midday"),
    },
    questions: [
      { id: "q1", prompt: t("ما أكثر ما تحبه لينا؟", "What does Lina like most?"), options: ["Her colleagues", "The time she saves", "Her office"], answer: 1 },
      { id: "q2", prompt: t("ما الصعوبة الأكبر؟", "What is the hardest part?"), options: ["Staying motivated", "Slow internet", "Long commutes"], answer: 0 },
      { id: "q3", prompt: t("بماذا تنصح؟", "What is her advice?"), options: ["Work at night", "Keep a routine", "Skip lunch"], answer: 1 },
    ],
  },
  {
    id: "en-r-family", language: "en", kind: "reading", genre: "story", level: "A1",
    title: t("عائلة ميغيل", "Miguel's family"),
    lines: [
      "My name is Miguel. I am twelve years old and I live in Madrid.",
      "I have one sister and two brothers. My sister is Ana. She is sixteen.",
      "My father is a teacher and my mother is a nurse.",
      "We have a small dog. His name is Toto.",
      "On Sundays we eat lunch with my grandparents.",
    ],
    glossary: {
      sister: t("أخت", "female sibling"), brothers: t("إخوة (ذكور)", "male siblings"), teacher: t("مدرّس", "person who teaches"),
      nurse: t("ممرّض/ة", "person who cares for sick people"), grandparents: t("الأجداد", "your parents' parents"), lunch: t("غداء", "midday meal"),
    },
    questions: [
      { id: "q1", prompt: t("كم عمر ميغيل؟", "How old is Miguel?"), options: ["12", "16", "20"], answer: 0 },
      { id: "q2", prompt: t("ما مهنة والدته؟", "What is his mother's job?"), options: ["Teacher", "Nurse", "Doctor"], answer: 1 },
      { id: "q3", prompt: t("مع من يتناولون الغداء يوم الأحد؟", "Who do they eat lunch with on Sundays?"), options: ["Friends", "Neighbours", "Grandparents"], answer: 2 },
    ],
  },
  {
    id: "en-r-weekend", language: "en", kind: "reading", genre: "story", level: "A2",
    title: t("عطلة نهاية أسبوع ممطرة", "A rainy weekend"),
    lines: [
      "Last weekend, Nour planned to go to the beach with her friends.",
      "But on Saturday morning it started to rain, so they changed their plans.",
      "They went to the cinema and watched a funny film.",
      "After the film, they had pizza at a small restaurant near the river.",
      "On Sunday the weather was still bad, so Nour stayed at home and read a book.",
      "It wasn't the weekend she wanted, but she enjoyed it.",
    ],
    glossary: {
      planned: t("خططت", "decided before"), beach: t("شاطئ", "sand by the sea"), "changed their plans": t("غيّروا خططهم", "decided to do something else"),
      cinema: t("سينما", "place to watch films"), funny: t("مضحك", "makes you laugh"), river: t("نهر", "large natural stream of water"),
      weather: t("الطقس", "rain, sun, wind…"), enjoyed: t("استمتعت", "liked it"),
    },
    questions: [
      { id: "q1", prompt: t("أين أرادت نور الذهاب؟", "Where did Nour want to go?"), options: ["The beach", "The cinema", "The river"], answer: 0 },
      { id: "q2", prompt: t("لماذا غيّروا خططهم؟", "Why did they change their plans?"), options: ["It was too hot", "It started to rain", "The beach was closed"], answer: 1 },
      { id: "q3", prompt: t("ماذا فعلت يوم الأحد؟", "What did she do on Sunday?"), options: ["Went to a restaurant", "Read a book at home", "Went swimming"], answer: 1 },
    ],
  },
  {
    id: "en-r-sleep", language: "en", kind: "reading", genre: "article", level: "B1",
    title: t("لماذا يهمّ النوم؟", "Why sleep matters"),
    lines: [
      "Most adults need between seven and nine hours of sleep a night, yet many get far less.",
      "Scientists say that while we sleep, the brain stores new information and removes waste.",
      "Lack of sleep can affect our memory, mood and even our immune system.",
      "Experts recommend going to bed at the same time every day and avoiding screens for an hour before sleeping.",
      "A cool, dark and quiet bedroom also helps.",
    ],
    glossary: {
      adults: t("البالغون", "grown-up people"), yet: t("ومع ذلك", "however"), brain: t("الدماغ", "organ you think with"),
      stores: t("يخزّن", "keeps for later"), "lack of": t("نقص", "not enough of"), mood: t("المزاج", "how you feel"),
      "immune system": t("جهاز المناعة", "body's defence against illness"), recommend: t("يوصي", "advise"), avoiding: t("تجنّب", "staying away from"),
    },
    questions: [
      { id: "q1", prompt: t("كم ساعة يحتاج معظم البالغين؟", "How much sleep do most adults need?"), options: ["5–6 hours", "7–9 hours", "10–12 hours"], answer: 1 },
      { id: "q2", prompt: t("ماذا يفعل الدماغ أثناء النوم؟", "What does the brain do during sleep?"), options: ["Stores information", "Stops working", "Grows bigger"], answer: 0 },
      { id: "q3", prompt: t("بماذا ينصح الخبراء؟", "What do experts recommend?"), options: ["Using screens in bed", "A warm, bright room", "A regular bedtime"], answer: 2 },
    ],
  },
];
