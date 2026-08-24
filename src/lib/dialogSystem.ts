import type { Opponent } from "./gameState";

export interface OpponentDialogs {
  entrance: string;
  introLines: string[];
  believes: string[];
  doubts: string[];
  believesCorrectly: string[];
  doubtsCorrectly: string[];
  won: string;
  lost: string;
}

export const DIALOGS: Record<string, OpponentDialogs> = {
  aldric: {
    entrance: "Die Tür der Taverne fliegt auf. Aldric der Gefeierte betritt den Raum, als gehöre ihm der Boden unter jedem Stiefel.",
    introLines: [
      "Die Thekendame hebt den Kopf. \"Aldric! Setz dich, ich schenk dir nach.\"",
      "Aldric grinst breit und lässt sich auf die Eckbank fallen. \"Ich allein. Mein Schwert. Und wir kämpften gegen eine Übermacht, die sich niemand vorstellen kann.\"",
      "Die Gäste lauschen gebannt. Er erzählt von einem Drachen, den er im Alleingang bezwungen habe.",
      "\"Und du,\" sagt er und deutet beiläufig in deine Richtung, \"du hast mir wenigstens den Rücken freigehalten. Nicht schlecht — für einen Anfänger.\"",
      "Die Thekendame lacht. \"Knappe, schenk dem Helden nach! Und dir... billigplörre reicht ja wohl.\"",
      "Du spürst, wie sich etwas in dir zusammenzieht. Zeit, deine eigene Geschichte zu erzählen.",
    ],
    believes: [
      "Interessant. Aber das macht dich noch lange nicht zu meinem Ebenbild.",
      "Hmpf. Vielleicht habe ich dich unterschätzt.",
      "Nicht die schlechteste Geschichte, die ich heute gehört habe.",
    ],
    doubts: [
      "Das ist pure Erfindung. Ich war dort, so etwas wäre mir aufgefallen.",
      "Du versuchst nur, auf meiner Welle mitzureiten.",
      "Ha! Wer soll dir das glauben?",
    ],
    believesCorrectly: [
      "...Es stimmt wirklich. Verdammt.",
      "Du... du warst tatsächlich dort?",
    ],
    doubtsCorrectly: [
      "Ich wusste es! Erfunden, jedes Wort!",
      "Durchschaut. Deine Lügen sind dünner als Bier hier.",
    ],
    won: "Aldric erhebt sich langsam. \"Vielleicht... vielleicht bist du wirklich mehr als eine Randnotiz in meiner Geschichte.\"",
    lost: "Das kann nicht sein! ICH bin Aldric der Gefeierte, und daran wird sich nichts ändern!",
  },
  grok: {
    entrance: "Auf dem belebten Marktplatz bahnt sich eine grüne Gestalt einen Weg durch die Menge. Grok der Grüne baut sich vor dir auf.",
    introLines: [
      "\"Du bist der, der mich angeblich besiegt hat?\" Seine Stimme ist tief und misstrauisch.",
      "\"Ich habe gehört, was du in der Taverne erzählt hast. Beweis es mir. Hier. Jetzt.\"",
      "Die Marktgänger bilden einen Kreis. Grok verschränkt die Arme.",
    ],
    believes: [
      "Hmpf. Klingt nach etwas, das tatsächlich passiert sein könnte.",
      "Nicht schlecht. Aber ich beobachte dich weiter.",
    ],
    doubts: [
      "Beweise. Ich will Beweise, keine Ausschmückung.",
      "Das klingt konstruiert. Versuch's noch mal.",
    ],
    believesCorrectly: [
      "...Bei den Ahnen. Das war wirklich so.",
      "Ich hätte es nicht gedacht, aber es stimmt.",
    ],
    doubtsCorrectly: [
      "Genau wie ich dachte. Erfunden.",
      "Deine Geschichten werden mit jedem Mal dünner.",
    ],
    won: "Grok senkt langsam die Fäuste. \"Respekt. Echter Respekt, nicht nur Geschwätz.\"",
    lost: "\"Genug Geschichten für heute,\" knurrt Grok. \"Ich glaube dir kein Wort mehr.\"",
  },
};

export function getDialogs(opponent: Opponent): OpponentDialogs {
  return DIALOGS[opponent.id] ?? DIALOGS.aldric;
}

export function randomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

export const ALDRIC: Opponent = {
  id: "aldric",
  name: "Aldric der Gefeierte",
  biasType: "vain",
  respekt: 5,
  difficulty: 1,
  knownStories: [],
};

export const GROK: Opponent = {
  id: "grok",
  name: "Grok der Grüne",
  biasType: "direct",
  respekt: 5,
  difficulty: 2,
  knownStories: [],
};
