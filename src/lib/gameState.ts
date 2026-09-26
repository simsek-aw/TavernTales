import { dealHands, isBacked, ruhm, storyText } from "./cardData";
import type { Card, Claim } from "./cardData";

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
}

export interface Opponent {
  id: "aldric" | "grok";
  name: string;
  persona: Persona;
}

export interface ToldClaim extends Claim {
  teller: Actor;
  text: string;
  truthful: boolean;
  flavor: string | null;
}

export interface Reveal {
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
  winner: Actor | null;
}

export const STARTING_RESPEKT = 5;
export const MAX_FASSUNG = 3;

export function createInitialState(opponent: Opponent, chapter: 1 | 2, record: PlayerRecord): GameState {
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

export function tell(state: GameState, actor: Actor, claim: Claim, flavor: string | null = null): GameState {
  const hand = actor === "player" ? state.playerHand : state.opponentHand;
  const truthful = isBacked(claim, hand);
  const told: ToldClaim = { ...claim, teller: actor, text: storyText(claim), truthful, flavor };
  const fassung =
    actor === "player"
      ? truthful
        ? Math.min(MAX_FASSUNG, state.fassung + 1)
        : Math.max(0, state.fassung - 1)
      : state.fassung;
  return { ...state, claims: [...state.claims, told], turn: other(actor), fassung };
}

export function doubt(state: GameState, doubter: Actor): GameState {
  const claim = currentClaim(state);
  if (!claim) return state;
  const tellerHand = claim.teller === "player" ? state.playerHand : state.opponentHand;
  const loser = claim.truthful ? doubter : claim.teller;
  const stake = claim.einsatz;
  const playerRespekt = Math.max(0, state.playerRespekt - (loser === "player" ? stake : 0));
  const opponentRespekt = Math.max(0, state.opponentRespekt - (loser === "opponent" ? stake : 0));
  const record =
    claim.teller === "player"
      ? { revealed: state.record.revealed + 1, revealedLies: state.record.revealedLies + (claim.truthful ? 0 : 1) }
      : state.record;
  const winner: Actor | null = opponentRespekt <= 0 ? "player" : playerRespekt <= 0 ? "opponent" : null;
  return {
    ...state,
    playerRespekt,
    opponentRespekt,
    record,
    lastReveal: { claim, doubter, tellerHand, loser, stake },
    phase: "reveal",
    winner,
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
