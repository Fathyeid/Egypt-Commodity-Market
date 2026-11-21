import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const esTexts: TextItem[] = [
  {
    id: "es-l-cafeteria", language: "es", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المقهى", "At the café"),
    lines: [
      "Camarero: ¡Hola! ¿Qué quieres tomar?",
      "Sara: Hola. Un café con leche, por favor.",
      "Camarero: ¿Algo más?",
      "Sara: Sí, una tostada con tomate.",
      "Camarero: Son tres euros cincuenta.",
      "Sara: Aquí tienes. ¡Gracias!",
    ],
    glossary: {
      camarero: t("نادل", "waiter"), "qué quieres tomar": t("ماذا تريد أن تشرب؟", "what would you like?"), "café con leche": t("قهوة بالحليب", "white coffee"),
      "algo más": t("شيء آخر؟", "anything else?"), tostada: t("خبز محمّص", "toast"), tomate: t("طماطم", "tomato"), "aquí tienes": t("تفضّل", "here you are"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا تشرب سارة؟", "What does Sara drink?"), options: ["Un té", "Un café con leche", "Un zumo"], answer: 1 },
      { id: "q2", prompt: t("ماذا تأكل؟", "What does she eat?"), options: ["Una tostada con tomate", "Un bocadillo", "Una ensalada"], answer: 0 },
      { id: "q3", prompt: t("كم دفعت؟", "How much does she pay?"), options: ["2,50 €", "3,50 €", "13,50 €"], answer: 1 },
    ],
  },
  {
    id: "es-l-hotel", language: "es", kind: "listening", genre: "dialogue", level: "A2",
    title: t("في الفندق", "At the hotel"),
    lines: [
      "Recepcionista: Buenas tardes. ¿Tiene una reserva?",
      "Omar: Sí, a nombre de Omar Saleh, para tres noches.",
      "Recepcionista: Perfecto. Su habitación es la 214, en el segundo piso.",
      "Omar: ¿A qué hora es el desayuno?",
      "Recepcionista: De siete a diez, en el restaurante de la planta baja.",
      "Omar: Muy bien, muchas gracias.",
    ],
    glossary: {
      reserva: t("حجز", "reservation"), "a nombre de": t("باسم", "under the name"), noches: t("ليالٍ", "nights"),
      "habitación": t("غرفة", "room"), "segundo piso": t("الطابق الثاني", "second floor"), desayuno: t("الفطور", "breakfast"),
      "planta baja": t("الطابق الأرضي", "ground floor"),
    },
    questions: [
      { id: "q1", prompt: t("كم ليلة سيبقى عمر؟", "How many nights is Omar staying?"), options: ["Dos", "Tres", "Cuatro"], answer: 1 },
      { id: "q2", prompt: t("في أي طابق غرفته؟", "Which floor is his room on?"), options: ["En el primero", "En el segundo", "En el cuarto"], answer: 1 },
      { id: "q3", prompt: t("أين الفطور؟", "Where is breakfast?"), options: ["En la habitación", "En la terraza", "En la planta baja"], answer: 2 },
    ],
  },
  {
    id: "es-l-entrevista", language: "es", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: العمل من البيت", "Interview: working from home"),
    lines: [
      "Periodista: Lucía, trabajas desde casa desde hace dos años. ¿Qué tal la experiencia?",
      "Lucía: En general, muy positiva. Ahorro una hora de transporte cada día.",
      "Periodista: ¿Y lo más difícil?",
      "Lucía: A veces me siento sola. Echo de menos a mis compañeros.",
      "Periodista: ¿Cómo lo solucionas?",
      "Lucía: Voy a la oficina dos días por semana y el resto trabajo en casa.",
    ],
    glossary: {
      "desde hace": t("منذ", "for"), "qué tal": t("كيف", "how is"), ahorro: t("أوفّر", "I save"), transporte: t("المواصلات", "commuting"),
      "lo más difícil": t("أصعب شيء", "the hardest thing"), "me siento sola": t("أشعر بالوحدة", "I feel lonely"),
      "echo de menos": t("أفتقد", "I miss"), "compañeros": t("زملاء", "colleagues"), solucionas: t("تحلّين", "you solve"),
    },
    questions: [
      { id: "q1", prompt: t("كم سنة تعمل لوسيا من البيت؟", "How long has Lucía worked from home?"), options: ["Un año", "Dos años", "Cinco años"], answer: 1 },
      { id: "q2", prompt: t("ما أصعب شيء بالنسبة لها؟", "What is hardest for her?"), options: ["Sentirse sola", "El ruido", "Internet"], answer: 0 },
      { id: "q3", prompt: t("كم يوماً تذهب إلى المكتب؟", "How many days does she go to the office?"), options: ["Ninguno", "Dos días", "Cinco días"], answer: 1 },
    ],
  },
  {
    id: "es-r-familia", language: "es", kind: "reading", genre: "story", level: "A1",
    title: t("عائلتي", "My family"),
    lines: [
      "Me llamo Ahmed y vivo en Madrid con mi familia.",
      "Mi padre es médico y mi madre es profesora.",
      "Tengo una hermana pequeña. Se llama Nour y tiene ocho años.",
      "Los domingos comemos juntos en casa de mis abuelos.",
      "Mi abuela cocina muy bien. ¡Su paella es la mejor!",
    ],
    glossary: {
      vivo: t("أعيش", "I live"), padre: t("أب", "father"), "médico": t("طبيب", "doctor"), madre: t("أم", "mother"), profesora: t("معلّمة", "teacher"),
      "hermana pequeña": t("أخت صغيرة", "little sister"), domingos: t("أيام الأحد", "on Sundays"), juntos: t("معاً", "together"),
      abuelos: t("الجدّان", "grandparents"), cocina: t("تطبخ", "cooks"),
    },
    questions: [
      { id: "q1", prompt: t("ما عمل الأب؟", "What does the father do?"), options: ["Profesor", "Médico", "Cocinero"], answer: 1 },
      { id: "q2", prompt: t("كم عمر نور؟", "How old is Nour?"), options: ["Seis años", "Ocho años", "Diez años"], answer: 1 },
      { id: "q3", prompt: t("أين يأكلون يوم الأحد؟", "Where do they eat on Sundays?"), options: ["En un restaurante", "En casa de los abuelos", "En el parque"], answer: 1 },
    ],
  },
  {
    id: "es-r-curso", language: "es", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: دورة طبخ", "Ad: cooking course"),
    lines: [
      "¿Quieres aprender a cocinar platos típicos españoles?",
      "Nuestro curso empieza el 3 de marzo y dura cuatro semanas.",
      "Las clases son los martes y jueves, de seis a ocho de la tarde.",
      "El precio es de 120 euros e incluye todos los ingredientes.",
      "Las plazas son limitadas: solo hay doce. ¡Inscríbete pronto!",
    ],
    glossary: {
      aprender: t("أن تتعلّم", "to learn"), "platos típicos": t("أطباق تقليدية", "traditional dishes"), empieza: t("يبدأ", "starts"),
      dura: t("يستمر", "lasts"), semanas: t("أسابيع", "weeks"), incluye: t("يشمل", "includes"), ingredientes: t("المكوّنات", "ingredients"),
      plazas: t("أماكن", "places"), "inscríbete": t("سجّل", "sign up"), pronto: t("قريباً / بسرعة", "soon"),
    },
    questions: [
      { id: "q1", prompt: t("كم تستمر الدورة؟", "How long does the course last?"), options: ["Dos semanas", "Cuatro semanas", "Tres meses"], answer: 1 },
      { id: "q2", prompt: t("ما أيام الدروس؟", "Which days are the classes?"), options: ["Lunes y miércoles", "Martes y jueves", "Sábados"], answer: 1 },
      { id: "q3", prompt: t("كم مكاناً متاحاً؟", "How many places are there?"), options: ["Ocho", "Doce", "Veinte"], answer: 1 },
    ],
  },
  {
    id: "es-r-agua", language: "es", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: توفير المياه", "News: saving water"),
    lines: [
      "Después de un verano muy seco, varias ciudades del sur han limitado el uso del agua.",
      "Está prohibido regar los jardines y llenar las piscinas privadas.",
      "Las autoridades piden a los ciudadanos que se duchen en menos de cinco minutos.",
      "Algunos agricultores dicen que las medidas llegan demasiado tarde.",
      "Los expertos recuerdan que la sequía será cada vez más frecuente por el cambio climático.",
    ],
    glossary: {
      seco: t("جاف", "dry"), limitado: t("قيّدت", "restricted"), prohibido: t("ممنوع", "forbidden"), regar: t("ريّ / سقي", "water (plants)"),
      piscinas: t("مسابح", "swimming pools"), autoridades: t("السلطات", "authorities"), "se duchen": t("يستحمّوا", "shower"),
      agricultores: t("مزارعون", "farmers"), medidas: t("الإجراءات", "measures"), "sequía": t("الجفاف", "drought"),
    },
    questions: [
      { id: "q1", prompt: t("ما الممنوع الآن؟", "What is now forbidden?"), options: ["Lavar el coche", "Regar los jardines", "Beber agua del grifo"], answer: 1 },
      { id: "q2", prompt: t("ماذا تطلب السلطات؟", "What do the authorities ask?"), options: ["Duchas cortas", "Comprar agua", "Viajar menos"], answer: 0 },
      { id: "q3", prompt: t("ماذا يقول بعض المزارعين؟", "What do some farmers say?"), options: ["Las medidas llegan tarde", "No hay problema", "Llueve mucho"], answer: 0 },
    ],
  },
];
