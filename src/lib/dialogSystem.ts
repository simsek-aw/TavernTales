import type { CrowdComment, Opponent } from "./gameState";

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
  /** Gegner prangert einen Widerspruch des Spielers an. */
  callsContradiction: string[];
  /** Spieler hat den Gegner beim Widerspruch erwischt. */
  caughtContradicting: string[];
  /** Spieler hat zu Unrecht „Widerspruch!“ gerufen. */
  falseContradiction: string[];
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
      { speaker: WIRTIN, text: "Und merkt euch, was ihr erzählt. Wer denselben Troll heute allein und morgen nachts erschlagen hat, dem ruft man „Widerspruch!“ zu." },
      { speaker: WIRTIN, text: "Die Gäste reden übrigens gern dazwischen. Manche wissen was. Die meisten nur, wo der nächste Krug steht." },
      { speaker: "Aldric der Gefeierte", text: "Fang an, Neuling. Ich hab Zeit." },
    ],
    doubts: ["Das ist pure Erfindung. Zeig her!", "Ha! Wer soll dir das glauben? Trophäen auf den Tisch!", "Du reitest auf meiner Welle. Beweis es."],
    raises: ["Niedlich. Hör dir das an:", "Das nennst du eine Geschichte? Pass auf.", "Pah. Das hab ich vor dem Frühstück erledigt."],
    caughtPlayer: ["Ich wusste es! Erfunden, jedes Wort!", "Durchschaut. Deine Lügen sind dünner als das Bier hier."],
    wronglyDoubted: ["...Es stimmt wirklich. Verdammt.", "Du... warst tatsächlich dort?"],
    caughtLying: ["Das... das war eine Übertreibung. Eine künstlerische!", "Hmpf. Jeder schmückt mal aus."],
    provedTrue: ["Siehst du? Aldric lügt nicht.", "Da. Schwarz auf weiß. Oder eher: Zahn auf Tisch."],
    callsContradiction: ["Moment! Das hast du vorhin ganz anders erzählt!", "Widerspruch! Hat noch jemand zugehört?"],
    caughtContradicting: ["Ich... erzähle eben viele Geschichten. Da verwechselt man mal was.", "Das war ein anderer Troll! Ein ganz anderer!"],
    falseContradiction: ["Widerspruch? Ich erzähle jede Geschichte gleich. Jedes Mal.", "Hör besser zu, Neuling."],
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
      { speaker: "Grok der Grüne", text: "Ich kenne auch deine Geschichten aus dem Krug. Erzähl sie mir ruhig anders – ich merk's." },
      { speaker: "Grok der Grüne", text: "Keine Tricks, die ich nicht kenne. Gleiche Regeln wie im Krummen Krug. Los." },
    ],
    doubts: ["Beweise. Keine Ausschmückung.", "Das klingt konstruiert. Zeig her.", "Nein. Das kauf ich dir nicht ab."],
    raises: ["Hmpf. Meine ist besser.", "Das ist alles? Hör zu.", "Gut. Aber nicht gut genug."],
    caughtPlayer: ["Genau wie ich dachte. Erfunden.", "Man hat mich vor dir gewarnt."],
    wronglyDoubted: ["...Bei den Ahnen. Das war wirklich so.", "Hätte ich nicht gedacht."],
    caughtLying: ["Tch. Einen Versuch war's wert.", "Na und? Du hättest es fast geschluckt."],
    provedTrue: ["Grok lügt nicht. Meistens.", "Da. Hab ich dir doch gesagt."],
    callsContradiction: ["Im Krummen Krug klang das aber anders.", "Widerspruch. Ich hab ein gutes Gedächtnis."],
    caughtContradicting: ["Tch. Gut aufgepasst.", "...Verdammt."],
    falseContradiction: ["Da ist kein Widerspruch. Du rätst nur.", "Falsch gemerkt, Mensch."],
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
    // Hört vor allem sich selbst zu – und vergisst seine eigenen Geschichten.
    noticeContradiction: 0.55,
    legendDiscipline: 0.6,
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
    noticeContradiction: 0.95,
    legendDiscipline: 0.95,
  },
};

/**
 * Gäste kommentieren die Geschichten des Gegners. Jeder Gast hat eine feste, verborgene
 * Zuverlässigkeit – wem man trauen kann, muss man selbst herausfinden.
 */
interface Guest {
  name: string;
  reliability: number;
  weight: number;
  believes: string[];
  doubts: string[];
}

export const GUESTS: Record<Opponent["id"], Guest[]> = {
  aldric: [
    {
      name: "Bruno, der alte Jäger",
      reliability: 0.85,
      weight: 2,
      believes: ["Hm. Könnte stimmen.", "Das passt zu dem, was man im Wald so hört."],
      doubts: ["So jagt keiner, der je gejagt hat.", "Da stimmt was nicht, glaubt mir."],
    },
    {
      name: "Ein betrunkener Bauer",
      reliability: 0.5,
      weight: 3,
      believes: ["Jawoll! Hab ich selbst gesehen! Glaub ich!", "Das ist wahr! Prost!"],
      doubts: ["Lüüüüge! Hicks.", "Glaub ich nicht. Glaub ich gar nix mehr."],
    },
    {
      name: "Wirtin Hanne",
      reliability: 0.95,
      weight: 1,
      believes: ["Das hat er mir schon vor Wochen erzählt. Stimmt wohl.", "Lass ihn, das ist wahr."],
      doubts: ["Das höre ich heute zum ersten Mal.", "Hm. Letzten Monat war er nicht mal in der Gegend."],
    },
  ],
  grok: [
    {
      name: "Eine Karawanenwächterin",
      reliability: 0.8,
      weight: 2,
      believes: ["Das deckt sich mit dem, was die Händler erzählen.", "Klingt glaubwürdig."],
      doubts: ["Davon hätte man auf der Straße gehört.", "Nee. Das hätte sich rumgesprochen."],
    },
    {
      name: "Ein Marktschreier",
      reliability: 0.45,
      weight: 3,
      believes: ["Unglaublich, aber wahr, meine Damen und Herren!", "Ein Held! Ein wahrer Held!"],
      doubts: ["Märchen! Märchen für zwei Kupfer!", "Das kauft ihm keiner ab!"],
    },
    {
      name: "Der Karawanenmeister",
      reliability: 0.95,
      weight: 1,
      believes: ["Das stimmt. Ich kenne Leute, die dabei waren.", "Hm. Das habe ich auch gehört."],
      doubts: ["Das halte ich für erfunden.", "Davon weiß ich nichts – und ich weiß viel."],
    },
  ],
};

export const CROWD_CHANCE = 0.45;

export function crowdComment(opponent: Opponent, truthful: boolean): CrowdComment | null {
  if (Math.random() > CROWD_CHANCE) return null;
  const guests = GUESTS[opponent.id];
  let r = Math.random() * guests.reduce((sum, g) => sum + g.weight, 0);
  const guest = guests.find((g) => (r -= g.weight) < 0) ?? guests[0];
  const saysTrue = Math.random() < guest.reliability ? truthful : !truthful;
  return { guest: guest.name, text: randomLine(saysTrue ? guest.believes : guest.doubts) };
}
