import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const jaTexts: TextItem[] = [
  {
    id: "ja-l-konbini", language: "ja", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المتجر الصغير", "At the convenience store"),
    lines: [
      "店員：いらっしゃいませ。",
      "サラ：すみません、おにぎりを二つとお茶をください。",
      "店員：温めますか。",
      "サラ：いいえ、大丈夫です。いくらですか。",
      "店員：四百五十円です。",
      "サラ：はい、どうぞ。ありがとうございます。",
    ],
    glossary: {
      "店員": t("موظّف المتجر", "shop clerk"), "いらっしゃいませ": t("أهلاً بك (ترحيب المتاجر)", "welcome (in shops)"), "すみません": t("عفواً", "excuse me"),
      "おにぎり": t("كرة أرز", "rice ball"), "二つ": t("اثنان", "two"), "お茶": t("شاي", "tea"), "ください": t("من فضلك أعطني", "please give me"),
      "温めますか": t("هل أسخّنها؟", "shall I heat it?"), "大丈夫です": t("لا داعي / لا بأس", "no thanks / it's fine"), "いくらですか": t("كم الثمن؟", "how much is it?"),
      "円": t("ين", "yen"), "どうぞ": t("تفضّل", "here you are"),
    },
    questions: [
      { id: "q1", prompt: t("كم كرة أرز اشترت سارة؟", "How many rice balls does Sara buy?"), options: ["一つ", "二つ", "三つ"], answer: 1 },
      { id: "q2", prompt: t("ماذا تشرب؟", "What does she drink?"), options: ["コーヒー", "お茶", "水"], answer: 1 },
      { id: "q3", prompt: t("كم دفعت؟", "How much does she pay?"), options: ["百五十円", "四百五十円", "五百四十円"], answer: 1 },
    ],
  },
  {
    id: "ja-l-michi", language: "ja", kind: "listening", genre: "dialogue", level: "A2",
    title: t("السؤال عن الطريق", "Asking the way"),
    lines: [
      "観光客：すみません、東京駅はどこですか。",
      "女性：この道をまっすぐ行って、二つ目の信号を右に曲がってください。",
      "観光客：遠いですか。",
      "女性：いいえ、歩いて五分ぐらいです。",
      "観光客：近くにコンビニはありますか。",
      "女性：ええ、駅の前にありますよ。",
    ],
    glossary: {
      "観光客": t("سائح", "tourist"), "東京駅": t("محطة طوكيو", "Tokyo Station"), "どこ": t("أين", "where"), "道": t("الطريق", "road"),
      "まっすぐ": t("مستقيماً", "straight"), "二つ目": t("الثاني", "the second"), "信号": t("إشارة المرور", "traffic light"), "右": t("اليمين", "right"),
      "曲がって": t("انعطف", "turn"), "遠い": t("بعيد", "far"), "歩いて": t("سيراً", "on foot"), "五分": t("خمس دقائق", "five minutes"),
      "近く": t("بالقرب", "nearby"), "コンビニ": t("متجر صغير", "convenience store"), "前": t("أمام", "in front of"),
    },
    questions: [
      { id: "q1", prompt: t("إلى أين يريد السائح أن يذهب؟", "Where does the tourist want to go?"), options: ["東京駅", "新宿駅", "空港"], answer: 0 },
      { id: "q2", prompt: t("في أي اتجاه ينعطف؟", "Which way should he turn?"), options: ["左", "右", "まっすぐ"], answer: 1 },
      { id: "q3", prompt: t("كم يستغرق المشي؟", "How long is the walk?"), options: ["五分", "十五分", "一時間"], answer: 0 },
    ],
  },
  {
    id: "ja-l-intabyu", language: "ja", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: العمل في اليابان", "Interview: working in Japan"),
    lines: [
      "記者：アフマドさんは日本に来てどのくらいですか。",
      "アフマド：三年になります。最初は大学で日本語を勉強しました。",
      "記者：一番大変だったことは何ですか。",
      "アフマド：敬語です。会社では丁寧な話し方が必要なので、苦労しました。",
      "記者：今はどうですか。",
      "アフマド：今はIT企業でエンジニアとして働いています。毎日が楽しいです。",
    ],
    glossary: {
      "記者": t("صحفي", "journalist"), "日本": t("اليابان", "Japan"), "どのくらい": t("كم من الوقت", "how long"), "最初": t("في البداية", "at first"),
      "大学": t("الجامعة", "university"), "日本語": t("اللغة اليابانية", "Japanese"), "勉強しました": t("درستُ", "studied"), "一番": t("الأكثر", "the most"),
      "大変": t("صعب / شاق", "hard"), "敬語": t("لغة الاحترام", "honorific language"), "会社": t("الشركة", "company"), "丁寧": t("مهذّب", "polite"),
      "苦労しました": t("عانيتُ", "struggled"), "企業": t("شركة", "company"), "働いています": t("أعمل", "I work"), "楽しい": t("ممتع", "fun"),
    },
    questions: [
      { id: "q1", prompt: t("منذ متى أحمد في اليابان؟", "How long has Ahmad been in Japan?"), options: ["一年", "三年", "五年"], answer: 1 },
      { id: "q2", prompt: t("ما الذي كان الأصعب؟", "What was hardest?"), options: ["漢字", "敬語", "食べ物"], answer: 1 },
      { id: "q3", prompt: t("ما عمله الآن؟", "What is his job now?"), options: ["先生", "エンジニア", "医者"], answer: 1 },
    ],
  },
  {
    id: "ja-r-ichinichi", language: "ja", kind: "reading", genre: "story", level: "A1",
    title: t("يومي", "My day"),
    lines: [
      "私はマリアムです。大阪に住んでいます。",
      "毎朝七時に起きます。",
      "電車で会社に行きます。",
      "昼ご飯は同僚と食べます。",
      "夜は料理をして、本を読みます。",
    ],
    glossary: {
      "私": t("أنا", "I"), "大阪": t("أوساكا", "Osaka"), "住んでいます": t("أسكن", "I live"), "毎朝": t("كل صباح", "every morning"), "七時": t("الساعة السابعة", "seven o'clock"),
      "起きます": t("أستيقظ", "I get up"), "電車": t("القطار", "train"), "会社": t("الشركة", "company / office"), "行きます": t("أذهب", "I go"),
      "昼ご飯": t("الغداء", "lunch"), "同僚": t("زملاء", "colleagues"), "食べます": t("آكل", "I eat"), "夜": t("الليل / المساء", "evening"),
      "料理": t("الطبخ", "cooking"), "本": t("كتاب", "book"), "読みます": t("أقرأ", "I read"),
    },
    questions: [
      { id: "q1", prompt: t("أين تسكن مريم؟", "Where does Maryam live?"), options: ["東京", "大阪", "京都"], answer: 1 },
      { id: "q2", prompt: t("كيف تذهب إلى العمل؟", "How does she go to work?"), options: ["バス", "電車", "自転車"], answer: 1 },
      { id: "q3", prompt: t("ماذا تفعل مساءً؟", "What does she do in the evening?"), options: ["料理をして本を読む", "テレビを見る", "走る"], answer: 0 },
    ],
  },
  {
    id: "ja-r-oshirase", language: "ja", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: مهرجان صيفي", "Notice: summer festival"),
    lines: [
      "夏祭りのお知らせ",
      "八月十日（土）午後五時から九時まで、駅前の公園で夏祭りがあります。",
      "屋台や盆踊りがあります。",
      "最後に花火を見ることができます。",
      "雨の場合は、次の日に行います。",
    ],
    glossary: {
      "夏祭り": t("مهرجان صيفي", "summer festival"), "お知らせ": t("إعلان", "notice"), "午後": t("بعد الظهر", "p.m."), "駅前": t("أمام المحطة", "in front of the station"),
      "公園": t("حديقة", "park"), "屋台": t("أكشاك طعام", "food stalls"), "盆踊り": t("رقصة بون التقليدية", "Bon dance"), "最後": t("في النهاية", "at the end"),
      "花火": t("ألعاب نارية", "fireworks"), "雨の場合": t("في حال المطر", "in case of rain"), "次の日": t("اليوم التالي", "the next day"),
    },
    questions: [
      { id: "q1", prompt: t("أين المهرجان؟", "Where is the festival?"), options: ["学校", "駅前の公園", "海"], answer: 1 },
      { id: "q2", prompt: t("ماذا يمكن مشاهدته في النهاية؟", "What can you see at the end?"), options: ["映画", "花火", "コンサート"], answer: 1 },
      { id: "q3", prompt: t("ماذا يحدث إذا أمطرت؟", "What happens if it rains?"), options: ["中止", "次の日に行う", "室内で行う"], answer: 1 },
    ],
  },
  {
    id: "ja-r-nyusu", language: "ja", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: القرى والعمل عن بُعد", "News: villages and remote work"),
    lines: [
      "最近、都会から地方に引っ越す若者が増えています。",
      "インターネットがあれば、どこでも仕事ができるようになったからです。",
      "地方は家賃が安く、自然も豊かです。",
      "一方で、病院や店が少ないという問題もあります。",
      "自治体は、新しい住民のために空き家を安く貸しています。",
    ],
    glossary: {
      "最近": t("مؤخراً", "recently"), "都会": t("المدينة الكبيرة", "the city"), "地方": t("الريف / الأقاليم", "the countryside"), "引っ越す": t("ينتقل للسكن", "move house"),
      "若者": t("الشباب", "young people"), "増えています": t("يزداد", "is increasing"), "仕事": t("العمل", "work"), "家賃": t("الإيجار", "rent"), "安く": t("رخيص", "cheap"),
      "自然": t("الطبيعة", "nature"), "一方で": t("من ناحية أخرى", "on the other hand"), "病院": t("مستشفى", "hospital"), "問題": t("مشكلة", "problem"),
      "自治体": t("البلدية", "local government"), "住民": t("السكان", "residents"), "空き家": t("بيوت فارغة", "empty houses"), "貸しています": t("يؤجّر", "rent out"),
    },
    questions: [
      { id: "q1", prompt: t("لماذا ينتقل الشباب إلى الريف؟", "Why are young people moving to the countryside?"), options: ["どこでも仕事ができるから", "仕事がないから", "大学が多いから"], answer: 0 },
      { id: "q2", prompt: t("ما المشكلة في الريف؟", "What is the problem in the countryside?"), options: ["家賃が高い", "病院や店が少ない", "人が多すぎる"], answer: 1 },
      { id: "q3", prompt: t("ماذا تفعل البلديات؟", "What are local governments doing?"), options: ["空き家を安く貸す", "新しい駅を作る", "税金を上げる"], answer: 0 },
    ],
  },
];
