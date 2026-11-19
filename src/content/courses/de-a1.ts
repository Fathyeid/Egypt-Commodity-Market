import type { Course, L10n } from "../types";

const t = (ar: string, en: string): L10n => ({ ar, en });

/** German A1 for Arabic speakers: its own syllabus (verb position, articles, du/Sie), not a translation of the English course. */
export const deA1: Course = {
  id: "de-a1",
  language: "de",
  level: "A1",
  title: t("الألمانية: المستوى A1", "German: Level A1"),
  units: [
    {
      id: "de-a1-u1",
      title: t("الوحدة 1: Hallo!", "Unit 1: Hallo!"),
      lessons: [
        {
          id: "de-a1-u1-l1",
          title: t("التحية: du و Sie", "Greetings: du and Sie"),
          goal: t("أن تحيّي الناس وتقدّم نفسك بالأسلوب الرسمي وغير الرسمي.", "Greet people and introduce yourself formally and informally."),
          explanation: t(
            "في الألمانية ضميران للمخاطَب: du للأصدقاء والعائلة، و Sie (بحرف كبير) للرسمي مع الغرباء وفي العمل. اختيار الضمير الخطأ يبدو غير مهذب، فابدأ بـ Sie عند الشك.",
            "German has two words for “you”: du for friends and family, Sie (capitalised) for formal situations. When unsure, use Sie.",
          ),
          vocabulary: [
            { term: "Hallo", meaning: t("مرحباً", "hello") },
            { term: "Guten Morgen", meaning: t("صباح الخير", "good morning") },
            { term: "Guten Tag", meaning: t("نهارك سعيد (رسمي)", "good day (formal)") },
            { term: "Wie heißen Sie?", meaning: t("ما اسم حضرتك؟", "What is your name? (formal)") },
            { term: "Ich heiße …", meaning: t("اسمي …", "My name is …") },
            { term: "Tschüss / Auf Wiedersehen", meaning: t("مع السلامة (غير رسمي / رسمي)", "bye (informal / formal)") },
          ],
          pronunciation: [
            { text: "Ich heiße Omar.", tip: t("ch في ich صوت خفيف بين «ش» و«خ» من مقدمة الفم.", "ch in ich is a soft hiss, between sh and h.") },
            { text: "Guten Tag", tip: t("الحرف g في البداية يُنطق «جـ» مصرية (g).", "g is always hard, like in “go”.") },
          ],
          examples: [
            { text: "Guten Tag! Wie heißen Sie? — Ich heiße Karim.", meaning: t("نهارك سعيد! ما اسم حضرتك؟ — اسمي كريم.", "Formal introduction.") },
            { text: "Hallo! Wie heißt du? — Ich bin Lina.", meaning: t("أهلاً! ما اسمك؟ — أنا لينا.", "Informal introduction.") },
            { text: "Wie geht es Ihnen? — Gut, danke.", meaning: t("كيف حال حضرتك؟ — بخير، شكراً.", "Formal “how are you”.") },
          ],
          grammar: {
            title: t("تصريف sein و heißen", "Conjugating sein and heißen"),
            body: t("الفعل sein (يكون) فعل شاذ ويجب حفظه. أما heißen فمنتظم تقريباً: ich heiße، du heißt، Sie heißen.", "sein (to be) is irregular; learn it by heart. heißen is regular-ish: ich heiße, du heißt, Sie heißen."),
            table: [["ich", "bin", "heiße"], ["du", "bist", "heißt"], ["er / sie", "ist", "heißt"], ["Sie (formal)", "sind", "heißen"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "Ich ___ Sara.", options: ["bist", "bin", "ist"], answer: 1, tag: "sein" },
            { id: "e2", type: "mcq", prompt: "Wie ___ du?", options: ["heiße", "heißt", "heißen"], answer: 1, tag: "conjugation" },
            { id: "e3", type: "match", pairs: [["Guten Morgen", t("صباح الخير", "good morning")], ["Tschüss", t("مع السلامة", "bye")], ["Ich heiße", t("اسمي", "my name is")]] },
            { id: "e4", type: "listen", audio: "Wie heißen Sie?", prompt: t("أي ضمير سمعت؟ (Sie رسمي، du غير رسمي)", "Which pronoun did you hear? (Sie = formal, du = informal)"), options: ["Sie", "du"], answer: 0 },
          ],
          quiz: [
            { id: "q1", type: "fill", prompt: "Wie ___ Sie? (heißen)", answers: ["heißen", "heissen"], tag: "conjugation" },
            { id: "q2", type: "mcq", prompt: "Du ___ mein Freund.", options: ["bin", "bist", "sind"], answer: 1, tag: "sein" },
            { id: "q3", type: "translate", prompt: t("ترجم: اسمي عمر.", "Write in German: “My name is Omar.”"), answers: ["Ich heiße Omar", "Ich heisse Omar", "Ich bin Omar", "Mein Name ist Omar"], tag: "conjugation" },
            { id: "q4", type: "dictation", audio: "Guten Morgen", answers: ["guten morgen"] },
          ],
          review: [
            t("du للأصدقاء، و Sie للرسمي. وعند الشك استخدم Sie.", "du for friends, Sie for formal. When in doubt: Sie."),
            t("sein: ich bin، du bist، er ist، Sie sind.", "sein: ich bin, du bist, er ist, Sie sind."),
            t("التعارف: Ich heiße … / Ich bin …", "Introduce yourself: Ich heiße … / Ich bin …"),
          ],
        },
        {
          id: "de-a1-u1-l2",
          title: t("الأرقام والعمر", "Numbers and age"),
          goal: t("أن تعدّ حتى 20 وتقول عمرك.", "Count to 20 and say your age."),
          explanation: t(
            "مثل الإنجليزية، العمر في الألمانية بفعل الكون: Ich bin 25 Jahre alt. والأرقام من 13 إلى 19 تُبنى هكذا: الآحاد + zehn، مثل dreizehn (3+10).",
            "Like English, age uses “to be”: Ich bin 25 Jahre alt. Numbers 13–19 are units + zehn: dreizehn (3+10).",
          ),
          vocabulary: [
            { term: "eins, zwei, drei", meaning: t("واحد، اثنان، ثلاثة", "1, 2, 3") },
            { term: "zehn", meaning: t("عشرة", "10") },
            { term: "zwölf", meaning: t("اثنا عشر", "12") },
            { term: "sechzehn", meaning: t("ستة عشر", "16") },
            { term: "zwanzig", meaning: t("عشرون", "20") },
            { term: "Jahre alt", meaning: t("سنة (للعمر)", "years old") },
          ],
          pronunciation: [
            { text: "zwei, zwanzig", tip: t("z تُنطق «تس».", "z sounds like ts.") },
            { text: "zwölf", tip: t("ö: قل «إي» مع تدوير الشفتين.", "ö: say “ay” with rounded lips.") },
          ],
          examples: [
            { text: "Wie alt bist du? — Ich bin zwanzig.", meaning: t("كم عمرك؟ — عمري عشرون.", "Informal age question.") },
            { text: "Meine Schwester ist sechzehn Jahre alt.", meaning: t("أختي عمرها ستة عشر عاماً.", "Talking about someone else.") },
            { text: "Wie alt sind Sie? — Ich bin vierzig.", meaning: t("كم عمر حضرتك؟ — عمري أربعون.", "Formal version.") },
          ],
          grammar: {
            title: t("السؤال عن العمر", "Asking about age"),
            body: t("Wie alt bist du? (غير رسمي) / Wie alt sind Sie? (رسمي). والإجابة: Ich bin … (Jahre alt).", "Wie alt bist du? (informal) / Wie alt sind Sie? (formal). Answer: Ich bin … (Jahre alt)."),
            table: [["Wie alt bist du?", "Ich bin 18."], ["Wie alt ist er?", "Er ist 9 Jahre alt."]],
          },
          exercises: [
            { id: "e1", type: "match", pairs: [["zwölf", t("12", "12")], ["zwanzig", t("20", "20")], ["sechzehn", t("16", "16")]] },
            { id: "e2", type: "mcq", prompt: "Ich ___ 30 Jahre alt.", options: ["habe", "bin", "ist"], answer: 1, tag: "age" },
            { id: "e3", type: "fill", prompt: "Wie ___ bist du?", answers: ["alt"], tag: "age" },
            { id: "e4", type: "listen", audio: "Er ist dreizehn.", prompt: t("كم عمره؟", "How old is he?"), options: ["3", "13", "30"], answer: 1 },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Wie alt ___ Sie?", options: ["bist", "sind", "ist"], answer: 1, tag: "sein" },
            { id: "q2", type: "translate", prompt: t("ترجم: عمري عشرون عاماً.", "Write: “I am twenty years old.”"), answers: ["Ich bin zwanzig Jahre alt", "Ich bin 20 Jahre alt", "Ich bin zwanzig", "Ich bin 20"], tag: "age" },
            { id: "q3", type: "dictation", audio: "zwölf", answers: ["zwölf", "zwoelf", "12"] },
            { id: "q4", type: "order", words: ["alt", "du", "Wie", "bist"], answers: ["Wie alt bist du"], tag: "word-order" },
          ],
          review: [
            t("العمر: Ich bin … (Jahre alt).", "Age: Ich bin … (Jahre alt)."),
            t("13 إلى 19: الآحاد + zehn (dreizehn).", "13–19: units + zehn (dreizehn)."),
            t("z تُنطق «تس»: zwei, zehn.", "z = ts: zwei, zehn."),
          ],
        },
        {
          id: "de-a1-u1-l3",
          title: t("من أين أنت؟", "Where are you from?"),
          goal: t("أن تقول من أين أنت وأين تسكن وما اللغات التي تتحدثها.", "Say where you're from, where you live and which languages you speak."),
          explanation: t(
            "قاعدة ذهبية في الألمانية: الفعل في المركز الثاني في الجملة الخبرية: Ich komme aus Ägypten. وفي أسئلة W يأتي الفعل بعد أداة السؤال مباشرة: Woher kommst du?",
            "Golden rule: the verb is in position 2 in statements (Ich komme aus Ägypten) and right after the question word in W-questions (Woher kommst du?).",
          ),
          vocabulary: [
            { term: "kommen aus", meaning: t("يأتي من", "to come from") },
            { term: "wohnen in", meaning: t("يسكن في", "to live in") },
            { term: "sprechen", meaning: t("يتحدث", "to speak") },
            { term: "Ägypten", meaning: t("مصر", "Egypt") },
            { term: "Deutschland", meaning: t("ألمانيا", "Germany") },
            { term: "Arabisch / Deutsch", meaning: t("العربية / الألمانية", "Arabic / German") },
          ],
          pronunciation: [
            { text: "Woher kommst du?", tip: t("w تُنطق «ف» تقريباً (v).", "w sounds like English v.") },
            { text: "Ägypten", tip: t("ä تُنطق «إ» مفتوحة.", "ä sounds like “e” in “bed”.") },
          ],
          examples: [
            { text: "Woher kommen Sie? — Ich komme aus Ägypten.", meaning: t("من أين حضرتك؟ — أنا من مصر.", "Formal origin question.") },
            { text: "Ich wohne in Hamburg.", meaning: t("أسكن في هامبورغ.", "Where you live.") },
            { text: "Ich spreche Arabisch und ein bisschen Deutsch.", meaning: t("أتحدث العربية وقليلاً من الألمانية.", "Languages you speak.") },
          ],
          grammar: {
            title: t("تصريف الأفعال المنتظمة وموقع الفعل", "Regular verbs and verb position"),
            body: t("نحذف ‎-en ونضيف النهاية: ich ‎-e، du ‎-st، er/sie ‎-t، wir/Sie ‎-en. والفعل دائماً في المركز الثاني.", "Remove -en and add: ich -e, du -st, er/sie -t, wir/Sie -en. The verb is always in position 2."),
            table: [["ich", "komme", "wohne"], ["du", "kommst", "wohnst"], ["er / sie", "kommt", "wohnt"], ["wir / Sie", "kommen", "wohnen"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "Woher ___ du?", options: ["komme", "kommst", "kommt"], answer: 1, tag: "conjugation" },
            { id: "e2", type: "order", words: ["aus", "Ich", "Ägypten", "komme"], answers: ["Ich komme aus Ägypten"], tag: "verb-position" },
            { id: "e3", type: "fill", prompt: "Sie ___ in Berlin. (wohnen, she)", answers: ["wohnt"], tag: "conjugation" },
            { id: "e4", type: "match", pairs: [["sprechen", t("يتحدث", "to speak")], ["wohnen", t("يسكن", "to live")], ["kommen", t("يأتي", "to come")]] },
          ],
          quiz: [
            { id: "q1", type: "fill", prompt: "Ich ___ Arabisch. (sprechen)", answers: ["spreche"], tag: "conjugation" },
            { id: "q2", type: "order", words: ["Sie", "Woher", "kommen"], answers: ["Woher kommen Sie"], tag: "verb-position" },
            { id: "q3", type: "translate", prompt: t("ترجم: أسكن في القاهرة.", "Write: “I live in Cairo.”"), answers: ["Ich wohne in Kairo"], tag: "conjugation" },
            { id: "q4", type: "listen", audio: "Ich komme aus Deutschland.", prompt: t("من أين المتحدث؟", "Where is the speaker from?"), options: ["Ägypten", "Deutschland", "Österreich"], answer: 1 },
          ],
          review: [
            t("الفعل في المركز الثاني: Ich komme aus …", "Verb in position 2: Ich komme aus …"),
            t("النهايات: ‎-e، ‎-st، ‎-t، ‎-en.", "Endings: -e, -st, -t, -en."),
            t("Woher؟ = من أين؟ و Wo؟ = أين؟", "Woher? = where from? Wo? = where?"),
          ],
        },
      ],
    },
    {
      id: "de-a1-u2",
      title: t("الوحدة 2: Alltag", "Unit 2: Alltag (everyday life)"),
      lessons: [
        {
          id: "de-a1-u2-l1",
          title: t("العائلة وأدوات التعريف", "Family and articles"),
          goal: t("أن تتحدث عن عائلتك وتتعرف على der / die / das.", "Talk about your family and meet der / die / das."),
          explanation: t(
            "كل اسم ألماني له جنس: der (مذكر)، die (مؤنث)، das (محايد). احفظ الاسم مع أداته دائماً، فالجنس لا يُخمَّن من المعنى غالباً. وأداة الجمع دائماً die.",
            "Every German noun has a gender: der (masc.), die (fem.), das (neuter). Always learn nouns with their article; plural is always die.",
          ),
          vocabulary: [
            { term: "der Vater / die Mutter", meaning: t("الأب / الأم", "father / mother") },
            { term: "der Bruder / die Schwester", meaning: t("الأخ / الأخت", "brother / sister") },
            { term: "das Kind / die Kinder", meaning: t("الطفل / الأطفال", "child / children") },
            { term: "die Eltern", meaning: t("الوالدان", "parents") },
            { term: "mein / meine", meaning: t("ـي (ملكية)", "my") },
            { term: "haben", meaning: t("يملك / عنده", "to have") },
          ],
          pronunciation: [
            { text: "die Schwester", tip: t("sch تُنطق «ش».", "sch sounds like sh.") },
            { text: "der Vater", tip: t("v في الألمانية تُنطق «ف».", "German v sounds like f.") },
          ],
          examples: [
            { text: "Das ist mein Bruder. Er heißt Ali.", meaning: t("هذا أخي. اسمه علي.", "mein with masculine.") },
            { text: "Das ist meine Mutter.", meaning: t("هذه أمي.", "meine with feminine.") },
            { text: "Ich habe zwei Kinder.", meaning: t("عندي طفلان.", "haben + plural.") },
          ],
          grammar: {
            title: t("mein / meine والفعل haben", "mein / meine and haben"),
            body: t("مع der و das نستخدم mein، ومع die والجمع نستخدم meine. والفعل haben: ich habe، du hast، er hat، wir/Sie haben.", "der / das → mein; die / plural → meine. haben: ich habe, du hast, er hat, wir/Sie haben."),
            table: [["der Bruder", "mein Bruder"], ["die Schwester", "meine Schwester"], ["das Kind", "mein Kind"], ["die Eltern (Pl.)", "meine Eltern"]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "___ Mutter (die)", options: ["der", "die", "das"], answer: 1, tag: "articles" },
            { id: "e2", type: "mcq", prompt: "Das ist ___ Schwester.", options: ["mein", "meine", "meinen"], answer: 1, tag: "possessives" },
            { id: "e3", type: "fill", prompt: "Er ___ einen Bruder. (haben)", answers: ["hat"], tag: "haben" },
            { id: "e4", type: "match", pairs: [["der Vater", t("الأب", "father")], ["das Kind", t("الطفل", "child")], ["die Eltern", t("الوالدان", "parents")]] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "___ Kind (child)", options: ["der", "die", "das"], answer: 2, tag: "articles" },
            { id: "q2", type: "fill", prompt: "Das sind ___ Eltern. (my)", answers: ["meine"], tag: "possessives" },
            { id: "q3", type: "translate", prompt: t("ترجم: عندي أخت.", "Write: “I have a sister.”"), answers: ["Ich habe eine Schwester"], tag: "haben" },
            { id: "q4", type: "dictation", audio: "mein Vater", answers: ["mein vater"] },
          ],
          review: [
            t("احفظ كل اسم مع أداته: der / die / das.", "Learn every noun with its article: der / die / das."),
            t("mein مع der/das، و meine مع die والجمع.", "mein with der/das, meine with die and plural."),
            t("haben: ich habe، du hast، er hat.", "haben: ich habe, du hast, er hat."),
          ],
        },
        {
          id: "de-a1-u2-l2",
          title: t("اليوم والوقت", "My day and the time"),
          goal: t("أن تصف يومك وتقول الوقت.", "Describe your day and tell the time."),
          explanation: t(
            "عند بداية الجملة بالوقت ينتقل الفاعل بعد الفعل، لأن الفعل يبقى في المركز الثاني: Um 7 Uhr stehe ich auf. والأفعال المنفصلة مثل aufstehen تنقسم: stehe … auf.",
            "If a sentence starts with a time, the subject moves after the verb (verb stays 2nd): Um 7 Uhr stehe ich auf. Separable verbs split: aufstehen → stehe … auf.",
          ),
          vocabulary: [
            { term: "aufstehen", meaning: t("يستيقظ / ينهض", "to get up") },
            { term: "frühstücken", meaning: t("يفطر", "to have breakfast") },
            { term: "arbeiten", meaning: t("يعمل", "to work") },
            { term: "um … Uhr", meaning: t("في الساعة …", "at … o'clock") },
            { term: "morgens / abends", meaning: t("صباحاً / مساءً", "in the morning / evening") },
            { term: "jeden Tag", meaning: t("كل يوم", "every day") },
          ],
          pronunciation: [
            { text: "Um sieben Uhr stehe ich auf.", tip: t("s في بداية الكلمة قبل حرف متحرك تُنطق «ز»: sieben.", "s before a vowel sounds like z: sieben.") },
            { text: "frühstücken", tip: t("ü: قل «إي» مع تدوير الشفتين كأنك تصفّر.", "ü: say “ee” with rounded lips.") },
          ],
          examples: [
            { text: "Ich stehe um sechs Uhr auf.", meaning: t("أستيقظ في السادسة.", "Separable verb split.") },
            { text: "Morgens frühstücke ich mit meiner Familie.", meaning: t("صباحاً أفطر مع عائلتي.", "Inversion after time word.") },
            { text: "Er arbeitet jeden Tag bis fünf Uhr.", meaning: t("يعمل كل يوم حتى الخامسة.", "arbeiten → er arbeitet.") },
          ],
          grammar: {
            title: t("الأفعال المنفصلة والقلب", "Separable verbs and inversion"),
            body: t("aufstehen ← ich stehe … auf (البادئة في آخر الجملة). وإذا بدأت الجملة بغير الفاعل، يأتي الفعل ثم الفاعل: Heute arbeite ich.", "aufstehen → ich stehe … auf (prefix at the end). If something else starts the sentence, verb then subject: Heute arbeite ich."),
            table: [["Ich stehe um 7 auf.", "Um 7 stehe ich auf."], ["Ich arbeite heute.", "Heute arbeite ich."]],
          },
          exercises: [
            { id: "e1", type: "order", words: ["auf", "Ich", "um", "sieben", "stehe"], answers: ["Ich stehe um sieben auf"], tag: "separable" },
            { id: "e2", type: "mcq", prompt: "Morgens ___ ich Kaffee.", options: ["ich trinke", "trinke", "trinken"], answer: 1, tag: "inversion" },
            { id: "e3", type: "fill", prompt: "Er ___ in einem Büro. (arbeiten)", answers: ["arbeitet"], tag: "conjugation", explain: t("الجذر ينتهي بـ t، لذلك نضيف ‎-et.", "Stem ends in t → add -et.") },
            { id: "e4", type: "listen", audio: "Ich stehe um sechs Uhr auf.", prompt: t("متى يستيقظ؟", "When does he get up?"), options: ["5:00", "6:00", "7:00"], answer: 1 },
          ],
          quiz: [
            { id: "q1", type: "order", words: ["ich", "Heute", "arbeite"], answers: ["Heute arbeite ich"], tag: "inversion" },
            { id: "q2", type: "mcq", prompt: "Wann ___ du auf?", options: ["stehst", "steht", "stehe"], answer: 0, tag: "separable" },
            { id: "q3", type: "translate", prompt: t("ترجم: أعمل كل يوم.", "Write: “I work every day.”"), answers: ["Ich arbeite jeden Tag", "Jeden Tag arbeite ich"], tag: "conjugation" },
            { id: "q4", type: "dictation", audio: "jeden Tag", answers: ["jeden tag"] },
          ],
          review: [
            t("الفعل في المركز الثاني حتى لو بدأت الجملة بالوقت.", "Verb stays 2nd even when a time word comes first."),
            t("الأفعال المنفصلة: البادئة تذهب لآخر الجملة.", "Separable verbs: the prefix goes to the end."),
            t("arbeiten ← er arbeitet (‎-et بعد t).", "arbeiten → er arbeitet (-et after t)."),
          ],
        },
        {
          id: "de-a1-u2-l3",
          title: t("الطعام والطلب في المقهى", "Food and ordering at a café"),
          goal: t("أن تطلب بأدب وتقول ما تحب.", "Order politely and say what you like."),
          explanation: t(
            "للطلب بأدب نقول Ich möchte … أو Ich hätte gern …، وللتعبير عن الحب نضع gern بعد الفعل: Ich trinke gern Tee (أحب شرب الشاي). والنفي: nicht gern.",
            "Order politely with Ich möchte … or Ich hätte gern …. To say you like doing something, add gern: Ich trinke gern Tee. Negative: nicht gern.",
          ),
          vocabulary: [
            { term: "der Kaffee", meaning: t("القهوة", "coffee") },
            { term: "der Tee", meaning: t("الشاي", "tea") },
            { term: "das Wasser", meaning: t("الماء", "water") },
            { term: "das Brot", meaning: t("الخبز", "bread") },
            { term: "Ich möchte …", meaning: t("أريد … (بأدب)", "I would like …") },
            { term: "die Rechnung, bitte", meaning: t("الحساب من فضلك", "the bill, please") },
          ],
          pronunciation: [
            { text: "Ich möchte einen Tee, bitte.", tip: t("ö في möchte مثل التي في zwölf.", "ö in möchte, as in zwölf.") },
            { text: "das Wasser", tip: t("w تُنطق v، و ss تُنطق «س».", "w = v, ss = s.") },
          ],
          examples: [
            { text: "Ich möchte einen Kaffee und ein Wasser, bitte.", meaning: t("أريد قهوة وماء من فضلك.", "Ordering.") },
            { text: "Ich esse gern Brot, aber ich trinke nicht gern Kaffee.", meaning: t("أحب الخبز، لكني لا أحب شرب القهوة.", "gern / nicht gern.") },
            { text: "Die Rechnung, bitte! — Das macht 6 Euro.", meaning: t("الحساب من فضلك! — المجموع 6 يورو.", "Paying.") },
          ],
          grammar: {
            title: t("ein / eine / einen عند الطلب", "ein / eine / einen when ordering"),
            body: t("بعد möchte يكون الاسم مفعولاً به، فيتغير المذكر فقط: der Kaffee ← einen Kaffee. أما المؤنث والمحايد فلا يتغيران: eine Cola، ein Wasser.", "After möchte the noun is the object, and only masculine changes: der Kaffee → einen Kaffee. Feminine and neuter stay: eine Cola, ein Wasser."),
            table: [["der Kaffee", "Ich möchte einen Kaffee."], ["die Suppe", "Ich möchte eine Suppe."], ["das Wasser", "Ich möchte ein Wasser."]],
          },
          exercises: [
            { id: "e1", type: "mcq", prompt: "Ich möchte ___ Tee. (der Tee)", options: ["ein", "eine", "einen"], answer: 2, tag: "accusative" },
            { id: "e2", type: "mcq", prompt: "Ich trinke ___ Wasser. (I like drinking water.)", options: ["gern", "nie", "kein"], answer: 0, tag: "gern" },
            { id: "e3", type: "match", pairs: [["das Brot", t("الخبز", "bread")], ["der Tee", t("الشاي", "tea")], ["die Rechnung", t("الحساب", "the bill")]] },
            { id: "e4", type: "fill", prompt: "Ich möchte ___ Wasser. (das Wasser)", answers: ["ein"], tag: "accusative" },
          ],
          quiz: [
            { id: "q1", type: "fill", prompt: "Ich möchte ___ Kaffee, bitte. (der Kaffee)", answers: ["einen"], tag: "accusative" },
            { id: "q2", type: "order", words: ["gern", "Tee", "Ich", "trinke"], answers: ["Ich trinke gern Tee"], tag: "gern" },
            { id: "q3", type: "translate", prompt: t("ترجم: الحساب من فضلك.", "Write: “The bill, please.”"), answers: ["Die Rechnung bitte", "Die Rechnung, bitte"], tag: "phrases" },
            { id: "q4", type: "listen", audio: "Ich möchte ein Wasser und ein Brot.", prompt: t("ماذا يطلب؟", "What does he order?"), options: ["Kaffee und Brot", "Wasser und Brot", "Tee und Wasser"], answer: 1 },
          ],
          review: [
            t("الطلب: Ich möchte … / Ich hätte gern …", "Order: Ich möchte … / Ich hätte gern …"),
            t("بعد möchte: المذكر einen، والمؤنث eine، والمحايد ein.", "After möchte: einen (masc.), eine (fem.), ein (neut.)."),
            t("gern بعد الفعل للتعبير عن الحب.", "gern after the verb means you like doing it."),
          ],
        },
      ],
    },
  ],
};
