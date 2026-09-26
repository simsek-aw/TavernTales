import { LEGEND_MIN_RUHM, dealHands, gegnerDef, isBacked, ruhm, storyText } from "./cardData";
import type { Card, Claim, GegnerId, UmstandId } from "./cardData";

export type Actor = "player" | "opponent";

export interface Persona {
  /** Zweifelt, sobald die geschätzte Lügen-Wahrscheinlichkeit darüber liegt. */
  doubtThreshold: number;
  /** Bereitschaft zu bluffen, wenn keine wahre Übertrumpfung möglich ist. */
  bluffRate: number;
  /** Zufallsrauschen – macht die KI unberechenbar (gemischte Strategie). */
  noise: number;
  tell: { text: string; pWhenLying: number; pWhenTruthful: number };
  neutralFlavor: string[];
  /** Wahrscheinlichkeit, den Einsatz zu verdoppeln – je nachdem, ob gelogen wird. */
  einsatzWhenLying: number;
  einsatzWhenTruthful: number;
  /** Wie zuverlässig bemerkt er Widersprüche zu deiner Legende? */
  noticeContradiction: number;
  /** Wie konsequent hält er sich an seine eigene Legende? */
  legendDiscipline: number;
}

export interface Opponent {
  id: "aldric" | "grok";
  name: string;
  persona: Persona;
}

/** Eine große Tat, die geglaubt wurde – ab jetzt muss man sie immer gleich erzählen. */
export interface LegendEntry {
  gegner: GegnerId;
  umstaende: UmstandId[];
  chapter: 1 | 2;
}

export interface Legends {
  player: LegendEntry[];
  opponent: LegendEntry[];
}

export interface CrowdComment {
  guest: string;
  text: string;
}

export interface ToldClaim extends Claim {
  teller: Actor;
  text: string;
  truthful: boolean;
  flavor: string | null;
  crowd: CrowdComment | null;
  contradicts: LegendEntry | null;
}

export interface TellExtras {
  flavor?: string | null;
  crowd?: CrowdComment | null;
}

export interface Reveal {
  kind: "doubt" | "widerspruch";
  claim: ToldClaim;
  doubter: Actor;
  tellerHand: Card[];
  loser: Actor;
  stake: number;
}

/** Was der Gegner über das Lügenverhalten des Spielers weiß (nur aufgedeckte Geschichten). */
export interface PlayerRecord {
  revealed: number;
  revealedLies: number;
}

export interface GameState {
  chapter: 1 | 2;
  opponent: Opponent;
  playerRespekt: number;
  opponentRespekt: number;
  playerHand: Card[];
  opponentHand: Card[];
  round: number;
  turn: Actor;
  phase: "turn" | "reveal" | "end";
  claims: ToldClaim[];
  lastReveal: Reveal | null;
  fassung: number;
  record: PlayerRecord;
  legends: Legends;
  winner: Actor | null;
}

export const STARTING_RESPEKT = 5;
export const MAX_FASSUNG = 3;

export function createInitialState(
  opponent: Opponent,
  chapter: 1 | 2,
  record: PlayerRecord,
  playerLegend: LegendEntry[] = []
): GameState {
  const hands = dealHands();
  return {
    chapter,
    opponent,
    playerRespekt: STARTING_RESPEKT,
    opponentRespekt: STARTING_RESPEKT,
    playerHand: hands.player,
    opponentHand: hands.opponent,
    round: 1,
    turn: "player",
    phase: "turn",
    claims: [],
    lastReveal: null,
    fassung: MAX_FASSUNG,
    record,
    legends: { player: playerLegend, opponent: [] },
    winner: null,
  };
}

export function currentClaim(state: GameState): ToldClaim | null {
  return state.claims.length ? state.claims[state.claims.length - 1] : null;
}

export function minRuhm(state: GameState): number {
  const c = currentClaim(state);
  return c ? ruhm(c) + 1 : 1;
}

const other = (a: Actor): Actor => (a === "player" ? "opponent" : "player");

const sameUmstaende = (a: UmstandId[], b: UmstandId[]) =>
  a.length === b.length && a.every((u) => b.includes(u));

