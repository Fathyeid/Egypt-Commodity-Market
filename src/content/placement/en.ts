import type { PlacementItem } from "../types";

/** English placement bank: 2 items per skill per level (A1–C1). */
export const enPlacement: PlacementItem[] = [
  // ---------------- Vocabulary ----------------
  { id: "en-v-a1-1", skill: "vocabulary", level: "A1", prompt: "Which word is a colour?", options: ["table", "green", "happy", "run"], answer: 1 },
  { id: "en-v-a1-2", skill: "vocabulary", level: "A1", prompt: "My mother's son is my …", options: ["sister", "uncle", "brother", "aunt"], answer: 2 },
  { id: "en-v-a2-1", skill: "vocabulary", level: "A2", prompt: "I need to ___ a table at the restaurant for Friday.", options: ["book", "write", "pay", "take"], answer: 0 },
  { id: "en-v-a2-2", skill: "vocabulary", level: "A2", prompt: "The opposite of \"cheap\" is …", options: ["poor", "expensive", "empty", "short"], answer: 1 },
  { id: "en-v-b1-1", skill: "vocabulary", level: "B1", prompt: "She was ___ for the job because she had no experience.", options: ["rejected", "refused", "denied", "removed"], answer: 0 },
  { id: "en-v-b1-2", skill: "vocabulary", level: "B1", prompt: "We had to ___ the meeting until next week.", options: ["put off", "put on", "put up", "put in"], answer: 0 },
  { id: "en-v-b2-1", skill: "vocabulary", level: "B2", prompt: "The new policy had a ___ effect on sales, which rose by 40%.", options: ["negligible", "profound", "shallow", "reluctant"], answer: 1 },
  { id: "en-v-b2-2", skill: "vocabulary", level: "B2", prompt: "His explanation was so ___ that nobody understood it.", options: ["concise", "convoluted", "candid", "coherent"], answer: 1 },
  { id: "en-v-c1-1", skill: "vocabulary", level: "C1", prompt: "The minister tried to ___ the criticism by announcing new funding.", options: ["deflect", "deplete", "defer", "deduce"], answer: 0 },
  { id: "en-v-c1-2", skill: "vocabulary", level: "C1", prompt: "Her argument was ___: every point was supported by evidence.", options: ["spurious", "cogent", "tenuous", "frivolous"], answer: 1 },

  // ---------------- Grammar ----------------
  { id: "en-g-a1-1", skill: "grammar", level: "A1", prompt: "She ___ a teacher.", options: ["am", "is", "are", "be"], answer: 1 },
  { id: "en-g-a1-2", skill: "grammar", level: "A1", prompt: "I ___ coffee every morning.", options: ["drinks", "drinking", "drink", "am drink"], answer: 2 },
  { id: "en-g-a2-1", skill: "grammar", level: "A2", prompt: "Yesterday we ___ to the beach.", options: ["go", "went", "gone", "goes"], answer: 1 },
  { id: "en-g-a2-2", skill: "grammar", level: "A2", prompt: "This book is ___ than that one.", options: ["more interesting", "interestinger", "most interesting", "interesting"], answer: 0 },
  { id: "en-g-b1-1", skill: "grammar", level: "B1", prompt: "I ___ in Cairo since 2019.", options: ["live", "am living", "have lived", "lived"], answer: 2 },
  { id: "en-g-b1-2", skill: "grammar", level: "B1", prompt: "If it rains tomorrow, we ___ at home.", options: ["stay", "will stay", "would stay", "stayed"], answer: 1 },
  { id: "en-g-b2-1", skill: "grammar", level: "B2", prompt: "If I ___ about the traffic, I would have left earlier.", options: ["knew", "had known", "have known", "would know"], answer: 1 },
  { id: "en-g-b2-2", skill: "grammar", level: "B2", prompt: "The report ___ by the time the manager arrives.", options: ["will finish", "will have been finished", "has finished", "is finishing"], answer: 1 },
  { id: "en-g-c1-1", skill: "grammar", level: "C1", prompt: "___ had we sat down than the fire alarm went off.", options: ["No sooner", "Hardly", "As soon as", "Barely"], answer: 0 },
  { id: "en-g-c1-2", skill: "grammar", level: "C1", prompt: "It's high time the government ___ action.", options: ["takes", "took", "has taken", "will take"], answer: 1 },

  // ---------------- Reading ----------------
  {
    id: "en-r-a1-1", skill: "reading", level: "A1",
    passage: "Hi! My name is Omar. I am 20 years old. I live in Alexandria with my parents and my sister. I am a student.",
    prompt: "Who does Omar live with?", options: ["Alone", "With friends", "With his family", "With his wife"], answer: 2,
  },
  {
    id: "en-r-a1-2", skill: "reading", level: "A1",
    passage: "The shop opens at 9 a.m. and closes at 6 p.m. It is closed on Fridays.",
    prompt: "When can you NOT go to the shop?", options: ["Monday at 10 a.m.", "Friday at 11 a.m.", "Sunday at 5 p.m.", "Tuesday at 9 a.m."], answer: 1,
  },
  {
    id: "en-r-a2-1", skill: "reading", level: "A2",
    passage: "Dear Sara, thanks for your invitation. I'm sorry, but I can't come to your party on Saturday because I have to work. Can we meet for lunch next week instead? Love, Mona",
    prompt: "Why is Mona writing?", options: ["To invite Sara to a party", "To say she can't attend", "To ask for a job", "To cancel lunch"], answer: 1,
  },
  {
    id: "en-r-a2-2", skill: "reading", level: "A2",
    passage: "Train 42 to Aswan is delayed by 30 minutes. Passengers should wait on platform 3. We apologise for the inconvenience.",
    prompt: "What should passengers do?", options: ["Take another train", "Go to platform 3 and wait", "Buy a new ticket", "Leave the station"], answer: 1,
  },
  {
    id: "en-r-b1-1", skill: "reading", level: "B1",
    passage: "Working from home has clear benefits: no commute and more flexible hours. However, many employees say they feel isolated and find it harder to separate work from their private life.",
    prompt: "What is one disadvantage mentioned?", options: ["Longer commutes", "Less flexible hours", "Feeling lonely", "Lower salaries"], answer: 2,
  },
  {
    id: "en-r-b1-2", skill: "reading", level: "B1",
    passage: "The museum will be closed for renovation from March to June. During this period, some of its most famous pieces will be shown at the city library, where entry is free.",
    prompt: "What will happen during the renovation?", options: ["The museum will be free", "Some pieces will move to the library", "The library will close", "All pieces will be stored"], answer: 1,
  },
  {
    id: "en-r-b2-1", skill: "reading", level: "B2",
    passage: "Although the start-up's revenue doubled last year, its losses widened, as it spent heavily on marketing in an attempt to gain market share before its competitors could react.",
    prompt: "Why did the company's losses increase?", options: ["Revenue fell", "It invested a lot in marketing", "Competitors lowered prices", "It lost market share"], answer: 1,
  },
  {
    id: "en-r-b2-2", skill: "reading", level: "B2",
    passage: "Critics argue that the new regulation, while well-intentioned, places a disproportionate burden on small businesses, which lack the legal departments that larger firms rely on to ensure compliance.",
    prompt: "What is the critics' main concern?", options: ["The rule has bad intentions", "Large firms will break the rule", "Small businesses are affected unfairly", "Legal departments are too expensive"], answer: 2,
  },
  {
    id: "en-r-c1-1", skill: "reading", level: "C1",
    passage: "The author's portrayal of the city is less a faithful record than a palimpsest: earlier versions of the streets bleed through each description, so that the present is never quite free of what it replaced.",
    prompt: "What does the author suggest about the city's descriptions?", options: ["They are purely historical", "They mix past and present layers", "They are deliberately inaccurate", "They ignore the present"], answer: 1,
  },
  {
    id: "en-r-c1-2", skill: "reading", level: "C1",
    passage: "Far from settling the debate, the study's findings have, if anything, muddied the waters, since its sample was too narrow to support the sweeping conclusions some commentators drew from it.",
    prompt: "What is the writer's view of the study?", options: ["It ended the debate", "Its conclusions were overstated by some", "Its sample was very broad", "It was ignored by commentators"], answer: 1,
  },

  // ---------------- Listening (spoken by the browser voice) ----------------
  { id: "en-l-a1-1", skill: "listening", level: "A1", audio: "Hello, I'm Lina. I'm from Jordan.", prompt: "Where is Lina from?", options: ["Japan", "Jordan", "Germany", "Egypt"], answer: 1 },
  { id: "en-l-a1-2", skill: "listening", level: "A1", audio: "It's half past seven.", prompt: "What time is it?", options: ["7:00", "7:15", "7:30", "6:30"], answer: 2 },
  { id: "en-l-a2-1", skill: "listening", level: "A2", audio: "Could I have a large orange juice and a cheese sandwich, please?", prompt: "What does the speaker order?", options: ["Coffee and cake", "Orange juice and a sandwich", "Water and salad", "Tea and a sandwich"], answer: 1 },
  { id: "en-l-a2-2", skill: "listening", level: "A2", audio: "Go straight, then take the second street on the left. The bank is next to the pharmacy.", prompt: "Where is the bank?", options: ["Opposite the school", "Next to the pharmacy", "On the first street on the right", "Behind the station"], answer: 1 },
  { id: "en-l-b1-1", skill: "listening", level: "B1", audio: "I was going to take the bus, but it was so late that I ended up walking, and I still arrived before it did.", prompt: "How did the speaker get there?", options: ["By bus", "On foot", "By taxi", "By car"], answer: 1 },
  { id: "en-l-b1-2", skill: "listening", level: "B1", audio: "The meeting has been moved from Tuesday to Thursday afternoon, because the manager is travelling at the start of the week.", prompt: "Why was the meeting moved?", options: ["The room was booked", "The manager is away", "It was too long", "Thursday is a holiday"], answer: 1 },
  { id: "en-l-b2-1", skill: "listening", level: "B2", audio: "Frankly, the proposal looks good on paper, but I doubt we have the staff to implement it within the time frame they're suggesting.", prompt: "What is the speaker's concern?", options: ["The proposal is badly written", "There may not be enough staff", "The deadline is too far away", "The cost is too high"], answer: 1 },
  { id: "en-l-b2-2", skill: "listening", level: "B2", audio: "Had I known the flight would be cancelled, I wouldn't have checked out of the hotel so early this morning.", prompt: "What does the speaker regret?", options: ["Booking the flight", "Leaving the hotel early", "Missing breakfast", "Arriving late"], answer: 1 },
  { id: "en-l-c1-1", skill: "listening", level: "C1", audio: "Their apology came across as rather perfunctory; it was as though they were ticking a box rather than genuinely acknowledging the harm.", prompt: "How did the apology seem?", options: ["Sincere and detailed", "Superficial", "Aggressive", "Overly emotional"], answer: 1 },
  { id: "en-l-c1-2", skill: "listening", level: "C1", audio: "While the figures are encouraging, it would be premature to declare victory; one good quarter does not make a trend.", prompt: "What does the speaker think?", options: ["Success is certain", "It is too early to celebrate", "The figures are disappointing", "The trend is clearly negative"], answer: 1 },
];
