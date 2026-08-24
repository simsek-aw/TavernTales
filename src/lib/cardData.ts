export interface Card {
  gegner: string;
  waffe: string;
  szene: string;
  konsequenz: string;
}

export const GEGNER = [
  "Goblin-Krieger",
  "Troll",
  "Dunkler Ritter",
  "Magier",
  "Banditen-Boss",
  "Drache",
  "Riese",
  "Dämon",
  "Kult-Anführer",
  "Koloss",
] as const;

export const WAFFE = [
  "Legendäres Schwert",
  "Verfluchter Dolch",
  "Magie",
  "Schildsplitter",
  "Giftpfeil",
  "Feuer-Bombe",
  "Kette",
  "Mystischer Ring",
  "Faustkampf",
  "Kampftechniken",
] as const;

export const SZENE = [
  "Taverne",
  "Schlachtfeld",
  "Dungeon",
  "Brücke",
  "Belagerung",
  "Verfolgung",
  "Turnier",
  "Hinterhalt",
  "Nachtkampf",
  "Letzter Stand",
] as const;

export const KONSEQUENZ = [
  "...ich war verletzt",
  "...es war eine Falle",
  "...ich war allein",
  "...es war unmöglich",
  "...war mein letzter Versuch",
  "...ich hatte fast keine Waffe",
  "...ich war im Sturm",
  "...andere hielten mich für tot",
  "...ich entkam kaum",
  "...mein Gegner war übermächtig",
] as const;

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCard(): Card {
  return {
    gegner: randomFrom(GEGNER),
    waffe: randomFrom(WAFFE),
    szene: randomFrom(SZENE),
    konsequenz: randomFrom(KONSEQUENZ),
  };
}

export function generateDeck(size = 40): Card[] {
  return Array.from({ length: size }, () => generateCard());
}

export function cardToText(card: Card): string {
  return `Ich besiegte einen ${card.gegner} mit ${card.waffe} bei ${card.szene}, ${card.konsequenz}`;
}