/** Eine große Tat muss so erzählt werden wie beim ersten Mal. */
export function findContradiction(
  legend: readonly LegendEntry[],
  claim: Pick<Claim, "gegner" | "umstaende">
): LegendEntry | null {
  return legend.find((e) => e.gegner === claim.gegner && !sameUmstaende(e.umstaende, claim.umstaende)) ?? null;
}

export function tell(state: GameState, actor: Actor, claim: Claim, extras: TellExtras = {}): GameState {
  const hand = actor === "player" ? state.playerHand : state.opponentHand;
  const truthful = isBacked(claim, hand);
  const told: ToldClaim = {
    ...claim,
    teller: actor,
    text: storyText(claim),
    truthful,
    flavor: extras.flavor ?? null,
    crowd: extras.crowd ?? null,
    contradicts: findContradiction(state.legends[actor], claim),
  };
  const fassung =
    actor === "player"
      ? truthful
        ? Math.min(MAX_FASSUNG, state.fassung + 1)
        : Math.max(0, state.fassung - 1)
      : state.fassung;
  return { ...state, claims: [...state.claims, told], turn: other(actor), fassung };
}

/**
 * Am Rundenende wird die höchste geglaubte große Tat jeder Seite Teil ihrer Legende.
 * Geglaubt = übertrumpft, oder angezweifelt und bewiesen.
 */
function recordLegends(state: GameState, finalAccepted: boolean): Legends {
  const accepted = finalAccepted ? state.claims : state.claims.slice(0, -1);
  const update = (teller: Actor): LegendEntry[] => {
    const legend = state.legends[teller];
    const best = accepted
      .filter((c) => c.teller === teller && gegnerDef(c.gegner).ruhm >= LEGEND_MIN_RUHM && !c.contradicts)
      .at(-1);
    if (!best || legend.some((e) => e.gegner === best.gegner)) return legend;
    return [...legend, { gegner: best.gegner, umstaende: best.umstaende, chapter: state.chapter }];
  };
  return { player: update("player"), opponent: update("opponent") };
}

function applyLoss(state: GameState, loser: Actor, stake: number) {
  const playerRespekt = Math.max(0, state.playerRespekt - (loser === "player" ? stake : 0));
  const opponentRespekt = Math.max(0, state.opponentRespekt - (loser === "opponent" ? stake : 0));
  const winner: Actor | null = opponentRespekt <= 0 ? "player" : playerRespekt <= 0 ? "opponent" : null;
  return { playerRespekt, opponentRespekt, winner };
}

export function doubt(state: GameState, doubter: Actor): GameState {
  const claim = currentClaim(state);
  if (!claim) return state;
  const tellerHand = claim.teller === "player" ? state.playerHand : state.opponentHand;
  const loser = claim.truthful ? doubter : claim.teller;
  const stake = claim.einsatz;
  const record =
    claim.teller === "player"
      ? { revealed: state.record.revealed + 1, revealedLies: state.record.revealedLies + (claim.truthful ? 0 : 1) }
      : state.record;
  return {
    ...state,
    ...applyLoss(state, loser, stake),
    record,
    legends: recordLegends(state, claim.truthful),
    lastReveal: { kind: "doubt", claim, doubter, tellerHand, loser, stake },
    phase: "reveal",
  };
}

/** „Widerspruch!“ – trifft der Vorwurf, verliert der Erzähler 1 Respekt, sonst der Ankläger. */
export function callContradiction(state: GameState, caller: Actor): GameState {
  const claim = currentClaim(state);
  if (!claim) return state;
  const valid = claim.contradicts !== null;
  const loser = valid ? claim.teller : caller;
  return {
    ...state,
    ...applyLoss(state, loser, 1),
    legends: recordLegends(state, !valid),
    lastReveal: { kind: "widerspruch", claim, doubter: caller, tellerHand: [], loser, stake: 1 },
    phase: "reveal",
  };
}

/** Neue Runde: neue Trophäen, der Verlierer der letzten Aufdeckung beginnt. */
export function nextRound(state: GameState): GameState {
  if (state.winner) return { ...state, phase: "end" };
  const hands = dealHands();
  return {
    ...state,
    playerHand: hands.player,
    opponentHand: hands.opponent,
    round: state.round + 1,
    turn: state.lastReveal?.loser ?? "player",
    phase: "turn",
    claims: [],
  };
}
