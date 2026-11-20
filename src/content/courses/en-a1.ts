import type { Course, L10n } from "../types";

const t = (ar: string, en: string): L10n => ({ ar, en });

/** English A1 for Arabic speakers. Contrastive notes target common Arabic-speaker errors. */
export const enA1: Course = {
  id: "en-a1",
  language: "en",
  level: "A1",
  title: t("الإنجليزية: المستوى A1", "English: Level A1"),
  units: [
    {
      id: "en-a1-u1",
      title: t("الوحدة 1: أهلاً!", "Unit 1: Hello!"),
      lessons: [
        {
          id: "en-a1-u1-l1",
          title: t("التحية والتعارف", "Greetings and introductions"),
          goal: t("أن تحيّي شخصاً وتقدّم نفسك وتسأل عن اسمه.", "Greet someone, introduce yourself and ask their name."),
          explanation: t(
            "في الإنجليزية نستخدم فعل الكون (am / is / are) في جمل مثل «أنا عمر». في العربية نقول «أنا عمر» بدون فعل، لكن في الإنجليزية لا بد من الفعل: I am Omar.",
            "In English we need the verb to be (am / is / are) in sentences like “I am Omar”. Arabic often drops it, but English never does.",
          ),
          vocabulary: [
            { term: "hello", meaning: t("مرحباً", "a greeting"), example: "Hello, I'm Sara." },
            { term: "hi", meaning: t("أهلاً (غير رسمي)", "informal hello"), example: "Hi, Omar!" },
            { term: "good morning", meaning: t("صباح الخير", "greeting before noon"), example: "Good morning, Mr. Ali." },
            { term: "name", meaning: t("اسم", "what you are called"), example: "My name is Lina." },
            { term: "nice to meet you", meaning: t("تشرفت بمعرفتك", "said when you meet someone"), example: "Nice to meet you, too." },
            { term: "goodbye", meaning: t("مع السلامة", "said when leaving"), example: "Goodbye, see you tomorrow." },
          ],
          pronunciation: [
            { text: "Hello, my name is Omar.", tip: t("حرف h في hello يُنطق هواءً خفيفاً مثل «هـ».", "The h in hello is a light breath sound.") },
            { text: "Nice to meet you.", tip: t("اربط الكلمات: «نايس-تو-ميت-يو» دون توقف.", "Link the words smoothly: nice-to-meet-you.") },
          ],
          examples: [
            { text: "Hi! I'm Sara. What's your name?", meaning: t("أهلاً! أنا سارة. ما اسمك؟", "Greeting and asking a name.") },
            { text: "My name is Karim. Nice to meet you.", meaning: t("اسمي كريم. تشرفت بمعرفتك.", "Introducing yourself.") },
            { text: "Good morning! How are you? — I'm fine, thanks.", meaning: t("صباح الخير! كيف حالك؟ — بخير، شكراً.", "Asking how someone is.") },
          ],
          grammar: {
            title: t("فعل الكون: am / is / are", "The verb to be: am / is / are"),
            body: t(
              "I ← am، و he / she / it ← is، و you / we / they ← are. والاختصار شائع في الكلام: I'm، you're، she's.",
              "I → am; he / she / it → is; you / we / they → are. Contractions are common in speech: I'm, you're, she's.",
            ),
            table: [["I", "am", "I'm"], ["you", "are", "you're"], ["he / she / it", "is", "he's / she's / it's"], ["we / they", "are", "we're / they're"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "I ___ Omar.", options: ["is", "am", "are"], answer: 1, tag: "to-be", explain: t("مع I نستخدم am دائماً.", "With I we always use am.") },
            { id: "e2", type: "fill", prompt: "She ___ my sister.", answers: ["is", "'s"], tag: "to-be", explain: t("مع she نستخدم is.", "With she we use is.") },
            { id: "e3", type: "match", pairs: [["hello", t("مرحباً", "a greeting")], ["goodbye", t("مع السلامة", "when leaving")], ["name", t("اسم", "what you are called")]] },
            { id: "e4", type: "order", words: ["name", "My", "is", "Lina"], answers: ["My name is Lina"], tag: "word-order" },
            { id: "e5", type: "listen", audio: "Nice to meet you.", prompt: t("ماذا سمعت؟", "What did you hear?"), options: ["Nice to see you.", "Nice to meet you.", "Nice to eat you."], answer: 1 },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "They ___ students.", options: ["is", "am", "are"], answer: 2, tag: "to-be" },
            { id: "q2", type: "fill", prompt: "What ___ your name?", answers: ["is", "'s"], tag: "to-be" },
            { id: "q3", type: "translate", prompt: t("ترجم: أنا سارة.", "Write in English: “I am Sara.” (use the short form or the full form)"), answers: ["I am Sara", "I'm Sara"], tag: "to-be" },
            { id: "q4", type: "dictation", audio: "Good morning.", answers: ["good morning"] },
          ],
          review: [
            t("التحية: hello / hi / good morning، والوداع: goodbye.", "Greet with hello / hi / good morning; leave with goodbye."),
            t("لا تحذف فعل الكون: I am / she is / they are.", "Never drop the verb to be: I am / she is / they are."),
            t("للسؤال عن الاسم: What's your name?", "Ask a name with: What's your name?"),
          ],
        },
        {
          id: "en-a1-u1-l2",
          title: t("الأرقام والعمر", "Numbers and age"),
          goal: t("أن تعدّ من 1 إلى 20 وتسأل عن العمر وتجيب.", "Count from 1 to 20 and ask and answer about age."),
          explanation: t(
            "للتعبير عن العمر في الإنجليزية نستخدم فعل الكون وليس «يملك»: I am 25 (years old). خطأ شائع عند المتحدث بالعربية: I have 25 years ✗.",
            "To give your age in English, use to be, not have: I am 25 (years old). “I have 25 years” is a common mistake.",
          ),
          vocabulary: [
            { term: "one, two, three", meaning: t("واحد، اثنان، ثلاثة", "1, 2, 3") },
            { term: "ten", meaning: t("عشرة", "10") },
            { term: "twelve", meaning: t("اثنا عشر", "12") },
            { term: "fifteen", meaning: t("خمسة عشر", "15") },
            { term: "twenty", meaning: t("عشرون", "20") },
            { term: "old", meaning: t("عمر / كبير السن", "used for age"), example: "I'm 30 years old." },
          ],
          pronunciation: [
            { text: "thirteen, thirty", tip: t("في thirteen الضغط على المقطع الأخير، وفي thirty على الأول.", "thirTEEN stresses the end; THIRty stresses the start.") },
            { text: "three", tip: t("صوت th مثل «ث» العربية تماماً.", "th sounds like Arabic «ث».") },
          ],
          examples: [
            { text: "How old are you? — I'm twenty-two.", meaning: t("كم عمرك؟ — عمري اثنان وعشرون.", "Asking and answering about age.") },
            { text: "My brother is fifteen years old.", meaning: t("أخي عمره خمسة عشر عاماً.", "Talking about someone else's age.") },
            { text: "My phone number is 0-1-2-3-4-5.", meaning: t("رقم هاتفي 012345.", "Saying a phone number digit by digit.") },
          ],
          grammar: {
            title: t("السؤال عن العمر", "Asking about age"),
            body: t("السؤال: How old are you? / How old is she?، والإجابة: I'm 20. / She's 18. ويمكن إضافة years old.", "Question: How old are you? / How old is she? Answer: I'm 20. / She's 18. You can add years old."),
            table: [["How old are you?", "I'm 20 (years old)."], ["How old is he?", "He's 9."]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "I ___ 25 years old.", options: ["have", "am", "has"], answer: 1, tag: "age", explain: t("العمر يُعبَّر عنه بفعل الكون am.", "Age uses to be: am.") },
            { id: "e2", type: "match", pairs: [["twelve", t("12", "12")], ["twenty", t("20", "20")], ["fifteen", t("15", "15")]] },
            { id: "e3", type: "fill", prompt: "How ___ are you?", answers: ["old"], tag: "age" },
            { id: "e4", type: "listen", audio: "She is thirteen.", prompt: t("كم عمرها؟", "How old is she?"), options: ["30", "13", "3"], answer: 1 },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "How old ___ your brother?", options: ["are", "is", "am"], answer: 1, tag: "to-be" },
            { id: "q2", type: "translate", prompt: t("ترجم: عمري عشرون عاماً.", "Write: “I am twenty years old.”"), answers: ["I am twenty years old", "I'm twenty years old", "I am 20 years old", "I'm 20 years old", "I am twenty", "I'm twenty", "I am 20", "I'm 20"], tag: "age" },
            { id: "q3", type: "dictation", audio: "fifteen", answers: ["fifteen", "15"] },
            { id: "q4", type: "order", words: ["you", "old", "How", "are"], answers: ["How old are you"], tag: "word-order" },
          ],
          review: [
            t("العمر: I'm 20 (years old)، وليس I have 20 years.", "Age: I'm 20 (years old), not “I have 20 years”."),
            t("السؤال: How old are you?", "Ask: How old are you?"),
            t("انتبه للفرق بين ‎-teen و ‎-ty: thirteen ≠ thirty.", "Mind -teen vs -ty: thirteen ≠ thirty."),
          ],
        },
        {
          id: "en-a1-u1-l3",
          title: t("البلدان والجنسيات", "Countries and nationalities"),
          goal: t("أن تقول من أين أنت وما جنسيتك.", "Say where you are from and your nationality."),
          explanation: t(
            "نقول I'm from + اسم البلد، أو I'm + الجنسية. أسماء البلدان والجنسيات تبدأ دائماً بحرف كبير في الإنجليزية: Egypt, Egyptian.",
            "Say I'm from + country, or I'm + nationality. Countries and nationalities always start with a capital letter: Egypt, Egyptian.",
          ),
          vocabulary: [
            { term: "Egypt / Egyptian", meaning: t("مصر / مصري", "country / nationality") },
            { term: "Saudi Arabia / Saudi", meaning: t("السعودية / سعودي", "country / nationality") },
            { term: "Morocco / Moroccan", meaning: t("المغرب / مغربي", "country / nationality") },
            { term: "Germany / German", meaning: t("ألمانيا / ألماني", "country / nationality") },
            { term: "from", meaning: t("من", "origin"), example: "I'm from Jordan." },
            { term: "where", meaning: t("أين", "question word for place") },
          ],
          pronunciation: [
            { text: "Where are you from?", tip: t("صوت w تُدوَّر فيه الشفتان مثل «و».", "Round your lips for w, like Arabic «و».") },
            { text: "Egyptian", tip: t("الضغط على المقطع الثاني: e-GYP-tian.", "Stress the second syllable: e-GYP-tian.") },
          ],
          examples: [
            { text: "Where are you from? — I'm from Egypt.", meaning: t("من أين أنت؟ — أنا من مصر.", "Asking origin.") },
            { text: "She's Moroccan. She lives in Rabat.", meaning: t("هي مغربية. تعيش في الرباط.", "Nationality + city.") },
            { text: "Are you German? — No, I'm Austrian.", meaning: t("هل أنت ألماني؟ — لا، أنا نمساوي.", "Yes/no question.") },
          ],
          grammar: {
            title: t("أسئلة نعم / لا مع be", "Yes/no questions with be"),
            body: t("نقدّم الفعل على الفاعل: You are Egyptian ← Are you Egyptian? والإجابة: Yes, I am. / No, I'm not.", "Put the verb first: You are Egyptian → Are you Egyptian? Answer: Yes, I am. / No, I'm not."),
            table: [["Are you Saudi?", "Yes, I am. / No, I'm not."], ["Is she Egyptian?", "Yes, she is. / No, she isn't."]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "I'm ___ Egypt.", options: ["in", "from", "of"], answer: 1, tag: "prepositions" },
            { id: "e2", type: "order", words: ["you", "from", "are", "Where"], answers: ["Where are you from"], tag: "questions" },
            { id: "e3", type: "match", pairs: [["Morocco", t("المغرب", "a North African country")], ["Saudi", t("سعودي", "a Gulf nationality")], ["German", t("ألماني", "a European nationality")]] },
            { id: "e4", type: "fill", prompt: "___ she Egyptian? — Yes, she is.", answers: ["is"], tag: "questions" },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Are you Saudi? — Yes, I ___.", options: ["am", "is", "are"], answer: 0, tag: "short-answers" },
            { id: "q2", type: "translate", prompt: t("ترجم: أنا من المغرب.", "Write: “I am from Morocco.”"), answers: ["I am from Morocco", "I'm from Morocco"], tag: "prepositions" },
            { id: "q3", type: "listen", audio: "He is from Germany.", prompt: t("من أين هو؟", "Where is he from?"), options: ["Egypt", "Germany", "Jordan"], answer: 1 },
            { id: "q4", type: "fill", prompt: "Is he Egyptian? — No, he ___.", answers: ["isn't", "is not"], tag: "short-answers" },
          ],
          review: [
            t("المنشأ: I'm from + بلد. الجنسية: I'm + جنسية.", "Origin: I'm from + country. Nationality: I'm + nationality."),
            t("الحرف الكبير إلزامي: Egypt, Egyptian.", "Always capitalise: Egypt, Egyptian."),
            t("السؤال بقلب الترتيب: Are you…? Is she…?", "Questions invert: Are you…? Is she…?"),
          ],
        },
      ],
    },
    {
      id: "en-a1-u2",
      title: t("الوحدة 2: يومي", "Unit 2: My day"),
      lessons: [
        {
          id: "en-a1-u2-l1",
          title: t("العائلة", "Family"),
          goal: t("أن تتحدث عن أفراد عائلتك.", "Talk about your family members."),
          explanation: t(
            "للملكية نستخدم my / your / his / her قبل الاسم، ونستخدم have / has للتعبير عن «عندي». تذكّر: he / she ← has.",
            "Use my / your / his / her before nouns, and have / has to say what you have. Remember: he / she → has.",
          ),
          vocabulary: [
            { term: "mother / father", meaning: t("أم / أب", "parents") },
            { term: "brother / sister", meaning: t("أخ / أخت", "siblings") },
            { term: "son / daughter", meaning: t("ابن / ابنة", "children") },
            { term: "husband / wife", meaning: t("زوج / زوجة", "married partners") },
            { term: "grandmother", meaning: t("جدة", "your parent's mother") },
            { term: "children", meaning: t("أطفال / أبناء", "plural of child") },
          ],
          pronunciation: [
            { text: "mother, brother", tip: t("صوت th هنا مثل «ذ» العربية.", "th here sounds like Arabic «ذ».") },
            { text: "daughter", tip: t("حروف gh صامتة: «دوتر».", "gh is silent: DAW-ter.") },
          ],
          examples: [
            { text: "I have two brothers and one sister.", meaning: t("عندي أخوان وأخت واحدة.", "Counting siblings.") },
            { text: "My father is a doctor. His name is Ahmed.", meaning: t("أبي طبيب. اسمه أحمد.", "Possessive his.") },
            { text: "She has three children.", meaning: t("عندها ثلاثة أطفال.", "has with she.") },
          ],
          grammar: {
            title: t("have / has وصفات الملكية", "have / has and possessives"),
            body: t("I / you / we / they ← have، و he / she ← has. أما صفات الملكية فهي: my, your, his, her, our, their.", "I / you / we / they → have; he / she → has. Possessives: my, your, his, her, our, their."),
            table: [["I", "have", "my"], ["you", "have", "your"], ["he", "has", "his"], ["she", "has", "her"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "She ___ two sons.", options: ["have", "has", "is"], answer: 1, tag: "have-has" },
            { id: "e2", type: "mcq", prompt: "This is my brother. ___ name is Ali.", options: ["Her", "His", "My"], answer: 1, tag: "possessives", explain: t("الأخ مذكر، لذلك نستخدم his.", "Brother is male, so his.") },
            { id: "e3", type: "match", pairs: [["daughter", t("ابنة", "female child")], ["husband", t("زوج", "married man")], ["grandmother", t("جدة", "parent's mother")]] },
            { id: "e4", type: "fill", prompt: "We ___ a big family.", answers: ["have"], tag: "have-has" },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "My sister and ___ husband live in Dubai.", options: ["his", "her", "their"], answer: 1, tag: "possessives" },
            { id: "q2", type: "fill", prompt: "He ___ one daughter.", answers: ["has"], tag: "have-has" },
            { id: "q3", type: "translate", prompt: t("ترجم: عندي أختان.", "Write: “I have two sisters.”"), answers: ["I have two sisters", "I have 2 sisters"], tag: "have-has" },
            { id: "q4", type: "dictation", audio: "my mother", answers: ["my mother"] },
          ],
          review: [
            t("he / she ← has، وباقي الضمائر ← have.", "he / she → has; everyone else → have."),
            t("his للمذكر و her للمؤنث، حسب صاحب الشيء.", "his for male owners, her for female owners."),
            t("children جمع child.", "children is the plural of child."),
          ],
        },
        {
          id: "en-a1-u2-l2",
          title: t("الروتين اليومي", "Daily routine"),
          goal: t("أن تصف يومك العادي بالمضارع البسيط.", "Describe a normal day with the present simple."),
          explanation: t(
            "المضارع البسيط للعادات اليومية: I wake up at 7. ومع he / she / it نضيف ‎-s للفعل: she works. وهذا من أكثر الأخطاء شيوعاً.",
            "The present simple is for routines: I wake up at 7. With he / she / it add -s: she works. Forgetting the -s is very common.",
          ),
          vocabulary: [
            { term: "wake up", meaning: t("يستيقظ", "stop sleeping") },
            { term: "have breakfast", meaning: t("يتناول الفطور", "eat in the morning") },
            { term: "go to work", meaning: t("يذهب إلى العمل", "travel to your job") },
            { term: "study", meaning: t("يدرس / يذاكر", "learn") },
            { term: "every day", meaning: t("كل يوم", "daily") },
            { term: "usually", meaning: t("عادةً", "most of the time") },
          ],
          pronunciation: [
            { text: "She works. He watches TV.", tip: t("‎-s تُنطق «س» في works و«إز» في watches.", "-s sounds like s in works and iz in watches.") },
            { text: "breakfast", tip: t("تُنطق «بريك-فِست» بمقطعين.", "Say BREK-fust, two syllables.") },
          ],
          examples: [
            { text: "I wake up at seven and have breakfast.", meaning: t("أستيقظ في السابعة وأتناول الفطور.", "Routine in first person.") },
            { text: "My sister studies in the evening.", meaning: t("أختي تذاكر في المساء.", "study → studies.") },
            { text: "We usually go to work by bus.", meaning: t("نذهب عادةً إلى العمل بالحافلة.", "Adverb of frequency before the verb.") },
          ],
          grammar: {
            title: t("المضارع البسيط و ‎-s", "Present simple and -s"),
            body: t("I / you / we / they work، و he / she / it works. الأفعال المنتهية بـ ‎-y بعد حرف ساكن: study ← studies. وأفعال ‎-ch و ‎-sh: watch ← watches.", "I / you / we / they work; he / she / it works. Consonant + y: study → studies. -ch / -sh: watch → watches."),
            table: [["I work", "she works"], ["I study", "he studies"], ["I watch", "it watches"], ["I go", "she goes"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "He ___ at 6 a.m.", options: ["wake up", "wakes up", "waking up"], answer: 1, tag: "present-simple-s" },
            { id: "e2", type: "fill", prompt: "My mother ___ (go) to work at 8.", answers: ["goes"], tag: "present-simple-s" },
            { id: "e3", type: "order", words: ["usually", "I", "tea", "drink"], answers: ["I usually drink tea"], tag: "adverbs" },
            { id: "e4", type: "listen", audio: "She studies every evening.", prompt: t("متى تذاكر؟", "When does she study?"), options: ["Every morning", "Every evening", "Every weekend"], answer: 1 },
          ],
          quiz: [
            { id: "q1", type: "fill", prompt: "Omar ___ (watch) TV after dinner.", answers: ["watches"], tag: "present-simple-s" },
            { id: "q2", type: "mcq", prompt: "We ___ breakfast at home.", options: ["has", "have", "having"], answer: 1, tag: "present-simple-s" },
            { id: "q3", type: "translate", prompt: t("ترجم: هي تعمل في بنك.", "Write: “She works in a bank.”"), answers: ["She works in a bank", "she works at a bank"], tag: "present-simple-s" },
            { id: "q4", type: "order", words: ["goes", "He", "work", "to", "usually"], answers: ["He usually goes to work"], tag: "adverbs" },
          ],
          review: [
            t("مع he / she / it نضيف ‎-s للفعل: works, goes, studies.", "Add -s with he / she / it: works, goes, studies."),
            t("كلمات التكرار (usually) تأتي قبل الفعل.", "Frequency words (usually) go before the verb."),
            t("المضارع البسيط للعادات والروتين.", "Use the present simple for habits and routines."),
          ],
        },
        {
          id: "en-a1-u2-l3",
          title: t("الطعام والشراب", "Food and drinks"),
          goal: t("أن تعبّر عمّا تحب وما لا تحب وتطلب طعاماً.", "Say what you like and don't like, and order food."),
          explanation: t(
            "نستخدم like / don't like للتفضيل، و a قبل الكلمة التي تبدأ بصوت ساكن و an قبل الصوت المتحرك: a banana, an apple.",
            "Use like / don't like for preferences; a before consonant sounds, an before vowel sounds: a banana, an apple.",
          ),
          vocabulary: [
            { term: "water", meaning: t("ماء", "a drink") },
            { term: "rice", meaning: t("أرز", "a grain") },
            { term: "chicken", meaning: t("دجاج", "a meat") },
            { term: "apple", meaning: t("تفاحة", "a fruit") },
            { term: "I'd like…", meaning: t("أريد… (بأدب)", "polite way to order") },
            { term: "delicious", meaning: t("لذيذ", "very tasty") },
          ],
          pronunciation: [
            { text: "I'd like a coffee, please.", tip: t("I'd تُنطق «آيد» قصيرة.", "I'd is short: “ide”.") },
            { text: "an apple", tip: t("اربط n بالكلمة التالية: «أنابل».", "Link the n: a-napple.") },
          ],
          examples: [
            { text: "I like rice, but I don't like fish.", meaning: t("أحب الأرز، لكني لا أحب السمك.", "like vs don't like.") },
            { text: "I'd like a chicken sandwich and water, please.", meaning: t("أريد ساندويتش دجاج وماء من فضلك.", "Ordering politely.") },
            { text: "Do you like coffee? — Yes, I do.", meaning: t("هل تحب القهوة؟ — نعم.", "Yes/no with do.") },
          ],
          grammar: {
            title: t("النفي والسؤال بـ do", "Negatives and questions with do"),
            body: t("النفي: I don't like…، ومع he / she: He doesn't like… (بدون ‎-s في الفعل). والسؤال: Do you like…? / Does she like…?", "Negative: I don't like…; with he / she: He doesn't like… (no -s on the verb). Questions: Do you like…? / Does she like…?"),
            table: [["I don't like fish.", "Do you like fish?"], ["She doesn't like tea.", "Does she like tea?"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "I'd like ___ apple.", options: ["a", "an", "the"], answer: 1, tag: "articles", explain: t("apple تبدأ بصوت متحرك، لذلك an.", "apple starts with a vowel sound → an.") },
            { id: "e2", type: "mcq", prompt: "She ___ like coffee.", options: ["don't", "doesn't", "isn't"], answer: 1, tag: "negatives" },
            { id: "e3", type: "match", pairs: [["rice", t("أرز", "a grain")], ["chicken", t("دجاج", "a meat")], ["water", t("ماء", "a drink")]] },
            { id: "e4", type: "fill", prompt: "___ you like chicken? — Yes, I do.", answers: ["do"], tag: "questions" },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "He doesn't ___ fish.", options: ["likes", "like", "liking"], answer: 1, tag: "negatives", explain: t("بعد doesn't يأتي الفعل بلا ‎-s.", "After doesn't, no -s.") },
            { id: "q2", type: "fill", prompt: "I'd like ___ banana, please.", answers: ["a"], tag: "articles" },
            { id: "q3", type: "translate", prompt: t("ترجم: لا أحب الشاي.", "Write: “I don't like tea.”"), answers: ["I don't like tea", "I do not like tea"], tag: "negatives" },
            { id: "q4", type: "listen", audio: "I'd like rice and chicken, please.", prompt: t("ماذا يطلب؟", "What does he order?"), options: ["Rice and fish", "Rice and chicken", "Chicken and salad"], answer: 1 },
          ],
          review: [
            t("a قبل الصوت الساكن، و an قبل الصوت المتحرك.", "a before consonant sounds, an before vowel sounds."),
            t("النفي: don't / doesn't + الفعل بلا ‎-s.", "Negative: don't / doesn't + verb without -s."),
            t("الطلب بأدب: I'd like…, please.", "Order politely: I'd like…, please."),
          ],
        },
      ],
    },
  ],
};
