import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const zhTexts: TextItem[] = [
  {
    id: "zh-l-kafei", language: "zh", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المقهى", "At the café"),
    lines: [
      "服务员：你好！你要喝什么？",
      "李明：你好。我要一杯咖啡和一个面包。",
      "服务员：热的还是冰的？",
      "李明：热的，谢谢。多少钱？",
      "服务员：一共三十块。",
      "李明：给你。谢谢！",
    ],
    glossary: {
      "服务员": t("نادل", "waiter"), "你好": t("مرحباً", "hello"), "喝": t("يشرب", "drink"), "什么": t("ماذا", "what"), "咖啡": t("قهوة", "coffee"),
      "面包": t("خبز", "bread"), "热的": t("ساخن", "hot"), "冰的": t("مثلّج", "iced"), "谢谢": t("شكراً", "thank you"), "多少钱": t("كم الثمن؟", "how much?"),
      "一共": t("المجموع", "in total"), "块": t("يوان (عامّي)", "yuan (colloquial)"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا يشرب لي مينغ؟", "What does Li Ming drink?"), options: ["茶", "咖啡", "果汁"], answer: 1 },
      { id: "q2", prompt: t("ساخن أم مثلّج؟", "Hot or iced?"), options: ["热的", "冰的", "都不要"], answer: 0 },
      { id: "q3", prompt: t("كم دفع؟", "How much does he pay?"), options: ["十三块", "三十块", "三百块"], answer: 1 },
    ],
  },
  {
    id: "zh-l-huoche", language: "zh", kind: "listening", genre: "dialogue", level: "A2",
    title: t("شراء تذكرة قطار", "Buying a train ticket"),
    lines: [
      "王丽：你好，我想买一张去上海的票。",
      "售票员：今天还是明天？",
      "王丽：明天上午的。",
      "售票员：九点有一班高铁，二等座五百五十块。",
      "王丽：好的，可以用手机付款吗？",
      "售票员：可以。这是你的票，祝你旅途愉快！",
    ],
    glossary: {
      "想": t("أريد", "would like"), "买": t("يشتري", "buy"), "张": t("(مُعدِّد للتذاكر)", "(measure word for tickets)"), "上海": t("شنغهاي", "Shanghai"),
      "票": t("تذكرة", "ticket"), "售票员": t("بائع التذاكر", "ticket seller"), "明天": t("غداً", "tomorrow"), "上午": t("صباحاً", "morning"),
      "高铁": t("القطار السريع", "high-speed train"), "二等座": t("الدرجة الثانية", "second class"), "手机": t("الهاتف المحمول", "mobile phone"),
      "付款": t("الدفع", "pay"), "旅途愉快": t("رحلة سعيدة", "have a good trip"),
    },
    questions: [
      { id: "q1", prompt: t("إلى أين تسافر وانغ لي؟", "Where is Wang Li going?"), options: ["北京", "上海", "广州"], answer: 1 },
      { id: "q2", prompt: t("متى تسافر؟", "When does she travel?"), options: ["今天下午", "明天上午", "明天晚上"], answer: 1 },
      { id: "q3", prompt: t("كيف تدفع؟", "How does she pay?"), options: ["现金", "手机", "信用卡"], answer: 1 },
    ],
  },
  {
    id: "zh-l-caifang", language: "zh", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: الدراسة في الخارج", "Interview: studying abroad"),
    lines: [
      "记者：阿里，你在北京学习中文多长时间了？",
      "阿里：已经两年了。我很喜欢这里的生活。",
      "记者：刚来的时候，什么最难？",
      "阿里：声调最难。我常常把“买”和“卖”说错。",
      "记者：现在呢？",
      "阿里：现在我可以用中文工作了，在一家旅行社当翻译。",
    ],
    glossary: {
      "记者": t("صحفي", "journalist"), "学习": t("يدرس", "study"), "中文": t("اللغة الصينية", "Chinese"), "多长时间": t("كم من الوقت", "how long"),
      "已经": t("بالفعل", "already"), "生活": t("الحياة", "life"), "刚来的时候": t("عندما وصلت أول مرة", "when I first came"), "最难": t("الأصعب", "the hardest"),
      "声调": t("النغمات", "tones"), "卖": t("يبيع", "sell"), "工作": t("يعمل", "work"), "旅行社": t("وكالة سفر", "travel agency"), "翻译": t("مترجم", "translator"),
    },
    questions: [
      { id: "q1", prompt: t("منذ متى يدرس علي الصينية؟", "How long has Ali studied Chinese?"), options: ["一年", "两年", "五年"], answer: 1 },
      { id: "q2", prompt: t("ما الذي كان الأصعب؟", "What was hardest?"), options: ["汉字", "声调", "语法"], answer: 1 },
      { id: "q3", prompt: t("ما عمله الآن؟", "What is his job now?"), options: ["老师", "翻译", "医生"], answer: 1 },
    ],
  },
  {
    id: "zh-r-jia", language: "zh", kind: "reading", genre: "story", level: "A1",
    title: t("عائلتي", "My family"),
    lines: [
      "我叫小月，我家有四口人。",
      "爸爸是医生，妈妈是老师。",
      "我有一个弟弟，他八岁。",
      "周末我们常常去公园。",
      "我很爱我的家。",
    ],
    glossary: {
      "我叫": t("اسمي", "my name is"), "家": t("العائلة / البيت", "family / home"), "口人": t("أفراد (للعائلة)", "people (in a family)"), "爸爸": t("أبي", "dad"),
      "医生": t("طبيب", "doctor"), "妈妈": t("أمي", "mum"), "老师": t("معلّم", "teacher"), "弟弟": t("أخ أصغر", "younger brother"), "岁": t("سنة (العمر)", "years old"),
      "周末": t("عطلة نهاية الأسبوع", "weekend"), "常常": t("غالباً", "often"), "公园": t("حديقة", "park"), "爱": t("يحب", "love"),
    },
    questions: [
      { id: "q1", prompt: t("كم فرداً في عائلة شياو يويه؟", "How many people are in Xiaoyue's family?"), options: ["三口人", "四口人", "五口人"], answer: 1 },
      { id: "q2", prompt: t("ما عمل الأم؟", "What does her mother do?"), options: ["医生", "老师", "司机"], answer: 1 },
      { id: "q3", prompt: t("أين يذهبون في عطلة نهاية الأسبوع؟", "Where do they go at the weekend?"), options: ["公园", "商店", "学校"], answer: 0 },
    ],
  },
  {
    id: "zh-r-tongzhi", language: "zh", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: المكتبة", "Notice: the library"),
    lines: [
      "图书馆开放时间：星期二到星期日，上午九点到晚上八点。",
      "星期一闭馆。",
      "每人每次可以借五本书，借期是三十天。",
      "馆内不能吃东西，也不能大声说话。",
      "办借书证需要带护照或身份证。",
    ],
    glossary: {
      "图书馆": t("مكتبة", "library"), "开放时间": t("أوقات العمل", "opening hours"), "星期二": t("الثلاثاء", "Tuesday"), "星期日": t("الأحد", "Sunday"),
      "星期一": t("الاثنين", "Monday"), "闭馆": t("مغلق", "closed"), "借": t("يستعير", "borrow"), "本": t("(مُعدِّد للكتب)", "(measure word for books)"),
      "借期": t("مدة الإعارة", "loan period"), "不能": t("لا يجوز", "must not"), "大声": t("بصوت عالٍ", "loudly"), "借书证": t("بطاقة المكتبة", "library card"),
      "护照": t("جواز سفر", "passport"), "身份证": t("بطاقة هوية", "ID card"),
    },
    questions: [
      { id: "q1", prompt: t("متى تكون المكتبة مغلقة؟", "When is the library closed?"), options: ["星期一", "星期六", "星期日"], answer: 0 },
      { id: "q2", prompt: t("كم كتاباً يمكن استعارته؟", "How many books can you borrow?"), options: ["三本", "五本", "十本"], answer: 1 },
      { id: "q3", prompt: t("ماذا تحتاج لبطاقة المكتبة؟", "What do you need for a library card?"), options: ["照片", "护照或身份证", "钱"], answer: 1 },
    ],
  },
  {
    id: "zh-r-xinwen", language: "zh", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: الدراجات المشتركة", "News: shared bikes"),
    lines: [
      "这几年，共享单车在中国的大城市越来越受欢迎。",
      "人们用手机扫码就能骑车，不用自己买车。",
      "很多上班族骑车去地铁站，节省了时间。",
      "但是，有些单车被随便停在路边，影响了交通。",
      "现在，城市规定了专门的停车区域。",
    ],
    glossary: {
      "共享单车": t("الدراجات المشتركة", "shared bikes"), "城市": t("مدينة", "city"), "越来越": t("أكثر فأكثر", "more and more"), "受欢迎": t("محبوب / شائع", "popular"),
      "扫码": t("مسح الرمز", "scan a code"), "骑车": t("ركوب الدراجة", "ride a bike"), "上班族": t("الموظفون", "office workers"), "地铁站": t("محطة المترو", "metro station"),
      "节省": t("يوفّر", "save"), "随便": t("عشوائياً", "carelessly"), "影响": t("يؤثّر", "affect"), "交通": t("المرور", "traffic"), "规定": t("حدّدت", "set rules"),
      "停车区域": t("مناطق الركن", "parking areas"),
    },
    questions: [
      { id: "q1", prompt: t("كيف يستخدم الناس الدراجات؟", "How do people use the bikes?"), options: ["用手机扫码", "去商店买票", "打电话"], answer: 0 },
      { id: "q2", prompt: t("ما المشكلة؟", "What is the problem?"), options: ["车太贵", "车被随便停在路边", "没有人骑"], answer: 1 },
      { id: "q3", prompt: t("ماذا فعلت المدن؟", "What have the cities done?"), options: ["规定了停车区域", "禁止了单车", "建了新地铁"], answer: 0 },
    ],
  },
];
