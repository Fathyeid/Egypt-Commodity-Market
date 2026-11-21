import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const trTexts: TextItem[] = [
  {
    id: "tr-l-cayevi", language: "tr", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المقهى", "At the tea house"),
    lines: [
      "Garson: Hoş geldiniz! Ne alırsınız?",
      "Ali: İki çay ve bir simit, lütfen.",
      "Garson: Başka bir şey ister misiniz?",
      "Ali: Hayır, teşekkürler. Hesap ne kadar?",
      "Garson: Elli lira.",
      "Ali: Buyurun, iyi günler!",
    ],
    glossary: {
      garson: t("نادل", "waiter"), "hoş geldiniz": t("أهلاً وسهلاً", "welcome"), "ne alırsınız": t("ماذا تطلبون؟", "what will you have?"),
      "çay": t("شاي", "tea"), simit: t("سميط (كعك بالسمسم)", "sesame bread ring"), "başka bir şey": t("شيء آخر", "something else"),
      hesap: t("الحساب", "the bill"), "ne kadar": t("كم", "how much"), buyurun: t("تفضّل", "here you are"), "iyi günler": t("يوماً سعيداً", "have a nice day"),
    },
    questions: [
      { id: "q1", prompt: t("كم كوب شاي طلب علي؟", "How many teas does Ali order?"), options: ["Bir", "İki", "Üç"], answer: 1 },
      { id: "q2", prompt: t("ماذا طلب أيضاً؟", "What else does he order?"), options: ["Bir simit", "Bir kahve", "Bir börek"], answer: 0 },
      { id: "q3", prompt: t("كم الحساب؟", "How much is the bill?"), options: ["On beş lira", "Elli lira", "Yüz lira"], answer: 1 },
    ],
  },
  {
    id: "tr-l-yol", language: "tr", kind: "listening", genre: "dialogue", level: "A2",
    title: t("السؤال عن الطريق", "Asking the way"),
    lines: [
      "Turist: Affedersiniz, Galata Kulesi'ne nasıl gidebilirim?",
      "Kadın: Düz gidin, sonra ikinci sokaktan sola dönün.",
      "Turist: Uzak mı?",
      "Kadın: Hayır, yürüyerek on dakika sürer.",
      "Turist: Yolda bir eczane var mı?",
      "Kadın: Evet, köşede bir eczane var. Kolay gelsin!",
    ],
    glossary: {
      affedersiniz: t("عفواً", "excuse me"), "nasıl gidebilirim": t("كيف يمكنني الذهاب؟", "how can I get to"), "düz gidin": t("امشِ مستقيماً", "go straight"),
      "ikinci sokaktan": t("من الشارع الثاني", "at the second street"), "sola dönün": t("انعطف يساراً", "turn left"), uzak: t("بعيد", "far"),
      "yürüyerek": t("سيراً على الأقدام", "on foot"), "sürer": t("يستغرق", "takes"), eczane: t("صيدلية", "pharmacy"), "köşede": t("عند الزاوية", "on the corner"),
    },
    questions: [
      { id: "q1", prompt: t("إلى أين يريد السائح أن يذهب؟", "Where does the tourist want to go?"), options: ["Galata Kulesi", "Ayasofya", "Taksim"], answer: 0 },
      { id: "q2", prompt: t("في أي اتجاه ينعطف؟", "Which way should he turn?"), options: ["Sağa", "Sola", "Geri"], answer: 1 },
      { id: "q3", prompt: t("كم يستغرق المشي؟", "How long is the walk?"), options: ["Beş dakika", "On dakika", "Bir saat"], answer: 1 },
    ],
  },
  {
    id: "tr-l-roportaj", language: "tr", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: مُصمِّمة شابة", "Interview: a young designer"),
    lines: [
      "Muhabir: Elif Hanım, kendi markanızı kurdunuz. Bu fikir nereden çıktı?",
      "Elif: Üniversitede moda tasarımı okudum ve hep geleneksel kumaşları sevdim.",
      "Muhabir: En büyük zorluk neydi?",
      "Elif: İlk yıl müşteri bulmak çok zordu. Ürünlerimi internette satmaya başladım.",
      "Muhabir: Şimdi durum nasıl?",
      "Elif: Artık on iki ülkeye satış yapıyoruz ve beş kişi çalışıyor.",
    ],
    glossary: {
      "markanızı": t("علامتك التجارية", "your brand"), "kurdunuz": t("أسستِ", "you founded"), "nereden çıktı": t("من أين جاءت", "where did it come from"),
      "moda tasarımı": t("تصميم الأزياء", "fashion design"), geleneksel: t("تقليدي", "traditional"), "kumaşları": t("الأقمشة", "fabrics"),
      zorluk: t("صعوبة", "difficulty"), "müşteri": t("زبون", "customer"), "ürünlerimi": t("منتجاتي", "my products"), "ülkeye": t("دولة", "countries"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا درست أليف؟", "What did Elif study?"), options: ["Mühendislik", "Moda tasarımı", "Tıp"], answer: 1 },
      { id: "q2", prompt: t("ما الذي كان صعباً في السنة الأولى؟", "What was hard in the first year?"), options: ["Müşteri bulmak", "Kumaş bulmak", "Ofis bulmak"], answer: 0 },
      { id: "q3", prompt: t("إلى كم دولة تبيع الآن؟", "How many countries do they sell to now?"), options: ["Beş", "On iki", "Yirmi"], answer: 1 },
    ],
  },
  {
    id: "tr-r-aile", language: "tr", kind: "reading", genre: "story", level: "A1",
    title: t("عائلة زينب", "Zeynep's family"),
    lines: [
      "Benim adım Zeynep. İzmir'de yaşıyorum.",
      "Annem öğretmen, babam doktor.",
      "Bir erkek kardeşim var. Adı Emre ve on yaşında.",
      "Hafta sonu denize gidiyoruz.",
      "Akşamları birlikte yemek yiyoruz ve televizyon izliyoruz.",
    ],
    glossary: {
      "yaşıyorum": t("أعيش", "I live"), annem: t("أمي", "my mother"), "öğretmen": t("معلّمة", "teacher"), babam: t("أبي", "my father"),
      "erkek kardeşim": t("أخي", "my brother"), "on yaşında": t("عمره عشر سنوات", "ten years old"), "hafta sonu": t("عطلة نهاية الأسبوع", "at the weekend"),
      denize: t("إلى البحر", "to the sea"), "akşamları": t("في المساء", "in the evenings"), birlikte: t("معاً", "together"),
    },
    questions: [
      { id: "q1", prompt: t("أين تعيش زينب؟", "Where does Zeynep live?"), options: ["İstanbul'da", "İzmir'de", "Ankara'da"], answer: 1 },
      { id: "q2", prompt: t("ما عمل الأب؟", "What does her father do?"), options: ["Öğretmen", "Doktor", "Aşçı"], answer: 1 },
      { id: "q3", prompt: t("أين يذهبون في عطلة نهاية الأسبوع؟", "Where do they go at the weekend?"), options: ["Denize", "Dağa", "Sinemaya"], answer: 0 },
    ],
  },
  {
    id: "tr-r-ilan", language: "tr", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: دورة لغة إنجليزية", "Ad: English course"),
    lines: [
      "Yeni İngilizce kursumuz 10 Ekim'de başlıyor.",
      "Dersler salı ve perşembe akşamları, saat 19:00 ile 21:00 arasında.",
      "Kurs üç ay sürüyor ve kitaplar ücretsiz.",
      "Öğrenciler için yüzde yirmi indirim var.",
      "Kayıt için web sitemizi ziyaret edin veya bizi arayın.",
    ],
    glossary: {
      kurs: t("دورة", "course"), "başlıyor": t("يبدأ", "starts"), dersler: t("الدروس", "lessons"), "arasında": t("بين", "between"),
      "sürüyor": t("يستمر", "lasts"), "ücretsiz": t("مجاني", "free"), "indirim": t("خصم", "discount"), "kayıt": t("التسجيل", "registration"),
      "ziyaret edin": t("زوروا", "visit"), "arayın": t("اتصلوا", "call"),
    },
    questions: [
      { id: "q1", prompt: t("متى تبدأ الدورة؟", "When does the course start?"), options: ["10 Ekim", "1 Ekim", "10 Kasım"], answer: 0 },
      { id: "q2", prompt: t("كم تستمر الدورة؟", "How long does the course last?"), options: ["Bir ay", "Üç ay", "Bir yıl"], answer: 1 },
      { id: "q3", prompt: t("كم خصم الطلاب؟", "What is the student discount?"), options: ["Yüzde on", "Yüzde yirmi", "Yüzde elli"], answer: 1 },
    ],
  },
  {
    id: "tr-r-haber", language: "tr", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: الدراجات في المدينة", "News: bikes in the city"),
    lines: [
      "Belediye, şehir merkezinde yeni bisiklet yolları açtı.",
      "Proje sayesinde trafikte geçen süre azalacak ve hava kirliliği düşecek.",
      "Bazı esnaf, otoparkların azalmasından şikâyet ediyor.",
      "Belediye ise yaya sayısının arttığını ve dükkânlara daha çok insan geldiğini söylüyor.",
      "Gelecek yıl yolların iki katına çıkarılması planlanıyor.",
    ],
    glossary: {
      belediye: t("البلدية", "municipality"), "bisiklet yolları": t("مسارات الدراجات", "cycle lanes"), "sayesinde": t("بفضل", "thanks to"),
      "azalacak": t("سيقلّ", "will decrease"), "hava kirliliği": t("تلوّث الهواء", "air pollution"), esnaf: t("أصحاب المحلات", "shopkeepers"),
      "şikâyet ediyor": t("يشتكون", "complain"), yaya: t("المشاة", "pedestrians"), "dükkânlara": t("إلى المحلات", "to the shops"), "iki katına": t("الضعف", "double"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا فتحت البلدية؟", "What did the municipality open?"), options: ["Bisiklet yolları", "Yeni otoparklar", "Bir metro hattı"], answer: 0 },
      { id: "q2", prompt: t("ممّ يشتكي بعض أصحاب المحلات؟", "What do some shopkeepers complain about?"), options: ["Daha az otopark", "Gürültü", "Yüksek kira"], answer: 0 },
      { id: "q3", prompt: t("ما الخطة للعام القادم؟", "What is planned for next year?"), options: ["Yolları kapatmak", "Yolları iki katına çıkarmak", "Bisikletleri yasaklamak"], answer: 1 },
    ],
  },
];
