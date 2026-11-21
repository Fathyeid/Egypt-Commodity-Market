import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const frTexts: TextItem[] = [
  {
    id: "fr-l-boulangerie", language: "fr", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المخبز", "At the bakery"),
    lines: [
      "Boulangère: Bonjour monsieur, vous désirez ?",
      "Karim: Bonjour. Une baguette et deux croissants, s'il vous plaît.",
      "Boulangère: Et avec ceci ?",
      "Karim: C'est tout, merci. Ça fait combien ?",
      "Boulangère: Trois euros vingt.",
      "Karim: Voilà. Bonne journée !",
    ],
    glossary: {
      "vous désirez": t("ماذا تريد؟", "what would you like?"), baguette: t("خبز فرنسي طويل", "baguette"), croissants: t("كرواسون", "croissants"),
      "avec ceci": t("شيء آخر؟", "anything else?"), "c'est tout": t("هذا كل شيء", "that's all"), "ça fait combien": t("كم الحساب؟", "how much is it?"),
      "bonne journée": t("يومك سعيد", "have a nice day"),
    },
    questions: [
      { id: "q1", prompt: t("كم كرواسون اشترى كريم؟", "How many croissants does Karim buy?"), options: ["Un", "Deux", "Trois"], answer: 1 },
      { id: "q2", prompt: t("ماذا اشترى أيضاً؟", "What else does he buy?"), options: ["Une baguette", "Un gâteau", "Du café"], answer: 0 },
      { id: "q3", prompt: t("كم دفع؟", "How much does he pay?"), options: ["2,30 €", "3,20 €", "13,20 €"], answer: 1 },
    ],
  },
  {
    id: "fr-l-rendezvous", language: "fr", kind: "listening", genre: "dialogue", level: "A2",
    title: t("موعد عند الطبيب", "A doctor's appointment"),
    lines: [
      "Secrétaire: Cabinet du docteur Martin, bonjour.",
      "Lina: Bonjour, je voudrais prendre rendez-vous, s'il vous plaît.",
      "Secrétaire: Qu'est-ce qui ne va pas ?",
      "Lina: J'ai mal à la gorge et de la fièvre depuis deux jours.",
      "Secrétaire: Vous pouvez venir demain à dix heures ?",
      "Lina: Oui, c'est parfait. Merci beaucoup.",
    ],
    glossary: {
      cabinet: t("عيادة", "practice / office"), "prendre rendez-vous": t("أحجز موعداً", "make an appointment"),
      "qu'est-ce qui ne va pas": t("ما المشكلة؟", "what's wrong?"), "mal à la gorge": t("ألم في الحلق", "sore throat"),
      "fièvre": t("حمّى", "fever"), depuis: t("منذ", "for / since"), demain: t("غداً", "tomorrow"),
    },
    questions: [
      { id: "q1", prompt: t("لماذا تتصل لينا؟", "Why is Lina calling?"), options: ["Pour un rendez-vous", "Pour un travail", "Pour une pizza"], answer: 0 },
      { id: "q2", prompt: t("ما مشكلتها؟", "What is her problem?"), options: ["Mal au dos", "Mal à la gorge et fièvre", "Mal aux dents"], answer: 1 },
      { id: "q3", prompt: t("متى الموعد؟", "When is the appointment?"), options: ["Aujourd'hui à dix heures", "Demain à dix heures", "Demain à deux heures"], answer: 1 },
    ],
  },
  {
    id: "fr-l-interview", language: "fr", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: حياة جديدة في مونتريال", "Interview: a new life in Montreal"),
    lines: [
      "Journaliste: Madame Haddad, vous vivez à Montréal depuis un an. Comment ça se passe ?",
      "Mme Haddad: Très bien ! Au début, l'hiver a été difficile, il faisait moins vingt degrés.",
      "Journaliste: Qu'est-ce qui vous a le plus aidée ?",
      "Mme Haddad: Mes voisins. Ils m'ont expliqué comment tout fonctionne ici.",
      "Journaliste: Et le travail ?",
      "Mme Haddad: Je suis infirmière dans un hôpital depuis six mois. Je suis vraiment contente.",
    ],
    glossary: {
      "comment ça se passe": t("كيف تسير الأمور؟", "how is it going?"), "au début": t("في البداية", "at the beginning"),
      "l'hiver": t("الشتاء", "winter"), "moins vingt degrés": t("ناقص عشرين درجة", "minus twenty degrees"), aidée: t("ساعدَتني", "helped (me)"),
      voisins: t("الجيران", "neighbours"), "fonctionne": t("يعمل / يسير", "works"), "infirmière": t("ممرضة", "nurse"), contente: t("سعيدة", "happy"),
    },
    questions: [
      { id: "q1", prompt: t("ما الذي كان صعباً في البداية؟", "What was hard at first?"), options: ["La langue", "L'hiver", "Le logement"], answer: 1 },
      { id: "q2", prompt: t("من ساعدها أكثر؟", "Who helped her most?"), options: ["Ses voisins", "Sa famille", "Son patron"], answer: 0 },
      { id: "q3", prompt: t("ما عملها؟", "What is her job?"), options: ["Professeure", "Infirmière", "Ingénieure"], answer: 1 },
    ],
  },
  {
    id: "fr-r-journee", language: "fr", kind: "reading", genre: "story", level: "A1",
    title: t("يوم مريم", "Maryam's day"),
    lines: [
      "Je m'appelle Maryam et j'habite à Lyon.",
      "Je me lève à sept heures et je prends le petit-déjeuner avec ma famille.",
      "À huit heures, je vais au travail en bus.",
      "Je travaille dans un bureau. À midi, je mange avec mes collègues.",
      "Le soir, je fais la cuisine et je lis un livre.",
    ],
    glossary: {
      "j'habite": t("أسكن", "I live"), "je me lève": t("أستيقظ", "I get up"), "petit-déjeuner": t("الفطور", "breakfast"),
      travail: t("العمل", "work"), bureau: t("مكتب", "office"), "à midi": t("ظهراً", "at noon"), "collègues": t("زملاء", "colleagues"),
      "le soir": t("مساءً", "in the evening"), "fais la cuisine": t("أطبخ", "I cook"),
    },
    questions: [
      { id: "q1", prompt: t("أين تسكن مريم؟", "Where does Maryam live?"), options: ["À Lyon", "À Paris", "À Nice"], answer: 0 },
      { id: "q2", prompt: t("كيف تذهب إلى العمل؟", "How does she get to work?"), options: ["En voiture", "En bus", "À pied"], answer: 1 },
      { id: "q3", prompt: t("ماذا تفعل مساءً؟", "What does she do in the evening?"), options: ["Elle cuisine et lit", "Elle travaille", "Elle nage"], answer: 0 },
    ],
  },
  {
    id: "fr-r-appartement", language: "fr", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: شقة للإيجار", "Ad: flat for rent"),
    lines: [
      "À louer : bel appartement de deux pièces à Bordeaux.",
      "L'appartement fait 50 mètres carrés, avec une cuisine moderne et un petit balcon.",
      "Il est au troisième étage, mais il n'y a pas d'ascenseur.",
      "Le loyer est de 680 euros par mois, charges comprises.",
      "Le tramway est à deux minutes. Les animaux ne sont pas acceptés.",
    ],
    glossary: {
      "à louer": t("للإيجار", "for rent"), "pièces": t("غرف", "rooms"), "mètres carrés": t("متر مربع", "square metres"),
      cuisine: t("مطبخ", "kitchen"), "étage": t("طابق", "floor"), "d'ascenseur": t("مصعد", "lift / elevator"), loyer: t("الإيجار", "rent"),
      "charges comprises": t("شامل المصاريف", "bills included"), tramway: t("الترام", "tram"), animaux: t("الحيوانات", "animals / pets"),
    },
    questions: [
      { id: "q1", prompt: t("كم غرفة في الشقة؟", "How many rooms does the flat have?"), options: ["Une", "Deux", "Trois"], answer: 1 },
      { id: "q2", prompt: t("ما الذي لا يوجد؟", "What is missing?"), options: ["Un balcon", "Une cuisine", "Un ascenseur"], answer: 2 },
      { id: "q3", prompt: t("هل الحيوانات مسموحة؟", "Are pets allowed?"), options: ["Oui", "Non", "Seulement les chats"], answer: 1 },
    ],
  },
  {
    id: "fr-r-velo", language: "fr", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: باريس والدراجات", "News: Paris on two wheels"),
    lines: [
      "De plus en plus de Parisiens se déplacent à vélo.",
      "En cinq ans, la ville a construit des centaines de kilomètres de pistes cyclables.",
      "Certaines rues ont été fermées aux voitures pour laisser plus de place aux piétons.",
      "Les commerçants avaient peur de perdre des clients.",
      "Pourtant, une étude montre que les cyclistes achètent plus souvent dans les magasins du quartier.",
    ],
    glossary: {
      "de plus en plus": t("أكثر فأكثر", "more and more"), "se déplacent": t("يتنقّلون", "get around"), "vélo": t("دراجة", "bike"),
      "pistes cyclables": t("مسارات الدراجات", "cycle lanes"), "piétons": t("المشاة", "pedestrians"), "commerçants": t("أصحاب المحلات", "shopkeepers"),
      "avaient peur": t("كانوا يخافون", "were afraid"), pourtant: t("ومع ذلك", "however"), "étude": t("دراسة", "study"), quartier: t("الحي", "neighbourhood"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا بنت المدينة؟", "What did the city build?"), options: ["Des parkings", "Des pistes cyclables", "Des stades"], answer: 1 },
      { id: "q2", prompt: t("ممّ خاف أصحاب المحلات؟", "What were shopkeepers afraid of?"), options: ["Perdre des clients", "Plus d'accidents", "Moins de touristes"], answer: 0 },
      { id: "q3", prompt: t("ماذا تُظهر الدراسة؟", "What does the study show?"), options: ["Les cyclistes achètent plus souvent dans le quartier", "Les cyclistes achètent en ligne", "Il n'y a pas de différence"], answer: 0 },
    ],
  },
];
