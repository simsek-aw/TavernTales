// Minimal deck: 5 Gegner-Arten, 4 Umstände als Attribut. Jede Karte = eine Trophäe
// mit genau einem Umstand. Die Zusammensetzung ist öffentlich bekannt – darauf beruht
// das Rechnen ("Ich halte beide Drachen, also lügt er").

export type GegnerId = "wolf" | "bandit" | "troll" | "riese" | "drache";
export type UmstandId = "allein" | "nachts" | "verwundet" | "unbewaffnet";

export interface GegnerDef {
  id: GegnerId;
  name: string;
  akkusativ: string;
  trophaee: string;
  ruhm: number;
  copies: number;
}

export interface UmstandDef {
  id: UmstandId;
  label: string;
  phrase: string;
}

export const GEGNER: readonly GegnerDef[] = [
  { id: "wolf", name: "Wolf", akkusativ: "einen Wolf", trophaee: "Wolfszahn", ruhm: 1, copies: 5 },
  { id: "bandit", name: "Bandit", akkusativ: "einen Banditen", trophaee: "Banditenmesser", ruhm: 2, copies: 5 },
  { id: "troll", name: "Troll", akkusativ: "einen Troll", trophaee: "Trollhauer", ruhm: 3, copies: 4 },
  { id: "riese", name: "Riese", akkusativ: "einen Riesen", trophaee: "Riesenknochen", ruhm: 4, copies: 4 },
  { id: "drache", name: "Drache", akkusativ: "einen Drachen", trophaee: "Drachenschuppe", ruhm: 5, copies: 2 },
];

export const UMSTAENDE: readonly UmstandDef[] = [
  { id: "allein", label: "Allein", phrase: "ganz allein" },
  { id: "nachts", label: "Nachts", phrase: "mitten in der Nacht" },
  { id: "verwundet", label: "Verwundet", phrase: "schwer verwundet" },
  { id: "unbewaffnet", label: "Unbewaffnet", phrase: "ohne Waffe" },
];

export const HAND_SIZE = 4;
export const MAX_UMSTAENDE = 2;
export const MAX_RUHM = Math.max(...GEGNER.map((g) => g.ruhm)) + MAX_UMSTAENDE;

export interface Card {
  id: number;
  gegner: GegnerId;
  umstand: UmstandId;
}

export interface Claim {
  gegner: GegnerId;
  umstaende: UmstandId[];
  einsatz: 1 | 2;
}

/** Ab diesem Gegnerwert gilt eine Geschichte als „große Tat“ und geht in die Legende ein. */
export const LEGEND_MIN_RUHM = 3;

export function gegnerDef(id: GegnerId): GegnerDef {
  return GEGNER.find((g) => g.id === id)!;
}

export function umstandDef(id: UmstandId): UmstandDef {
  return UMSTAENDE.find((u) => u.id === id)!;
}

/** Umstände werden reihum verteilt, damit jeder Umstand gleich oft vorkommt (5×). */
function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const g of GEGNER) {
    for (let i = 0; i < g.copies; i++) {
      deck.push({ id: deck.length, gegner: g.id, umstand: UMSTAENDE[deck.length % UMSTAENDE.length].id });
    }
  }
  return deck;
}

export const DECK: readonly Card[] = buildDeck();

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function dealHands(): { player: Card[]; opponent: Card[] } {
  const deck = shuffle(DECK);
  return { player: deck.slice(0, HAND_SIZE), opponent: deck.slice(HAND_SIZE, HAND_SIZE * 2) };
}

export function ruhm(claim: Pick<Claim, "gegner" | "umstaende">): number {
  return gegnerDef(claim.gegner).ruhm + claim.umstaende.length;
}

/** Wahr ist eine Geschichte, wenn die Hand den Gegner und jeden genannten Umstand belegen kann. */
export function isBacked(claim: Pick<Claim, "gegner" | "umstaende">, hand: readonly Card[]): boolean {
  return (
    hand.some((c) => c.gegner === claim.gegner) &&
    claim.umstaende.every((u) => hand.some((c) => c.umstand === u))
  );
}

/** Alle erzählbaren Geschichten (ohne Einsatz): 5 Gegner × 11 Umstand-Kombinationen. */
export const ALL_CLAIMS: readonly Pick<Claim, "gegner" | "umstaende">[] = (() => {
  const subsets: UmstandId[][] = [[]];
  for (let i = 0; i < UMSTAENDE.length; i++) {
    subsets.push([UMSTAENDE[i].id]);
    for (let j = i + 1; j < UMSTAENDE.length; j++) subsets.push([UMSTAENDE[i].id, UMSTAENDE[j].id]);
  }
  return GEGNER.flatMap((g) => subsets.map((umstaende) => ({ gegner: g.id, umstaende })));
})();

const TEMPLATES = [
  (g: string, u: string) => `Ich habe ${g} erschlagen${u}.`,
  (g: string, u: string) => `Hört zu: Ich habe ${g} besiegt${u} – und nur einer ging nach Hause.`,
  (g: string, u: string) => `Letzten Winter erwischte ich ${g}${u}. Fragt ruhig herum.`,
  (g: string, u: string) => `Ihr wollt was hören? Ich habe ${g} zu Boden gebracht${u}.`,
];

export function storyText(
  claim: Pick<Claim, "gegner" | "umstaende">,
  variant = Math.floor(Math.random() * TEMPLATES.length)
): string {
  const g = gegnerDef(claim.gegner).akkusativ;
  const u = claim.umstaende.length
    ? ` – ${claim.umstaende.map((id) => umstandDef(id).phrase).join(" und ")}`
    : "";
  return TEMPLATES[variant % TEMPLATES.length](g, u);
}

/** Kurzform einer Geschichte, z. B. für die Legende: „Troll – allein, nachts“. */
export function storySummary(claim: Pick<Claim, "gegner" | "umstaende">): string {
  const u = claim.umstaende.map((id) => umstandDef(id).label.toLowerCase()).join(", ");
  return `${gegnerDef(claim.gegner).name} – ${u || "ohne Umstände"}`;
}
