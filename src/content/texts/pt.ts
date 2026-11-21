import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const ptTexts: TextItem[] = [
  {
    id: "pt-l-padaria", language: "pt", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المخبز", "At the bakery"),
    lines: [
      "Atendente: Bom dia! O que você deseja?",
      "Hassan: Bom dia. Quatro pães de queijo e um suco de laranja, por favor.",
      "Atendente: Mais alguma coisa?",
      "Hassan: Não, só isso. Quanto é?",
      "Atendente: Doze reais.",
      "Hassan: Aqui está. Obrigado!",
    ],
    glossary: {
      atendente: t("موظّف", "attendant"), "o que você deseja": t("ماذا تريد؟", "what would you like?"), "pães de queijo": t("خبز بالجبن", "cheese breads"),
      "suco de laranja": t("عصير برتقال", "orange juice"), "mais alguma coisa": t("شيء آخر؟", "anything else?"), "só isso": t("هذا فقط", "that's all"),
      "quanto é": t("كم الحساب؟", "how much is it?"), "aqui está": t("تفضّل", "here you are"),
    },
    questions: [
      { id: "q1", prompt: t("كم خبزة بالجبن اشترى حسن؟", "How many cheese breads does Hassan buy?"), options: ["Dois", "Quatro", "Seis"], answer: 1 },
      { id: "q2", prompt: t("ماذا يشرب؟", "What does he drink?"), options: ["Café", "Suco de laranja", "Água"], answer: 1 },
      { id: "q3", prompt: t("كم دفع؟", "How much does he pay?"), options: ["Dez reais", "Doze reais", "Vinte reais"], answer: 1 },
    ],
  },
  {
    id: "pt-l-onibus", language: "pt", kind: "listening", genre: "dialogue", level: "A2",
    title: t("أي حافلة؟", "Which bus?"),
    lines: [
      "Mariana: Com licença, este ônibus vai para a praia de Copacabana?",
      "Motorista: Não, você precisa pegar o 474. O ponto fica do outro lado da rua.",
      "Mariana: E demora muito?",
      "Motorista: Uns vinte minutos, se não tiver trânsito.",
      "Mariana: Posso pagar com cartão?",
      "Motorista: Pode, sim. Boa viagem!",
    ],
    glossary: {
      "com licença": t("عفواً", "excuse me"), "ônibus": t("حافلة", "bus"), praia: t("شاطئ", "beach"), motorista: t("السائق", "driver"),
      pegar: t("تأخذ / تركب", "take / catch"), ponto: t("موقف الحافلة", "bus stop"), "do outro lado": t("على الجانب الآخر", "on the other side"),
      demora: t("يستغرق", "take (time)"), "trânsito": t("زحمة المرور", "traffic"), "cartão": t("بطاقة", "card"),
    },
    questions: [
      { id: "q1", prompt: t("إلى أين تريد ماريانا أن تذهب؟", "Where does Mariana want to go?"), options: ["Ao aeroporto", "À praia", "Ao centro"], answer: 1 },
      { id: "q2", prompt: t("أي حافلة يجب أن تأخذ؟", "Which bus should she take?"), options: ["O 474", "O 147", "O 744"], answer: 0 },
      { id: "q3", prompt: t("كم تستغرق الرحلة؟", "How long is the trip?"), options: ["Cinco minutos", "Vinte minutos", "Uma hora"], answer: 1 },
    ],
  },
  {
    id: "pt-l-entrevista", language: "pt", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: متطوّعة في المدرسة", "Interview: a school volunteer"),
    lines: [
      "Repórter: Dona Ana, a senhora ensina leitura para crianças como voluntária. Por quê?",
      "Ana: Quando me aposentei, quis fazer algo útil com o meu tempo.",
      "Repórter: Quantas crianças a senhora acompanha?",
      "Ana: Doze, duas vezes por semana, na biblioteca do bairro.",
      "Repórter: O que é mais gratificante?",
      "Ana: Ver uma criança terminar o primeiro livro sozinha. Não tem preço!",
    ],
    glossary: {
      ensina: t("تعلّم", "teaches"), leitura: t("القراءة", "reading"), "voluntária": t("متطوّعة", "volunteer"), "me aposentei": t("تقاعدت", "I retired"),
      "útil": t("مفيد", "useful"), acompanha: t("تتابعين", "you follow / mentor"), biblioteca: t("مكتبة", "library"), bairro: t("الحي", "neighbourhood"),
      gratificante: t("مُرضٍ", "rewarding"), "não tem preço": t("لا يُقدَّر بثمن", "priceless"),
    },
    questions: [
      { id: "q1", prompt: t("لماذا بدأت آنا التطوّع؟", "Why did Ana start volunteering?"), options: ["Porque se aposentou", "Por dinheiro", "Porque é professora"], answer: 0 },
      { id: "q2", prompt: t("كم طفلاً تتابع؟", "How many children does she mentor?"), options: ["Duas", "Doze", "Vinte"], answer: 1 },
      { id: "q3", prompt: t("أين تتم الدروس؟", "Where are the sessions?"), options: ["Na escola", "Na biblioteca do bairro", "Na casa dela"], answer: 1 },
    ],
  },
  {
    id: "pt-r-rotina", language: "pt", kind: "reading", genre: "story", level: "A1",
    title: t("روتين يوسف", "Youssef's routine"),
    lines: [
      "Eu me chamo Youssef e moro em Lisboa.",
      "Acordo às seis e meia e tomo café com pão e manteiga.",
      "Vou para a universidade de metrô.",
      "Estudo engenharia. À tarde, jogo futebol com os meus amigos.",
      "À noite, ligo para a minha família no Egito.",
    ],
    glossary: {
      moro: t("أسكن", "I live"), acordo: t("أستيقظ", "I wake up"), manteiga: t("زبدة", "butter"), "universidade": t("الجامعة", "university"),
      "metrô": t("المترو", "metro"), engenharia: t("الهندسة", "engineering"), "à tarde": t("بعد الظهر", "in the afternoon"),
      "à noite": t("ليلاً", "at night"), ligo: t("أتصل", "I call"),
    },
    questions: [
      { id: "q1", prompt: t("أين يسكن يوسف؟", "Where does Youssef live?"), options: ["No Porto", "Em Lisboa", "No Rio"], answer: 1 },
      { id: "q2", prompt: t("ماذا يدرس؟", "What does he study?"), options: ["Medicina", "Engenharia", "Direito"], answer: 1 },
      { id: "q3", prompt: t("ماذا يفعل ليلاً؟", "What does he do at night?"), options: ["Joga futebol", "Liga para a família", "Trabalha"], answer: 1 },
    ],
  },
  {
    id: "pt-r-academia", language: "pt", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: نادٍ رياضي جديد", "Ad: a new gym"),
    lines: [
      "Inauguração da Academia Movimento no centro da cidade!",
      "Temos aulas de natação, ioga e dança para todas as idades.",
      "Abrimos de segunda a sábado, das 6h às 22h.",
      "A mensalidade custa 90 reais, mas no primeiro mês você paga só a metade.",
      "Traga um amigo e ganhe uma semana grátis!",
    ],
    glossary: {
      "inauguração": t("افتتاح", "opening"), academia: t("نادٍ رياضي", "gym"), aulas: t("حصص", "classes"), "natação": t("السباحة", "swimming"),
      idades: t("الأعمار", "ages"), mensalidade: t("الاشتراك الشهري", "monthly fee"), metade: t("النصف", "half"), traga: t("أحضر", "bring"),
      ganhe: t("اربح / احصل على", "get / win"), "grátis": t("مجاناً", "free"),
    },
    questions: [
      { id: "q1", prompt: t("متى يكون النادي مغلقاً؟", "When is the gym closed?"), options: ["No domingo", "Na segunda", "No sábado"], answer: 0 },
      { id: "q2", prompt: t("كم تدفع في الشهر الأول؟", "How much do you pay in the first month?"), options: ["45 reais", "90 reais", "Nada"], answer: 0 },
      { id: "q3", prompt: t("ماذا تربح إذا أحضرت صديقاً؟", "What do you get if you bring a friend?"), options: ["Uma camiseta", "Uma semana grátis", "Um mês grátis"], answer: 1 },
    ],
  },
  {
    id: "pt-r-feiras", language: "pt", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: أسواق المنتجات المحلية", "News: local produce markets"),
    lines: [
      "As feiras de produtos orgânicos estão cada vez mais populares nas grandes cidades.",
      "Os consumidores dizem que preferem comprar diretamente dos pequenos produtores.",
      "Os preços costumam ser um pouco mais altos do que no supermercado.",
      "Mesmo assim, muitos acham que vale a pena pela qualidade e pelo sabor.",
      "Para os agricultores, as feiras representam uma renda mais justa.",
    ],
    glossary: {
      feiras: t("أسواق شعبية", "markets / fairs"), "orgânicos": t("عضوية", "organic"), "cada vez mais": t("أكثر فأكثر", "more and more"),
      consumidores: t("المستهلكون", "consumers"), diretamente: t("مباشرةً", "directly"), produtores: t("المنتجون", "producers"),
      costumam: t("عادةً ما", "usually"), "mesmo assim": t("ومع ذلك", "even so"), "vale a pena": t("يستحق", "it's worth it"), renda: t("دخل", "income"),
    },
    questions: [
      { id: "q1", prompt: t("ممّن يفضّل المستهلكون الشراء؟", "Who do consumers prefer to buy from?"), options: ["Grandes empresas", "Pequenos produtores", "Lojas online"], answer: 1 },
      { id: "q2", prompt: t("كيف الأسعار مقارنة بالسوبرماركت؟", "How are prices compared to the supermarket?"), options: ["Um pouco mais altos", "Muito mais baixos", "Iguais"], answer: 0 },
      { id: "q3", prompt: t("ماذا تعني الأسواق للمزارعين؟", "What do the markets mean for farmers?"), options: ["Uma renda mais justa", "Mais trabalho sem lucro", "Menos clientes"], answer: 0 },
    ],
  },
];
