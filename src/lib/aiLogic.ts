import { ALL_CLAIMS, DECK, GEGNER, HAND_SIZE, MAX_RUHM, isBacked, ruhm } from "./cardData";
import type { Card, Claim } from "./cardData";
import { currentClaim, minRuhm } from "./gameState";
import type { GameState, PlayerRecord, ToldClaim } from "./gameState";

export type OpponentMove =
  | { type: "doubt" }
  | { type: "tell"; claim: Claim; flavor: string | null };

function combinations<T>(pool: readonly T[], k: number): T[][] {
  const out: T[][] = [];
  const pick: T[] = [];
  (function rec(start: number) {
    if (pick.length === k) {
      out.push([...pick]);
      return;
    }
    for (let i = start; i <= pool.length - (k - pick.length); i++) {
      pick.push(pool[i]);
      rec(i + 1);
      pick.pop();
    }
  })(0);
  return out;
}

const handCache = new Map<string, Card[][]>();

/** Alle Hände, die der Spieler haben kann – aus den Karten, die der Gegner nicht selbst hält. */
function possibleHands(ownHand: readonly Card[]): Card[][] {
  const key = ownHand.map((c) => c.id).sort((a, b) => a - b).join(",");
  let hands = handCache.get(key);
  if (!hands) {
    const ownIds = new Set(ownHand.map((c) => c.id));
    hands = combinations(DECK.filter((c) => !ownIds.has(c.id)), HAND_SIZE);
    handCache.clear();
    handCache.set(key, hands);
  }
  return hands;
}

/** Geschätzte Bluff-Neigung des Spielers aus aufgedeckten Geschichten (Prior 1/3). */
export function estimateBluffRate(record: PlayerRecord): number {
  return (record.revealedLies + 1) / (record.revealed + 3);
}

function jitter(noise: number): number {
  return (Math.random() * 2 - 1) * noise;
}

/**
 * P(wahr | Geschichte erzählt) nach Bayes, exakt über alle möglichen Spielerhände
 * (C(16,4) = 1820). Ehrliche Spieler erzählen eine Geschichte, die ihre Hand belegt.
 * Gelogen wird vor allem, wenn die Hand keine wahre Übertrumpfung mehr hergibt.
 * Hält der Gegner z. B. beide Drachen, ist jede Drachen-Geschichte sicher gelogen.
 */
export function probTrue(claim: ToldClaim, state: GameState): number {
  const level = ruhm(claim);
  const idx = state.claims.lastIndexOf(claim);
  const previous = idx > 0 ? state.claims[idx - 1] : null;
  const minAtClaim = previous ? ruhm(previous) + 1 : 1;
  const atLevel = ALL_CLAIMS.filter((c) => ruhm(c) === level);
  const reachable = ALL_CLAIMS.filter((c) => ruhm(c) >= minAtClaim);

  const b = estimateBluffRate(state.record);
  const bVoluntary = b * 0.5;
  const bForced = Math.min(0.95, 0.4 + b);

  let truth = 0;
  let lie = 0;
  for (const hand of possibleHands(state.opponentHand)) {
    const hasTruthfulOption = reachable.some((c) => isBacked(c, hand));
    const pLieHand = hasTruthfulOption ? bVoluntary : bForced;
    if (isBacked(claim, hand)) {
      truth += (1 - pLieHand) / atLevel.filter((c) => isBacked(c, hand)).length;
    }
    lie += pLieHand / atLevel.length;
  }
  let p = truth + lie === 0 ? 0 : truth / (truth + lie);
  // Wer zu oft lügt, verliert die Fassung – das sieht man ihm an.
  if (claim.teller === "player" && state.fassung === 0 && !claim.truthful) p *= 0.5;
  return p;
}

function withFlavor(state: GameState, truthful: boolean): string | null {
  const { tell, neutralFlavor } = state.opponent.persona;
  if (Math.random() < (truthful ? tell.pWhenTruthful : tell.pWhenLying)) return tell.text;
  return Math.random() < 0.4 ? neutralFlavor[Math.floor(Math.random() * neutralFlavor.length)] : null;
}

function pickEinsatz(state: GameState, truthful: boolean): 1 | 2 {
  const p = state.opponent.persona;
  return Math.random() < (truthful ? p.einsatzWhenTruthful : p.einsatzWhenLying) ? 2 : 1;
}

function truthfulOptions(state: GameState, min: number) {
  return ALL_CLAIMS.filter((c) => ruhm(c) >= min && isBacked(c, state.opponentHand)).sort(
    (a, b) => ruhm(a) - ruhm(b)
  );
}

/** Bluff: knapp über dem Minimum, bevorzugt Halbwahrheiten (Gegner in der Hand). */
function chooseBluff(state: GameState, min: number): Pick<Claim, "gegner" | "umstaende"> | null {
  const candidates = ALL_CLAIMS.filter(
    (c) => ruhm(c) >= min && ruhm(c) <= min + 1 && !isBacked(c, state.opponentHand)
  );
  if (!candidates.length) return null;
  const score = (c: Pick<Claim, "gegner" | "umstaende">) =>
    (state.opponentHand.some((h) => h.gegner === c.gegner) ? 2 : 0) +
    c.umstaende.filter((u) => state.opponentHand.some((h) => h.umstand === u)).length +
    Math.random() * 1.5;
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

function tellMove(state: GameState, claim: Pick<Claim, "gegner" | "umstaende">): OpponentMove {
  const truthful = isBacked(claim, state.opponentHand);
  return {
    type: "tell",
    claim: { ...claim, einsatz: pickEinsatz(state, truthful) },
    flavor: withFlavor(state, truthful),
  };
}

export function decideOpponentMove(state: GameState): OpponentMove {
  const persona = state.opponent.persona;
  const current = currentClaim(state);
  const min = minRuhm(state);
  const options = truthfulOptions(state, min);

  // Eröffnung: niedrig und wahr, damit Luft nach oben bleibt.
  if (!current) {
    const low = options.slice(0, 3);
    return tellMove(state, low[Math.floor(Math.random() * low.length)]);
  }

  if (min > MAX_RUHM) return { type: "doubt" };

  const pLie = 1 - probTrue(current, state) + jitter(persona.noise);
  // Mit dem Rücken zur Wand wird man misstrauischer.
  const threshold = persona.doubtThreshold - (state.opponentRespekt <= current.einsatz ? 0.08 : 0);

  if (pLie > threshold) return { type: "doubt" };

  if (options.length) {
    const pick = Math.random() < 0.7 ? options[0] : options[Math.floor(Math.random() * options.length)];
    return tellMove(state, pick);
  }

  // Keine wahre Übertrumpfung: Bluffen lohnt, wenn es wahrscheinlicher durchkommt,
  // als ein Zweifel trifft. Große Geschichten werden eher angezweifelt.
  const bluff = chooseBluff(state, min);
  if (!bluff) return { type: "doubt" };
  const pBluffSurvives = 0.75 - 0.5 * (ruhm(bluff) / MAX_RUHM) + (persona.bluffRate - 0.5) * 0.4;
  return pBluffSurvives > pLie ? tellMove(state, bluff) : { type: "doubt" };
}

/** Kurzbeschreibung für die Regel-Übersicht: wie viele Trophäen es je Gegner gibt. */
export function deckSummary(): string {
  return GEGNER.map((g) => `${g.name} ×${g.copies}`).join(" · ");
}
