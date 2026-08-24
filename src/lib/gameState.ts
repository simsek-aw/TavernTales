import type { Card } from "./cardData";

export type BiasType = "vain" | "direct" | "aggressive";

export interface Opponent {
  id: string;
  name: string;
  biasType: BiasType;
  respekt: number;
  difficulty: number;
  knownStories: Story[];
}

export interface Story {
  gegner: string;
  waffe: string;
  szene: string;
  konsequenz: string;
  generatedText: string;
  teller: "player" | "opponent";
}

export type GamePhase =
  | "intro"
  | "story-selection"
  | "awaiting-decision"
  | "card-reveal"
  | "opponent-turn"
  | "opponent-reveal"
  | "end";

export type RoundActor = "player" | "opponent";

export interface RoundResult {
  actor: RoundActor;
  story: Story;
  card: Card;
  decision: "GLAUBEN" | "ANZWEIFELN";
  matched: boolean;
  respektChange: { player: number; opponent: number };
}

export interface GameState {
  chapter: 1 | 2;
  opponent: Opponent;
  playerRespekt: number;
  opponentRespekt: number;
  round: number;
  activeActor: RoundActor;
  gamePhase: GamePhase;
  legendLog: Story[];
  roundHistory: RoundResult[];
  currentCard: Card | null;
  lastResult: RoundResult | null;
  winner: "player" | "opponent" | null;
}

export const STARTING_RESPEKT = 5;

export function createInitialState(opponent: Opponent, chapter: 1 | 2): GameState {
  return {
    chapter,
    opponent,
    playerRespekt: STARTING_RESPEKT,
    opponentRespekt: opponent.respekt,
    round: 1,
    activeActor: "player",
    gamePhase: "intro",
    legendLog: [],
    roundHistory: [],
    currentCard: null,
    lastResult: null,
    winner: null,
  };
}

export function checkWinner(state: GameState): "player" | "opponent" | null {
  if (state.opponentRespekt <= 0) return "player";
  if (state.playerRespekt <= 0) return "opponent";
  return null;
}
