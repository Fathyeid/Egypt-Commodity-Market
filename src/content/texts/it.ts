import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const itTexts: TextItem[] = [
  {
    id: "it-l-bar", language: "it", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في البار", "At the bar"),
    lines: [
      "Barista: Buongiorno! Cosa prende?",
      "Yasmin: Buongiorno. Un cappuccino e un cornetto, per favore.",
      "Barista: Il cornetto vuoto o alla crema?",
      "Yasmin: Alla crema, grazie. Quanto costa?",
      "Barista: Due euro e ottanta.",
      "Yasmin: Ecco a lei. Buona giornata!",
    ],
    glossary: {
      "cosa prende": t("ماذا تأخذ؟", "what will you have?"), cornetto: t("كرواسون إيطالي", "croissant"), vuoto: t("سادة / فارغ", "plain"),
      "alla crema": t("بالكريمة", "with custard"), "quanto costa": t("كم الثمن؟", "how much is it?"), "ecco a lei": t("تفضّل", "here you are"),
      "buona giornata": t("يومك سعيد", "have a nice day"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا تشرب ياسمين؟", "What does Yasmin drink?"), options: ["Un espresso", "Un cappuccino", "Un tè"], answer: 1 },
      { id: "q2", prompt: t("أي كرواسون تختار؟", "Which croissant does she choose?"), options: ["Vuoto", "Alla crema", "Al cioccolato"], answer: 1 },
      { id: "q3", prompt: t("كم تدفع؟", "How much does she pay?"), options: ["1,80 €", "2,80 €", "8,20 €"], answer: 1 },
    ],
  },
  {
    id: "it-l-stazione", language: "it", kind: "listening", genre: "dialogue", level: "A2",
    title: t("في محطة القطار", "At the train station"),
    lines: [
      "Viaggiatore: Scusi, a che ora parte il prossimo treno per Firenze?",
      "Impiegata: Alle 10:15, dal binario 6.",
      "Viaggiatore: Quanto costa un biglietto di sola andata?",
      "Impiegata: Trentacinque euro in seconda classe.",
      "Viaggiatore: Va bene, ne prendo uno. Posso pagare con la carta?",
      "Impiegata: Certo. Ecco il biglietto, buon viaggio!",
    ],
    glossary: {
      scusi: t("عفواً", "excuse me"), "a che ora": t("في أي ساعة", "at what time"), parte: t("يغادر", "leaves"), prossimo: t("القادم", "next"),
      binario: t("رصيف", "platform"), biglietto: t("تذكرة", "ticket"), "sola andata": t("ذهاب فقط", "one way"),
      "seconda classe": t("الدرجة الثانية", "second class"), carta: t("بطاقة", "card"), "buon viaggio": t("رحلة سعيدة", "have a good trip"),
    },
    questions: [
      { id: "q1", prompt: t("إلى أين يسافر؟", "Where is he going?"), options: ["A Roma", "A Firenze", "A Milano"], answer: 1 },
      { id: "q2", prompt: t("من أي رصيف يغادر القطار؟", "Which platform does the train leave from?"), options: ["Binario 2", "Binario 6", "Binario 10"], answer: 1 },
      { id: "q3", prompt: t("كيف يدفع؟", "How does he pay?"), options: ["In contanti", "Con la carta", "Non paga"], answer: 1 },
    ],
  },
  {
    id: "it-l-intervista", language: "it", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: طبّاخ شاب", "Interview: a young chef"),
    lines: [
      "Giornalista: Marco, hai aperto il tuo ristorante a ventisei anni. Com'è nata l'idea?",
      "Marco: Ho sempre amato cucinare. Da bambino aiutavo mia nonna in cucina.",
      "Giornalista: Qual è stata la difficoltà più grande?",
      "Marco: Trovare i soldi. Le banche non si fidavano di un ragazzo così giovane.",
      "Giornalista: E oggi?",
      "Marco: Oggi abbiamo otto dipendenti e il ristorante è pieno ogni sera.",
    ],
    glossary: {
      "hai aperto": t("افتتحت", "you opened"), "com'è nata": t("كيف وُلدت", "how did it start"), cucinare: t("الطبخ", "cooking"),
      "da bambino": t("في طفولتي", "as a child"), nonna: t("جدّة", "grandmother"), "difficoltà": t("صعوبة", "difficulty"), soldi: t("المال", "money"),
      "non si fidavano": t("لم تكن تثق", "didn't trust"), dipendenti: t("موظفون", "employees"), pieno: t("ممتلئ", "full"),
    },
    questions: [
      { id: "q1", prompt: t("من علّم ماركو الطبخ؟", "Who taught Marco to cook?"), options: ["Sua madre", "Sua nonna", "Un cuoco famoso"], answer: 1 },
      { id: "q2", prompt: t("ما أكبر صعوبة؟", "What was the biggest difficulty?"), options: ["Trovare i soldi", "Trovare clienti", "Imparare le ricette"], answer: 0 },
      { id: "q3", prompt: t("كم موظفاً لديه اليوم؟", "How many employees does he have today?"), options: ["Tre", "Otto", "Venti"], answer: 1 },
    ],
  },
  {
    id: "it-r-casa", language: "it", kind: "reading", genre: "story", level: "A1",
    title: t("بيتي", "My home"),
    lines: [
      "Mi chiamo Layla e abito a Bologna.",
      "La mia casa è piccola ma molto luminosa.",
      "Ci sono due camere, una cucina e un bagno.",
      "Dalla finestra vedo un parco con molti alberi.",
      "La sera mi piace leggere sul divano con una tazza di tè.",
    ],
    glossary: {
      abito: t("أسكن", "I live"), piccola: t("صغيرة", "small"), luminosa: t("مشمسة / مضيئة", "bright"), camere: t("غرف نوم", "bedrooms"),
      bagno: t("حمّام", "bathroom"), finestra: t("نافذة", "window"), alberi: t("أشجار", "trees"), "mi piace": t("أحبّ", "I like"),
      divano: t("أريكة", "sofa"), tazza: t("فنجان", "cup"),
    },
    questions: [
      { id: "q1", prompt: t("كيف بيت ليلى؟", "What is Layla's home like?"), options: ["Grande e buia", "Piccola e luminosa", "Vecchia e fredda"], answer: 1 },
      { id: "q2", prompt: t("ماذا ترى من النافذة؟", "What does she see from the window?"), options: ["Il mare", "Un parco", "Una piazza"], answer: 1 },
      { id: "q3", prompt: t("ماذا تشرب مساءً؟", "What does she drink in the evening?"), options: ["Caffè", "Tè", "Latte"], answer: 1 },
    ],
  },
  {
    id: "it-r-museo", language: "it", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: متحف المدينة", "Notice: the city museum"),
    lines: [
      "Il Museo Civico è aperto dal martedì alla domenica, dalle 9 alle 19.",
      "Il lunedì il museo è chiuso.",
      "Il biglietto intero costa 10 euro; per studenti e over 65 costa 5 euro.",
      "La prima domenica del mese l'ingresso è gratuito per tutti.",
      "È vietato fare foto con il flash e mangiare nelle sale.",
    ],
    glossary: {
      aperto: t("مفتوح", "open"), chiuso: t("مغلق", "closed"), "biglietto intero": t("تذكرة كاملة", "full-price ticket"), studenti: t("طلاب", "students"),
      "prima domenica": t("أول أحد", "first Sunday"), "l'ingresso": t("الدخول", "entry"), gratuito: t("مجاني", "free"), "è vietato": t("ممنوع", "it is forbidden"),
      sale: t("القاعات", "rooms / halls"),
    },
    questions: [
      { id: "q1", prompt: t("متى يكون المتحف مغلقاً؟", "When is the museum closed?"), options: ["Il lunedì", "La domenica", "Il sabato"], answer: 0 },
      { id: "q2", prompt: t("كم يدفع الطالب؟", "How much does a student pay?"), options: ["5 euro", "10 euro", "Niente"], answer: 0 },
      { id: "q3", prompt: t("متى يكون الدخول مجانياً؟", "When is entry free?"), options: ["Ogni martedì", "La prima domenica del mese", "Mai"], answer: 1 },
    ],
  },
  {
    id: "it-r-borghi", language: "it", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: القرى الصغيرة تعود للحياة", "News: small villages come back to life"),
    lines: [
      "Molti piccoli paesi italiani stanno perdendo abitanti da decenni.",
      "Per attirare nuove famiglie, alcuni comuni vendono case abbandonate a un euro.",
      "Chi compra deve però ristrutturare la casa entro tre anni.",
      "In alcuni paesi sono arrivati artisti, giovani coppie e persino lavoratori da remoto.",
      "I sindaci sperano che le scuole e i negozi possano riaprire.",
    ],
    glossary: {
      paesi: t("قرى / بلدات", "villages"), "stanno perdendo": t("تفقد", "are losing"), abitanti: t("سكان", "inhabitants"), decenni: t("عقود", "decades"),
      attirare: t("جذب", "to attract"), comuni: t("البلديات", "municipalities"), abbandonate: t("مهجورة", "abandoned"),
      ristrutturare: t("ترميم", "to renovate"), "lavoratori da remoto": t("عاملون عن بُعد", "remote workers"), sindaci: t("رؤساء البلديات", "mayors"),
    },
    questions: [
      { id: "q1", prompt: t("بكم تُباع البيوت المهجورة؟", "How much do the abandoned houses cost?"), options: ["Un euro", "Mille euro", "Sono gratis"], answer: 0 },
      { id: "q2", prompt: t("ماذا يجب على المشتري أن يفعل؟", "What must buyers do?"), options: ["Ristrutturare entro tre anni", "Pagare una tassa alta", "Aprire un negozio"], answer: 0 },
      { id: "q3", prompt: t("بماذا يأمل رؤساء البلديات؟", "What do the mayors hope?"), options: ["Che riaprano scuole e negozi", "Che arrivino più turisti", "Che si costruiscano strade"], answer: 0 },
    ],
  },
];
