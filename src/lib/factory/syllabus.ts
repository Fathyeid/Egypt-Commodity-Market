/**
 * Language-neutral themes for factory lessons. A sentence joins a theme when its
 * English translation matches the theme's keywords, so one list serves all 12
 * languages. Themes are ordered from everyday (A1) towards abstract (C2); the
 * `from` level is where a theme first appears.
 */
import type { L10n } from "@/content/types";

export const FACTORY_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type FactoryLevel = (typeof FACTORY_LEVELS)[number];

export type Theme = { id: string; title: L10n; from: FactoryLevel; words: string[] };

const t = (ar: string, en: string): L10n => ({ ar, en });

export const THEMES: Theme[] = [
  { id: "greetings", from: "A1", title: t("التحية والتعارف", "Greetings and introductions"), words: ["hello", "hi", "goodbye", "bye", "name", "meet", "thank", "thanks", "please", "sorry", "welcome", "morning", "evening", "night"] },
  { id: "family", from: "A1", title: t("العائلة", "Family"), words: ["mother", "father", "mom", "dad", "brother", "sister", "son", "daughter", "family", "parents", "wife", "husband", "child", "children", "baby", "grandmother", "grandfather", "uncle", "aunt", "cousin"] },
  { id: "food", from: "A1", title: t("الطعام والشراب", "Food and drink"), words: ["eat", "ate", "food", "drink", "water", "coffee", "tea", "bread", "milk", "breakfast", "lunch", "dinner", "hungry", "thirsty", "apple", "meat", "fish", "rice", "cook", "restaurant", "delicious"] },
  { id: "home", from: "A1", title: t("البيت", "At home"), words: ["house", "home", "room", "kitchen", "door", "window", "bed", "table", "chair", "live", "lives", "apartment", "flat", "garden"] },
  { id: "time", from: "A1", title: t("الوقت والأيام", "Time and days"), words: ["today", "tomorrow", "yesterday", "time", "o'clock", "hour", "minute", "week", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "day", "month", "year", "early", "late"] },
  { id: "numbers", from: "A1", title: t("الأرقام والكميات", "Numbers and amounts"), words: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "hundred", "many", "much", "how many", "how much", "number"] },
  { id: "people", from: "A1", title: t("الناس والأوصاف", "People and descriptions"), words: ["tall", "short", "young", "old", "beautiful", "pretty", "nice", "kind", "friend", "boy", "girl", "man", "woman", "person", "people"] },
  { id: "daily", from: "A1", title: t("الروتين اليومي", "Daily routine"), words: ["wake", "woke", "sleep", "slept", "get up", "shower", "every day", "usually", "always", "never", "often", "work", "go to"] },
  { id: "places", from: "A1", title: t("الأماكن والاتجاهات", "Places and directions"), words: ["where", "station", "street", "left", "right", "near", "far", "city", "town", "here", "there", "hospital", "bank", "park", "school", "shop", "store"] },
  { id: "shopping", from: "A2", title: t("التسوّق", "Shopping"), words: ["buy", "bought", "money", "price", "cost", "costs", "expensive", "cheap", "pay", "paid", "sell", "market", "dollars", "euros", "shop"] },
  { id: "weather", from: "A2", title: t("الطقس والفصول", "Weather and seasons"), words: ["weather", "rain", "raining", "snow", "sun", "sunny", "cold", "hot", "warm", "wind", "summer", "winter", "spring", "autumn", "fall"] },
  { id: "travel", from: "A2", title: t("السفر والمواصلات", "Travel and transport"), words: ["travel", "trip", "train", "bus", "plane", "airport", "ticket", "car", "drive", "hotel", "vacation", "holiday", "visit", "country", "abroad"] },
  { id: "health", from: "A2", title: t("الصحة والجسم", "Health and the body"), words: ["doctor", "sick", "ill", "hurt", "pain", "head", "headache", "medicine", "hospital", "health", "healthy", "tired", "fever", "cold", "body"] },
  { id: "hobbies", from: "A2", title: t("الهوايات ووقت الفراغ", "Hobbies and free time"), words: ["play", "played", "music", "game", "football", "soccer", "sport", "read", "book", "movie", "film", "dance", "sing", "guitar", "piano", "swim", "hobby", "fun"] },
  { id: "school", from: "A2", title: t("الدراسة", "Studying"), words: ["study", "student", "teacher", "class", "school", "lesson", "exam", "test", "learn", "homework", "university", "language", "english", "french"] },
  { id: "past", from: "A2", title: t("ماذا حدث؟ أحداث ماضية", "What happened? Past events"), words: ["was", "were", "did", "went", "saw", "had", "came", "last", "ago", "yesterday", "happened"] },
  { id: "plans", from: "A2", title: t("الخطط والمستقبل", "Plans and the future"), words: ["will", "going to", "plan", "next", "tomorrow", "soon", "future", "want to", "hope", "would like"] },
  { id: "work", from: "B1", title: t("العمل والوظائف", "Work and jobs"), words: ["job", "work", "office", "boss", "company", "colleague", "meeting", "salary", "career", "business", "manager", "employee", "hire", "fired"] },
  { id: "feelings", from: "B1", title: t("المشاعر", "Feelings and emotions"), words: ["happy", "sad", "angry", "afraid", "scared", "worried", "nervous", "excited", "surprised", "love", "hate", "feel", "felt", "lonely", "proud"] },
  { id: "opinions", from: "B1", title: t("الآراء والنقاش", "Opinions and discussion"), words: ["think", "believe", "opinion", "agree", "disagree", "sure", "maybe", "probably", "perhaps", "idea", "should", "important", "true", "wrong"] },
  { id: "experience", from: "B1", title: t("التجارب الشخصية", "Personal experiences"), words: ["ever", "never", "have been", "has been", "experience", "already", "yet", "since", "for years", "remember"] },
  { id: "technology", from: "B1", title: t("التكنولوجيا", "Technology"), words: ["computer", "phone", "internet", "email", "website", "online", "app", "software", "program", "camera", "battery", "screen"] },
  { id: "nature", from: "B1", title: t("الطبيعة والبيئة", "Nature and environment"), words: ["tree", "forest", "river", "sea", "mountain", "animal", "dog", "cat", "bird", "flower", "nature", "environment", "planet", "earth"] },
  { id: "relationships", from: "B2", title: t("العلاقات", "Relationships"), words: ["relationship", "married", "marry", "divorce", "trust", "argue", "argument", "friendship", "partner", "together", "promise", "lie", "forgive"] },
  { id: "society", from: "B2", title: t("المجتمع", "Society"), words: ["society", "government", "law", "police", "crime", "rights", "vote", "election", "president", "war", "peace", "poverty", "citizen", "public"] },
  { id: "media", from: "B2", title: t("الإعلام والأخبار", "Media and news"), words: ["news", "newspaper", "article", "journalist", "television", "tv", "report", "radio", "magazine", "story", "information"] },
  { id: "conditions", from: "B2", title: t("الشروط والاحتمالات", "Conditions and possibilities"), words: ["if", "unless", "would", "could", "might", "possible", "impossible", "in case", "otherwise"] },
  { id: "money", from: "B2", title: t("المال والاقتصاد", "Money and the economy"), words: ["economy", "market", "price", "tax", "taxes", "bank", "loan", "debt", "invest", "rich", "poor", "afford", "budget", "save"] },
  { id: "science", from: "C1", title: t("العلم والمعرفة", "Science and knowledge"), words: ["science", "scientist", "research", "theory", "experiment", "discover", "discovery", "evidence", "nature", "energy", "universe", "knowledge"] },
  { id: "culture", from: "C1", title: t("الثقافة والفنون", "Culture and the arts"), words: ["culture", "art", "artist", "painting", "museum", "history", "tradition", "literature", "poem", "novel", "writer", "religion"] },
  { id: "abstract", from: "C1", title: t("الأفكار المجرّدة", "Abstract ideas"), words: ["truth", "freedom", "justice", "meaning", "reason", "purpose", "responsibility", "consequence", "principle", "value", "moral"] },
  { id: "argument", from: "C1", title: t("الإقناع والحجة", "Persuasion and argument"), words: ["however", "although", "despite", "therefore", "nevertheless", "whereas", "indeed", "argue", "claim", "convince", "evidence"] },
  { id: "idioms", from: "C2", title: t("التعابير الدقيقة", "Nuance and idiom"), words: ["as if", "as though", "no matter", "by no means", "hardly", "scarcely", "rather", "whatsoever", "nonetheless", "albeit"] },
  { id: "philosophy", from: "C2", title: t("الفلسفة والحياة", "Philosophy and life"), words: ["life", "death", "soul", "mind", "human", "humanity", "wisdom", "fate", "happiness", "existence", "conscience"] },
];

export const MIXED: Theme = { id: "mixed", from: "A1", title: t("تدريب منوّع", "Mixed practice"), words: [] };

const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MATCHERS = new Map(THEMES.map((th) => [th.id, new RegExp(`\\b(?:${th.words.map(escape).join("|")})\\b`, "i")]));

/** Themes available at a level: everything introduced at or before it. */
export function themesFor(level: FactoryLevel): Theme[] {
  const idx = FACTORY_LEVELS.indexOf(level);
  return THEMES.filter((th) => FACTORY_LEVELS.indexOf(th.from) <= idx);
}

export function matchesTheme(theme: Theme, english: string): boolean {
  return MATCHERS.get(theme.id)?.test(english) ?? false;
}
