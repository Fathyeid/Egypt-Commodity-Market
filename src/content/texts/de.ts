import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const deTexts: TextItem[] = [
  {
    id: "de-l-baeckerei", language: "de", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المخبز", "At the bakery"),
    lines: [
      "Verkäuferin: Guten Morgen! Was möchten Sie?",
      "Karim: Guten Morgen. Ich möchte vier Brötchen, bitte.",
      "Verkäuferin: Sonst noch etwas?",
      "Karim: Ja, ein Stück Apfelkuchen.",
      "Verkäuferin: Das macht vier Euro fünfzig.",
      "Karim: Bitte schön. Tschüss!",
    ],
    glossary: {
      "verkäuferin": t("بائعة", "saleswoman"), "möchten": t("يريد (بأدب)", "would like"), "brötchen": t("خبز صغير (صمّون)", "bread roll"),
      "sonst noch etwas": t("هل تريد شيئاً آخر؟", "anything else?"), "apfelkuchen": t("كعكة التفاح", "apple cake"),
      "das macht": t("المجموع", "that comes to"), "bitte schön": t("تفضّل", "here you are"),
    },
    questions: [
      { id: "q1", prompt: t("كم صمّونة اشترى كريم؟", "How many rolls does Karim buy?"), options: ["Zwei", "Vier", "Sechs"], answer: 1 },
      { id: "q2", prompt: t("ماذا اشترى أيضاً؟", "What else does he buy?"), options: ["Apfelkuchen", "Kaffee", "Käse"], answer: 0 },
      { id: "q3", prompt: t("كم دفع؟", "How much does he pay?"), options: ["4,50 €", "5,40 €", "14,50 €"], answer: 0 },
    ],
  },
  {
    id: "de-l-termin", language: "de", kind: "listening", genre: "dialogue", level: "A2",
    title: t("موعد عند الطبيب", "A doctor's appointment"),
    lines: [
      "Praxis: Praxis Dr. Weber, guten Tag.",
      "Lina: Guten Tag, hier ist Lina Haddad. Ich brauche einen Termin, bitte.",
      "Praxis: Was haben Sie denn?",
      "Lina: Ich habe seit zwei Tagen Halsschmerzen und Fieber.",
      "Praxis: Können Sie morgen um zehn Uhr kommen?",
      "Lina: Ja, das passt gut. Vielen Dank!",
    ],
    glossary: {
      praxis: t("عيادة", "doctor's office"), "termin": t("موعد", "appointment"), brauche: t("أحتاج", "I need"),
      "seit zwei tagen": t("منذ يومين", "for two days"), "halsschmerzen": t("ألم في الحلق", "sore throat"), fieber: t("حمّى", "fever"),
      "das passt gut": t("هذا مناسب", "that suits me"),
    },
    questions: [
      { id: "q1", prompt: t("لماذا تتصل لينا؟", "Why is Lina calling?"), options: ["Sie braucht einen Termin", "Sie sucht Arbeit", "Sie bestellt Essen"], answer: 0 },
      { id: "q2", prompt: t("ما مشكلتها؟", "What is her problem?"), options: ["Kopfschmerzen", "Halsschmerzen und Fieber", "Bauchschmerzen"], answer: 1 },
      { id: "q3", prompt: t("متى الموعد؟", "When is the appointment?"), options: ["Heute um zehn", "Morgen um zehn", "Morgen um zwei"], answer: 1 },
    ],
  },
  {
    id: "de-l-umzug", language: "de", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: بداية جديدة في ألمانيا", "Interview: a new start in Germany"),
    lines: [
      "Moderator: Herr Saleh, Sie leben seit einem Jahr in Hamburg. Wie gefällt es Ihnen?",
      "Herr Saleh: Sehr gut! Am Anfang war alles schwierig, besonders die Bürokratie.",
      "Moderator: Was hat Ihnen am meisten geholfen?",
      "Herr Saleh: Der Sprachkurs. Dort habe ich auch meine ersten Freunde kennengelernt.",
      "Moderator: Und beruflich?",
      "Herr Saleh: Seit drei Monaten arbeite ich als Ingenieur. Mein Ziel ist jetzt das Niveau C1.",
    ],
    glossary: {
      "wie gefällt es ihnen": t("كيف تجدها؟ / هل تعجبك؟", "how do you like it?"), "am anfang": t("في البداية", "at the beginning"),
      schwierig: t("صعب", "difficult"), "bürokratie": t("البيروقراطية", "official paperwork"), "geholfen": t("ساعد", "helped"),
      sprachkurs: t("دورة لغة", "language course"), "kennengelernt": t("تعرّفت على", "got to know"), beruflich: t("مهنياً", "professionally"),
      ziel: t("هدف", "goal"),
    },
    questions: [
      { id: "q1", prompt: t("منذ متى يعيش في هامبورغ؟", "How long has he lived in Hamburg?"), options: ["Seit einem Monat", "Seit einem Jahr", "Seit drei Jahren"], answer: 1 },
      { id: "q2", prompt: t("ما الذي ساعده أكثر؟", "What helped him most?"), options: ["Der Sprachkurs", "Das Internet", "Seine Arbeit"], answer: 0 },
      { id: "q3", prompt: t("ما هدفه الآن؟", "What is his goal now?"), options: ["Ein neues Auto", "Das Niveau C1", "Eine neue Wohnung"], answer: 1 },
    ],
  },
  {
    id: "de-r-tag", language: "de", kind: "reading", genre: "story", level: "A1",
    title: t("يوم مريم", "Maryam's day"),
    lines: [
      "Ich heiße Maryam und ich wohne in Köln.",
      "Ich stehe um sieben Uhr auf und frühstücke mit meiner Familie.",
      "Um acht Uhr fahre ich mit dem Bus zur Arbeit.",
      "Ich arbeite in einem Büro. Mittags esse ich mit meinen Kolleginnen.",
      "Abends koche ich und lese ein Buch.",
    ],
    glossary: {
      wohne: t("أسكن", "I live"), stehe: t("أستيقظ (فعل منفصل: stehe … auf)", "I get up (separable verb: stehe … auf)"), "frühstücke": t("أفطر", "I have breakfast"),
      "zur arbeit": t("إلى العمل", "to work"), "büro": t("مكتب", "office"), mittags: t("ظهراً", "at noon"),
      kolleginnen: t("زميلات العمل", "female colleagues"), abends: t("مساءً", "in the evening"), koche: t("أطبخ", "I cook"),
    },
    questions: [
      { id: "q1", prompt: t("أين تسكن مريم؟", "Where does Maryam live?"), options: ["In Köln", "In Berlin", "In Bonn"], answer: 0 },
      { id: "q2", prompt: t("كيف تذهب إلى العمل؟", "How does she get to work?"), options: ["Mit dem Auto", "Mit dem Bus", "Zu Fuß"], answer: 1 },
      { id: "q3", prompt: t("ماذا تفعل مساءً؟", "What does she do in the evening?"), options: ["Sie kocht und liest", "Sie arbeitet", "Sie schwimmt"], answer: 0 },
    ],
  },
  {
    id: "de-r-wohnung", language: "de", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: شقة للإيجار", "Ad: flat for rent"),
    lines: [
      "Schöne 2-Zimmer-Wohnung in Leipzig zu vermieten.",
      "Die Wohnung hat 55 Quadratmeter, eine moderne Küche und einen kleinen Balkon.",
      "Sie liegt im dritten Stock, es gibt leider keinen Aufzug.",
      "Die Miete beträgt 620 Euro im Monat, inklusive Heizung.",
      "Die Straßenbahn ist nur zwei Minuten entfernt. Haustiere sind nicht erlaubt.",
    ],
    glossary: {
      "zu vermieten": t("للإيجار", "for rent"), quadratmeter: t("متر مربع", "square metres"), "küche": t("مطبخ", "kitchen"),
      stock: t("طابق", "floor"), aufzug: t("مصعد", "lift / elevator"), miete: t("الإيجار", "rent"),
      heizung: t("التدفئة", "heating"), "straßenbahn": t("الترام", "tram"), haustiere: t("الحيوانات الأليفة", "pets"), erlaubt: t("مسموح", "allowed"),
    },
    questions: [
      { id: "q1", prompt: t("كم غرفة في الشقة؟", "How many rooms does the flat have?"), options: ["Ein Zimmer", "Zwei Zimmer", "Drei Zimmer"], answer: 1 },
      { id: "q2", prompt: t("ما الذي لا يوجد؟", "What is missing?"), options: ["Ein Balkon", "Eine Küche", "Ein Aufzug"], answer: 2 },
      { id: "q3", prompt: t("هل الحيوانات الأليفة مسموحة؟", "Are pets allowed?"), options: ["Ja", "Nein", "Nur Katzen"], answer: 1 },
    ],
  },
  {
    id: "de-r-fahrrad", language: "de", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: مدن الدراجات", "News: bicycle cities"),
    lines: [
      "Immer mehr deutsche Städte investieren in Radwege.",
      "In Münster fahren inzwischen fast 40 Prozent der Menschen täglich mit dem Fahrrad.",
      "Die Stadt hat breite Radwege gebaut und Parkplätze für Autos reduziert.",
      "Kritiker meinen, dass Geschäfte dadurch Kunden verlieren könnten.",
      "Eine Studie zeigt jedoch, dass Radfahrer öfter in lokalen Geschäften einkaufen.",
    ],
    glossary: {
      "immer mehr": t("أكثر فأكثر", "more and more"), investieren: t("تستثمر", "invest"), radwege: t("مسارات الدراجات", "cycle paths"),
      inzwischen: t("حالياً / في هذه الأثناء", "by now"), "täglich": t("يومياً", "daily"), reduziert: t("قلّلت", "reduced"),
      kritiker: t("المنتقدون", "critics"), "verlieren": t("يخسر", "lose"), jedoch: t("ومع ذلك", "however"), einkaufen: t("يتسوّق", "shop"),
    },
    questions: [
      { id: "q1", prompt: t("كم نسبة من يركبون الدراجة يومياً في مونستر؟", "What share of people in Münster cycle daily?"), options: ["Fast 4 %", "Fast 40 %", "Fast 80 %"], answer: 1 },
      { id: "q2", prompt: t("ممّ يخاف المنتقدون؟", "What do critics fear?"), options: ["Mehr Unfälle", "Geschäfte verlieren Kunden", "Weniger Touristen"], answer: 1 },
      { id: "q3", prompt: t("ماذا تُظهر الدراسة؟", "What does the study show?"), options: ["Radfahrer kaufen öfter lokal ein", "Radfahrer kaufen online", "Es gibt keinen Unterschied"], answer: 0 },
    ],
  },
];
