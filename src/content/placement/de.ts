import type { PlacementItem } from "../types";

/** German placement bank: 2 items per skill per level (A1–C1). */
export const dePlacement: PlacementItem[] = [
  // ---------------- Wortschatz ----------------
  { id: "de-v-a1-1", skill: "vocabulary", level: "A1", prompt: "Welches Wort ist ein Getränk?", options: ["Brot", "Tee", "Tisch", "Auto"], answer: 1 },
  { id: "de-v-a1-2", skill: "vocabulary", level: "A1", prompt: "Der Vater von meinem Vater ist mein …", options: ["Onkel", "Bruder", "Großvater", "Sohn"], answer: 2 },
  { id: "de-v-a2-1", skill: "vocabulary", level: "A2", prompt: "Ich möchte ein Zimmer für zwei Nächte ___.", options: ["reservieren", "bezahlen", "schreiben", "kochen"], answer: 0 },
  { id: "de-v-a2-2", skill: "vocabulary", level: "A2", prompt: "Das Gegenteil von „laut“ ist …", options: ["schnell", "leise", "kalt", "leer"], answer: 1 },
  { id: "de-v-b1-1", skill: "vocabulary", level: "B1", prompt: "Kannst du mir bitte bei den Hausaufgaben ___?", options: ["helfen", "hören", "holen", "halten"], answer: 0 },
  { id: "de-v-b1-2", skill: "vocabulary", level: "B1", prompt: "Wegen des Streiks ist der Zug leider ___.", options: ["ausgefallen", "eingefallen", "aufgefallen", "zugefallen"], answer: 0 },
  { id: "de-v-b2-1", skill: "vocabulary", level: "B2", prompt: "Die Firma musste wegen hoher Kosten 200 Stellen ___.", options: ["abbauen", "aufbauen", "anbauen", "umbauen"], answer: 0 },
  { id: "de-v-b2-2", skill: "vocabulary", level: "B2", prompt: "Seine Argumente waren nicht ___, deshalb überzeugte er niemanden.", options: ["stichhaltig", "vorsichtig", "gleichgültig", "nachlässig"], answer: 0 },
  { id: "de-v-c1-1", skill: "vocabulary", level: "C1", prompt: "Die Ministerin versuchte, die Vorwürfe zu ___.", options: ["entkräften", "verstärken", "erfassen", "beantragen"], answer: 0 },
  { id: "de-v-c1-2", skill: "vocabulary", level: "C1", prompt: "Der Bericht ___ die Probleme nur oberflächlich.", options: ["streift", "stiftet", "stützt", "stürzt"], answer: 0 },

  // ---------------- Grammatik ----------------
  { id: "de-g-a1-1", skill: "grammar", level: "A1", prompt: "Ich ___ aus Ägypten.", options: ["kommst", "komme", "kommt", "kommen"], answer: 1 },
  { id: "de-g-a1-2", skill: "grammar", level: "A1", prompt: "Das ist ___ Tisch.", options: ["die", "das", "der", "den"], answer: 2 },
  { id: "de-g-a2-1", skill: "grammar", level: "A2", prompt: "Gestern ___ ich ins Kino gegangen.", options: ["habe", "bin", "war", "hatte"], answer: 1 },
  { id: "de-g-a2-2", skill: "grammar", level: "A2", prompt: "Ich schenke ___ Mutter Blumen.", options: ["meine", "meinen", "meiner", "mein"], answer: 2 },
  { id: "de-g-b1-1", skill: "grammar", level: "B1", prompt: "Ich weiß nicht, ob er heute ___.", options: ["kommt", "kommt er", "komme", "kommen"], answer: 0 },
  { id: "de-g-b1-2", skill: "grammar", level: "B1", prompt: "Wenn ich Zeit ___, würde ich mehr reisen.", options: ["habe", "hätte", "hatte", "haben"], answer: 1 },
  { id: "de-g-b2-1", skill: "grammar", level: "B2", prompt: "Das Haus, ___ Dach repariert wird, gehört meinem Onkel.", options: ["dessen", "deren", "dem", "das"], answer: 0 },
  { id: "de-g-b2-2", skill: "grammar", level: "B2", prompt: "Der Brief muss bis morgen ___ werden.", options: ["geschrieben", "schreiben", "geschreibt", "schrieb"], answer: 0 },
  { id: "de-g-c1-1", skill: "grammar", level: "C1", prompt: "___ der schlechten Wetterlage fand das Konzert statt.", options: ["Trotz", "Wegen", "Dank", "Statt"], answer: 0 },
  { id: "de-g-c1-2", skill: "grammar", level: "C1", prompt: "Er sprach so, als ___ er der Chef.", options: ["ist", "wäre", "war", "sei gewesen"], answer: 1 },

  // ---------------- Lesen ----------------
  {
    id: "de-r-a1-1", skill: "reading", level: "A1",
    passage: "Hallo! Ich heiße Karim. Ich bin 25 Jahre alt und wohne in Berlin. Ich arbeite als Koch.",
    prompt: "Was ist Karim von Beruf?", options: ["Lehrer", "Koch", "Student", "Arzt"], answer: 1,
  },
  {
    id: "de-r-a1-2", skill: "reading", level: "A1",
    passage: "Die Bäckerei ist von Montag bis Samstag von 7 bis 18 Uhr geöffnet. Am Sonntag ist sie geschlossen.",
    prompt: "Wann ist die Bäckerei geschlossen?", options: ["Am Montag", "Am Samstag um 10 Uhr", "Am Sonntag", "Am Dienstag um 8 Uhr"], answer: 2,
  },
  {
    id: "de-r-a2-1", skill: "reading", level: "A2",
    passage: "Liebe Anna, vielen Dank für die Einladung! Leider kann ich am Samstag nicht kommen, weil meine Eltern zu Besuch sind. Viel Spaß bei der Party! Liebe Grüße, Tom",
    prompt: "Warum kommt Tom nicht?", options: ["Er ist krank", "Er muss arbeiten", "Seine Eltern besuchen ihn", "Er hat keine Lust"], answer: 2,
  },
  {
    id: "de-r-a2-2", skill: "reading", level: "A2",
    passage: "Achtung: Wegen Bauarbeiten fährt die Linie 5 ab Montag nicht bis zum Hauptbahnhof. Bitte nehmen Sie den Bus 12.",
    prompt: "Was sollen die Fahrgäste machen?", options: ["Die Linie 5 nehmen", "Den Bus 12 nehmen", "Zu Fuß gehen", "Am Montag zu Hause bleiben"], answer: 1,
  },
  {
    id: "de-r-b1-1", skill: "reading", level: "B1",
    passage: "Immer mehr Menschen kaufen Lebensmittel online. Das spart Zeit, aber viele Kunden kritisieren, dass Obst und Gemüse oft nicht so frisch sind wie im Supermarkt.",
    prompt: "Was kritisieren viele Kunden?", options: ["Die hohen Preise", "Die Lieferzeit", "Die Frische der Produkte", "Die Webseite"], answer: 2,
  },
  {
    id: "de-r-b1-2", skill: "reading", level: "B1",
    passage: "Die Stadtbibliothek bietet ab sofort auch am Sonntag Öffnungszeiten an. Damit reagiert sie auf Wünsche von Studierenden, die unter der Woche arbeiten.",
    prompt: "Warum öffnet die Bibliothek jetzt am Sonntag?", options: ["Weil sie renoviert wird", "Weil Studierende das wünschen", "Weil sie weniger Besucher hat", "Weil der Eintritt jetzt frei ist"], answer: 1,
  },
  {
    id: "de-r-b2-1", skill: "reading", level: "B2",
    passage: "Obwohl die Umsätze des Unternehmens gestiegen sind, bleibt der Gewinn hinter den Erwartungen zurück, da die Energiekosten deutlich stärker gestiegen sind als prognostiziert.",
    prompt: "Warum ist der Gewinn niedriger als erwartet?", options: ["Die Umsätze sind gesunken", "Die Energiekosten sind stark gestiegen", "Es gab weniger Kunden", "Die Prognose war zu niedrig"], answer: 1,
  },
  {
    id: "de-r-b2-2", skill: "reading", level: "B2",
    passage: "Kritiker bemängeln, dass das neue Gesetz zwar gut gemeint sei, kleine Betriebe aber unverhältnismäßig belaste, da ihnen die Ressourcen für den zusätzlichen Verwaltungsaufwand fehlten.",
    prompt: "Was ist der Hauptkritikpunkt?", options: ["Das Gesetz ist schlecht gemeint", "Große Firmen werden benachteiligt", "Kleine Betriebe werden zu stark belastet", "Die Verwaltung arbeitet zu langsam"], answer: 2,
  },
  {
    id: "de-r-c1-1", skill: "reading", level: "C1",
    passage: "Die Autorin zeichnet kein nostalgisches Bild der Provinz; vielmehr legt sie die Widersprüche offen, die hinter der vermeintlichen Idylle verborgen liegen.",
    prompt: "Wie stellt die Autorin die Provinz dar?", options: ["Romantisch verklärt", "Kritisch und differenziert", "Als langweilig", "Als rein historisch"], answer: 1,
  },
  {
    id: "de-r-c1-2", skill: "reading", level: "C1",
    passage: "Statt die Debatte zu beenden, haben die Ergebnisse der Studie sie eher noch verkompliziert, zumal die Stichprobe zu klein war, um die weitreichenden Schlüsse zu rechtfertigen, die manche daraus zogen.",
    prompt: "Wie bewertet der Text die Studie?", options: ["Sie hat die Debatte beendet", "Manche haben zu weitreichende Schlüsse gezogen", "Die Stichprobe war sehr groß", "Sie wurde nicht beachtet"], answer: 1,
  },

  // ---------------- Hören (Browserstimme) ----------------
  { id: "de-l-a1-1", skill: "listening", level: "A1", audio: "Guten Tag, ich heiße Sara. Ich komme aus Marokko.", prompt: "Woher kommt Sara?", options: ["Aus Mexiko", "Aus Marokko", "Aus Malta", "Aus Monaco"], answer: 1 },
  { id: "de-l-a1-2", skill: "listening", level: "A1", audio: "Es ist halb acht.", prompt: "Wie spät ist es?", options: ["8:30", "7:30", "8:00", "7:00"], answer: 1 },
  { id: "de-l-a2-1", skill: "listening", level: "A2", audio: "Ich hätte gern einen Kaffee mit Milch und ein Stück Apfelkuchen, bitte.", prompt: "Was bestellt die Person?", options: ["Tee und Kuchen", "Kaffee und Apfelkuchen", "Wasser und Brot", "Kaffee und ein Brötchen"], answer: 1 },
  { id: "de-l-a2-2", skill: "listening", level: "A2", audio: "Gehen Sie geradeaus und dann die zweite Straße rechts. Die Apotheke ist neben der Post.", prompt: "Wo ist die Apotheke?", options: ["Neben der Post", "Gegenüber der Schule", "Die erste Straße links", "Hinter dem Bahnhof"], answer: 0 },
  { id: "de-l-b1-1", skill: "listening", level: "B1", audio: "Eigentlich wollte ich mit dem Auto fahren, aber es ist nicht angesprungen, deshalb habe ich die S-Bahn genommen.", prompt: "Wie ist die Person gefahren?", options: ["Mit dem Auto", "Mit der S-Bahn", "Mit dem Fahrrad", "Mit dem Taxi"], answer: 1 },
  { id: "de-l-b1-2", skill: "listening", level: "B1", audio: "Die Besprechung wird von Dienstag auf Donnerstag verschoben, weil die Chefin Anfang der Woche auf Dienstreise ist.", prompt: "Warum wird die Besprechung verschoben?", options: ["Der Raum ist besetzt", "Die Chefin ist verreist", "Donnerstag ist ein Feiertag", "Es gibt zu viele Themen"], answer: 1 },
  { id: "de-l-b2-1", skill: "listening", level: "B2", audio: "Der Vorschlag klingt zwar überzeugend, aber ich bezweifle, dass wir genug Personal haben, um ihn in so kurzer Zeit umzusetzen.", prompt: "Was bezweifelt die Person?", options: ["Dass der Vorschlag gut ist", "Dass genug Personal da ist", "Dass es zu teuer ist", "Dass die Zeit zu lang ist"], answer: 1 },
  { id: "de-l-b2-2", skill: "listening", level: "B2", audio: "Hätte ich gewusst, dass der Flug gestrichen wird, hätte ich das Hotel nicht so früh verlassen.", prompt: "Was bedauert die Person?", options: ["Den Flug gebucht zu haben", "Das Hotel früh verlassen zu haben", "Zu spät gekommen zu sein", "Das Frühstück verpasst zu haben"], answer: 1 },
  { id: "de-l-c1-1", skill: "listening", level: "C1", audio: "Die Entschuldigung wirkte eher pflichtschuldig, als ginge es darum, ein Formular abzuhaken, statt den Schaden ernsthaft anzuerkennen.", prompt: "Wie wirkte die Entschuldigung?", options: ["Aufrichtig", "Oberflächlich", "Aggressiv", "Sehr emotional"], answer: 1 },
  { id: "de-l-c1-2", skill: "listening", level: "C1", audio: "Die Zahlen sind ermutigend, doch es wäre verfrüht, schon jetzt von einer Trendwende zu sprechen.", prompt: "Was meint die Person?", options: ["Die Trendwende ist sicher", "Es ist zu früh für ein Urteil", "Die Zahlen sind enttäuschend", "Der Trend ist negativ"], answer: 1 },
];
