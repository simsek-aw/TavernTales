import type { Opponent } from "./gameState";

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface OpponentDialogs {
  intro: DialogLine[];
  /** Gegner zweifelt eine Geschichte des Spielers an. */
  doubts: string[];
  /** Gegner glaubt und übertrumpft. */
  raises: string[];
  /** Aufdeckung – aus Sicht des Gegners. */
  caughtPlayer: string[];
  wronglyDoubted: string[];
  caughtLying: string[];
  provedTrue: string[];
  won: string;
  lost: string;
  winText: string;
  loseText: string;
}

const ERZ = "Erzähler";
const WIRTIN = "Wirtin Hanne";

export const DIALOGS: Record<Opponent["id"], OpponentDialogs> = {
  aldric: {
    intro: [
      { speaker: ERZ, text: "Drei Tage Regen. Deine Stiefel sind durch, dein Beutel ist leer. Über der Tür hängt ein schiefer Krug." },
      { speaker: ERZ, text: "Drinnen ist es warm und laut. Am Brett neben der Theke hängt ein einziger Zettel: GELEITSCHUTZ NACH NORDEN – 50 GOLD." },
      { speaker: WIRTIN, text: "Den Auftrag? Vergiss es. Den kriegt nur, wessen Namen man hier kennt." },
      { speaker: "Aldric der Gefeierte", text: "Und hier kennt man meinen. Ich hab mehr Trolle erschlagen, als du Krüge getrunken hast." },
      { speaker: WIRTIN, text: "Es gibt einen Weg. Hier wird geprahlt, nicht gefragt. Wer Aldric beim Prahlen schlägt, kriegt den Zettel." },
      { speaker: WIRTIN, text: "Jeder zieht vier Trophäen von meiner Wand. Erzählt, was ihr wollt – solange keiner zweifelt, gilt es." },
      { speaker: WIRTIN, text: "Jede Geschichte muss die letzte übertreffen. Wer nicht mehr übertrumpfen will, zweifelt – dann werden die Trophäen gezeigt." },
      { speaker: WIRTIN, text: "Wer beim Lügen erwischt wird oder zu Unrecht zweifelt, verliert Respekt. Wer auf den Tisch haut, setzt doppelt." },
      { speaker: "Aldric der Gefeierte", text: "Fang an, Neuling. Ich hab Zeit." },
    ],
    doubts: ["Das ist pure Erfindung. Zeig her!", "Ha! Wer soll dir das glauben? Trophäen auf den Tisch!", "Du reitest auf meiner Welle. Beweis es."],
    raises: ["Niedlich. Hör dir das an:", "Das nennst du eine Geschichte? Pass auf.", "Pah. Das hab ich vor dem Frühstück erledigt."],
    caughtPlayer: ["Ich wusste es! Erfunden, jedes Wort!", "Durchschaut. Deine Lügen sind dünner als das Bier hier."],
    wronglyDoubted: ["...Es stimmt wirklich. Verdammt.", "Du... warst tatsächlich dort?"],
    caughtLying: ["Das... das war eine Übertreibung. Eine künstlerische!", "Hmpf. Jeder schmückt mal aus."],
    provedTrue: ["Siehst du? Aldric lügt nicht.", "Da. Schwarz auf weiß. Oder eher: Zahn auf Tisch."],
    won: "Ich bin Aldric der Gefeierte. Daran ändert kein Neuling etwas.",
    lost: "Vielleicht... bist du wirklich mehr als eine Randnotiz.",
    winText: "Die Wirtin reicht dir den Zettel. Die Taverne klopft auf die Tische.",
    loseText: "Aldric steckt den Zettel ein. Die Taverne lacht – über dich.",
  },
  grok: {
    intro: [
      { speaker: ERZ, text: "Zwei Tage später, am Nordtor der Stadt. Die Karawane ist beladen, der Karawanenmeister zählt die Wachen." },
      { speaker: "Karawanenmeister", text: "Zwei Zettel, eine Stelle. Ich nehme nur einen von euch mit." },
      { speaker: ERZ, text: "Neben dir lehnt ein Goblin-Söldner mit vernarbtem Gesicht. Grok der Grüne." },
      { speaker: "Grok der Grüne", text: "Du bist also die Person, die Aldric geschlagen hat? Ich hab gehört, wie du spielst." },
      { speaker: "Grok der Grüne", text: "Keine Tricks, die ich nicht kenne. Gleiche Regeln wie im Krummen Krug. Los." },
    ],
    doubts: ["Beweise. Keine Ausschmückung.", "Das klingt konstruiert. Zeig her.", "Nein. Das kauf ich dir nicht ab."],
    raises: ["Hmpf. Meine ist besser.", "Das ist alles? Hör zu.", "Gut. Aber nicht gut genug."],
    caughtPlayer: ["Genau wie ich dachte. Erfunden.", "Man hat mich vor dir gewarnt."],
    wronglyDoubted: ["...Bei den Ahnen. Das war wirklich so.", "Hätte ich nicht gedacht."],
    caughtLying: ["Tch. Einen Versuch war's wert.", "Na und? Du hättest es fast geschluckt."],
    provedTrue: ["Grok lügt nicht. Meistens.", "Da. Hab ich dir doch gesagt."],
    won: "Genug Geschichten für heute. Die Stelle gehört mir.",
    lost: "Respekt. Echter Respekt, nicht nur Geschwätz.",
    winText: "Der Karawanenmeister nickt dir zu. Grok spuckt aus – und grinst dann doch.",
    loseText: "Grok schwingt sich auf den Wagen. Die Karawane zieht ohne dich los.",
  },
};

export function getDialogs(opponent: Opponent): OpponentDialogs {
  return DIALOGS[opponent.id];
}

export function randomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

export const ALDRIC: Opponent = {
  id: "aldric",
  name: "Aldric der Gefeierte",
  persona: {
    // Eitel: glaubt gern, blufft viel – und verrät sich dabei.
    doubtThreshold: 0.58,
    bluffRate: 0.75,
    noise: 0.12,
    tell: { text: "Aldric streicht über den Griff seines Schwerts.", pWhenLying: 0.7, pWhenTruthful: 0.12 },
    neutralFlavor: ["Aldric nimmt einen großen Schluck.", "Aldric lehnt sich zurück.", "Aldric zwinkert der Wirtin zu."],
    einsatzWhenLying: 0.3,
    einsatzWhenTruthful: 0.3,
  },
};

export const GROK: Opponent = {
  id: "grok",
  name: "Grok der Grüne",
  persona: {
    // Direkt: zweifelt schnell, blufft selten – verrät sich aber über den Einsatz.
    doubtThreshold: 0.48,
    bluffRate: 0.45,
    noise: 0.08,
    tell: { text: "Grok grinst breit.", pWhenLying: 0.25, pWhenTruthful: 0.2 },
    neutralFlavor: ["Grok verschränkt die Arme.", "Grok kratzt sich am Ohr.", "Grok mustert dich."],
    einsatzWhenLying: 0.7,
    einsatzWhenTruthful: 0.2,
  },
};
