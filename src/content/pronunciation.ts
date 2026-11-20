import type { Cefr } from "./types";

/** Practice sentences per language (learners can also type their own). */
export const PRON_SENTENCES: Record<string, { level: Cefr; text: string }[]> = {
  en: [
    { level: "A1", text: "Hello, my name is Sara." },
    { level: "A1", text: "I would like a cup of coffee, please." },
    { level: "A2", text: "The weather is very nice this morning." },
    { level: "A2", text: "Thirty-three thirsty birds sat on a tree." },
    { level: "B1", text: "I have been working here for three years." },
    { level: "B1", text: "Could you tell me how to get to the station?" },
  ],
  de: [
    { level: "A1", text: "Guten Morgen, ich heiße Karim." },
    { level: "A1", text: "Ich möchte einen Kaffee, bitte." },
    { level: "A2", text: "Ich wohne seit zwei Jahren in München." },
    { level: "A2", text: "Zwölf Zwerge zählen zwanzig Zwiebeln." },
    { level: "B1", text: "Könnten Sie mir bitte den Weg zum Bahnhof zeigen?" },
    { level: "B1", text: "Ich freue mich sehr auf das Wochenende." },
  ],
};
