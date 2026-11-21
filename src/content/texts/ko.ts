import type { L10n } from "../types";
import type { TextItem } from "./types";

const t = (ar: string, en: string): L10n => ({ ar, en });

export const koTexts: TextItem[] = [
  {
    id: "ko-l-kape", language: "ko", kind: "listening", genre: "dialogue", level: "A1",
    title: t("في المقهى", "At the café"),
    lines: [
      "직원: 어서 오세요. 뭐 드릴까요?",
      "민수: 아이스 아메리카노 한 잔 주세요.",
      "직원: 사이즈는 어떻게 해 드릴까요?",
      "민수: 큰 걸로 주세요. 얼마예요?",
      "직원: 오천 원입니다.",
      "민수: 여기 있어요. 감사합니다.",
    ],
    glossary: {
      "직원": t("موظّف", "staff"), "어서 오세요": t("أهلاً وسهلاً", "welcome"), "뭐 드릴까요": t("ماذا تريد؟", "what can I get you?"),
      "아이스": t("مثلّج", "iced"), "한 잔": t("كوب واحد", "one cup"), "주세요": t("من فضلك أعطني", "please give me"), "사이즈는": t("الحجم", "the size"),
      "큰 걸로": t("الكبير", "a large one"), "얼마예요": t("كم الثمن؟", "how much is it?"), "오천 원입니다": t("خمسة آلاف وون", "it's 5,000 won"),
      "여기 있어요": t("تفضّل", "here you are"), "감사합니다": t("شكراً", "thank you"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا طلب مين سو؟", "What does Minsu order?"), options: ["녹차", "아이스 아메리카노", "우유"], answer: 1 },
      { id: "q2", prompt: t("أي حجم؟", "Which size?"), options: ["작은 것", "큰 것", "중간"], answer: 1 },
      { id: "q3", prompt: t("كم دفع؟", "How much does he pay?"), options: ["오백 원", "오천 원", "오만 원"], answer: 1 },
    ],
  },
  {
    id: "ko-l-byeongwon", language: "ko", kind: "listening", genre: "dialogue", level: "A2",
    title: t("موعد في المستشفى", "Hospital appointment"),
    lines: [
      "간호사: 네, 서울병원입니다.",
      "레일라: 안녕하세요. 진료 예약을 하고 싶어요.",
      "간호사: 어디가 아프세요?",
      "레일라: 이틀 전부터 머리가 아프고 열이 나요.",
      "간호사: 내일 오후 두 시에 오실 수 있어요?",
      "레일라: 네, 괜찮아요. 감사합니다.",
    ],
    glossary: {
      "간호사": t("ممرّضة", "nurse"), "서울병원입니다": t("مستشفى سيول", "this is Seoul Hospital"), "진료": t("كشف طبي", "medical consultation"),
      "예약을": t("حجز", "a reservation"), "하고 싶어요": t("أريد أن أفعل", "I want to do"), "어디가 아프세요": t("أين يؤلمك؟", "where does it hurt?"),
      "이틀 전부터": t("منذ يومين", "since two days ago"), "머리가": t("الرأس", "head"), "열이 나요": t("عندي حمّى", "I have a fever"), "내일": t("غداً", "tomorrow"),
      "오후": t("بعد الظهر", "afternoon"), "괜찮아요": t("مناسب / لا بأس", "that's fine"),
    },
    questions: [
      { id: "q1", prompt: t("لماذا تتصل ليلى؟", "Why is Leila calling?"), options: ["진료 예약", "식당 예약", "택시"], answer: 0 },
      { id: "q2", prompt: t("ما مشكلتها؟", "What is her problem?"), options: ["배가 아파요", "머리가 아프고 열이 나요", "다리가 아파요"], answer: 1 },
      { id: "q3", prompt: t("متى الموعد؟", "When is the appointment?"), options: ["오늘 오후 두 시", "내일 오후 두 시", "내일 오전 열 시"], answer: 1 },
    ],
  },
  {
    id: "ko-l-inteobyu", language: "ko", kind: "listening", genre: "interview", level: "B1",
    title: t("مقابلة: طالبة في كوريا", "Interview: a student in Korea"),
    lines: [
      "기자: 누르 씨는 한국에 온 지 얼마나 됐어요?",
      "누르: 이 년 됐어요. 처음에는 한국어 학원에 다녔어요.",
      "기자: 뭐가 제일 어려웠어요?",
      "누르: 존댓말이요. 나이에 따라 말이 달라져서 많이 헷갈렸어요.",
      "기자: 지금은 어때요?",
      "누르: 지금은 대학원에서 디자인을 공부하고 아르바이트도 해요.",
    ],
    glossary: {
      "기자": t("صحفي", "reporter"), "한국에": t("إلى كوريا", "to Korea"), "얼마나 됐어요": t("كم مضى من الوقت؟", "how long has it been?"),
      "처음에는": t("في البداية", "at first"), "한국어": t("اللغة الكورية", "Korean"), "학원에": t("إلى معهد", "to a private academy"),
      "제일": t("الأكثر", "the most"), "어려웠어요": t("كان صعباً", "was difficult"), "존댓말이요": t("لغة الاحترام", "honorific speech"),
      "나이에 따라": t("حسب العمر", "depending on age"), "헷갈렸어요": t("ارتبكتُ", "got confused"), "대학원에서": t("في الدراسات العليا", "at graduate school"),
      "아르바이트도": t("عملاً جزئياً أيضاً", "a part-time job too"),
    },
    questions: [
      { id: "q1", prompt: t("منذ متى نور في كوريا؟", "How long has Nour been in Korea?"), options: ["일 년", "이 년", "오 년"], answer: 1 },
      { id: "q2", prompt: t("ما الذي كان الأصعب؟", "What was hardest?"), options: ["음식", "존댓말", "날씨"], answer: 1 },
      { id: "q3", prompt: t("ماذا تدرس الآن؟", "What does she study now?"), options: ["의학", "디자인", "경제"], answer: 1 },
    ],
  },
  {
    id: "ko-r-gajok", language: "ko", kind: "reading", genre: "story", level: "A1",
    title: t("عائلتي", "My family"),
    lines: [
      "제 이름은 지수예요. 부산에 살아요.",
      "우리 가족은 네 명이에요.",
      "아버지는 회사원이고 어머니는 선생님이에요.",
      "저는 남동생이 한 명 있어요.",
      "주말에 가족과 같이 바다에 가요.",
    ],
    glossary: {
      "제 이름은": t("اسمي", "my name is"), "부산에": t("في بوسان", "in Busan"), "살아요": t("أعيش", "I live"), "가족은": t("العائلة", "the family"),
      "네 명이에요": t("أربعة أشخاص", "is four people"), "아버지는": t("الأب", "father"), "회사원이고": t("موظف شركة و", "is an office worker and"),
      "어머니는": t("الأم", "mother"), "선생님이에요": t("معلّمة", "is a teacher"), "남동생이": t("أخ أصغر", "a younger brother"),
      "주말에": t("في عطلة نهاية الأسبوع", "at the weekend"), "같이": t("معاً", "together"), "바다에": t("إلى البحر", "to the sea"),
    },
    questions: [
      { id: "q1", prompt: t("أين تعيش جي سو؟", "Where does Jisu live?"), options: ["서울", "부산", "제주"], answer: 1 },
      { id: "q2", prompt: t("كم فرداً في العائلة؟", "How many people are in the family?"), options: ["세 명", "네 명", "다섯 명"], answer: 1 },
      { id: "q3", prompt: t("أين يذهبون في عطلة نهاية الأسبوع؟", "Where do they go at the weekend?"), options: ["산", "바다", "영화관"], answer: 1 },
    ],
  },
  {
    id: "ko-r-gwanggo", language: "ko", kind: "reading", genre: "article", level: "A2",
    title: t("إعلان: دورة طبخ كوري", "Ad: Korean cooking class"),
    lines: [
      "한국 요리 교실에 오세요!",
      "매주 토요일 오전 열 시부터 열두 시까지 수업이 있어요.",
      "김치와 불고기 만드는 법을 배울 수 있어요.",
      "한 달 수강료는 십만 원이고 재료비가 포함돼요.",
      "신청은 이메일로 해 주세요.",
    ],
    glossary: {
      "요리": t("الطبخ", "cooking"), "교실에": t("إلى الصف", "to the class"), "매주": t("كل أسبوع", "every week"), "토요일": t("السبت", "Saturday"),
      "수업이": t("الدرس", "the class"), "만드는 법을": t("طريقة الصنع", "how to make"), "배울 수 있어요": t("يمكنك أن تتعلّم", "you can learn"),
      "수강료는": t("رسوم الدورة", "the tuition"), "재료비가": t("تكلفة المكوّنات", "ingredient costs"), "포함돼요": t("مشمولة", "are included"),
      "신청은": t("التسجيل", "registration"), "이메일로": t("بالبريد الإلكتروني", "by email"),
    },
    questions: [
      { id: "q1", prompt: t("متى الدروس؟", "When are the classes?"), options: ["일요일 오후", "토요일 오전", "금요일 저녁"], answer: 1 },
      { id: "q2", prompt: t("ماذا يمكن أن تتعلّم؟", "What can you learn?"), options: ["김치와 불고기", "피자", "케이크"], answer: 0 },
      { id: "q3", prompt: t("كيف تسجّل؟", "How do you register?"), options: ["전화로", "이메일로", "직접 방문"], answer: 1 },
    ],
  },
  {
    id: "ko-r-nyuseu", language: "ko", kind: "reading", genre: "news", level: "B1",
    title: t("خبر: الحياة وحيداً", "News: living alone"),
    lines: [
      "한국에서 혼자 사는 사람이 계속 늘고 있습니다.",
      "현재 전체 가구의 삼분의 일 이상이 일인 가구입니다.",
      "그래서 작은 포장 음식과 소형 가전제품이 인기를 끌고 있습니다.",
      "하지만 외로움을 느끼는 사람도 많습니다.",
      "일부 지역에서는 이웃과 함께 식사하는 모임을 만들고 있습니다.",
    ],
    glossary: {
      "혼자": t("وحيداً", "alone"), "사는": t("يعيش", "living"), "늘고 있습니다": t("يتزايد", "is increasing"), "현재": t("حالياً", "currently"),
      "가구의": t("من الأسر", "of households"), "삼분의 일": t("الثلث", "one third"), "포장 음식과": t("الطعام المعلّب و", "packaged food and"),
      "가전제품이": t("الأجهزة المنزلية", "home appliances"), "인기를 끌고 있습니다": t("أصبح رائجاً", "are becoming popular"), "하지만": t("لكن", "but"),
      "외로움을": t("الوحدة", "loneliness"), "이웃과": t("مع الجيران", "with neighbours"), "모임을": t("لقاءات", "gatherings"),
    },
    questions: [
      { id: "q1", prompt: t("ماذا يحدث لعدد من يعيشون وحدهم؟", "What is happening to the number of people living alone?"), options: ["늘고 있다", "줄고 있다", "변하지 않는다"], answer: 0 },
      { id: "q2", prompt: t("ما الذي أصبح رائجاً؟", "What has become popular?"), options: ["큰 집", "작은 포장 음식", "자동차"], answer: 1 },
      { id: "q3", prompt: t("ماذا تفعل بعض المناطق؟", "What are some areas doing?"), options: ["이웃과 식사 모임을 만든다", "새 아파트를 짓는다", "세금을 줄인다"], answer: 0 },
    ],
  },
];
