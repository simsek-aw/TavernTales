import { GEGNER, WAFFE, SZENE } from "./cardData";
import type { Card } from "./cardData";
import type { BiasType, Opponent, Story } from "./gameState";

const GEGNER_TIER: Record<string, number> = {
  "Goblin-Krieger": 1,
  Troll: 1,
  "Banditen-Boss": 1,
  "Dunkler Ritter": 2,
  Magier: 2,
  "Kult-Anführer": 2,
  Riese: 2,
  Drache: 3,
  Dämon: 3,
  Koloss: 3,
};

const WAFFE_TIER: Record<string, number> = {
  Faustkampf: 1,
  Kampftechniken: 1,
  Kette: 1,
  Schildsplitter: 1,
  "Verfluchter Dolch": 2,
  Giftpfeil: 2,
  "Feuer-Bombe": 2,
  "Mystischer Ring": 2,
  "Legendäres Schwert": 3,
  Magie: 3,
};

const SZENE_TIER: Record<string, number> = {
  Taverne: 1,
  Brücke: 1,
  Turnier: 1,
  Schlachtfeld: 2,
  Hinterhalt: 2,
  Verfolgung: 2,
  Dungeon: 2,
  Belagerung: 3,
  Nachtkampf: 3,
  "Letzter Stand": 3,
};

/** Plausibility: how well do the tiers of gegner/waffe/szene line up? Matched tiers read as a believable story. */
export function scorePlausibility(story: Pick<Story, "gegner" | "waffe" | "szene">): number {
  const g = GEGNER_TIER[story.gegner] ?? 2;
  const w = WAFFE_TIER[story.waffe] ?? 2;
  const s = SZENE_TIER[story.szene] ?? 2;
  const spread = Math.max(g, w, s) - Math.min(g, w, s);
  // spread 0 -> 1.0 plausible, spread 2 -> ~0.3
  return Math.max(0, 1 - spread * 0.35);
}

function scoreCharacterBias(story: Story, opponent: Opponent): number {
  switch (opponent.biasType) {
    case "vain": {
      // Aldric believes stories that reflect glory back on martial prowess (high-tier weapons/scenes)
      const heroic =
        (WAFFE_TIER[story.waffe] ?? 2) >= 3 || (SZENE_TIER[story.szene] ?? 2) >= 3;
      return heroic ? 0.8 : 0.4;
    }
    case "direct": {
      // Grok wants concrete, provable claims: low/mid-tier, grounded combos read as credible
      const grounded = (GEGNER_TIER[story.gegner] ?? 2) <= 2;
      return grounded ? 0.7 : 0.3;
    }
    case "aggressive":
      return 0.5;
    default:
      return 0.5;
  }
}

function scoreRespectThreshold(opponent: Opponent): number {
  // The more desperate (lower respekt), the less willing to concede belief -> lower score
  return opponent.respekt / 5;
}

function scoreStoryConsistency(story: Story, opponent: Opponent): number {
  const repeated = opponent.knownStories.some(
    (s) => s.gegner === story.gegner && s.waffe === story.waffe && s.szene === story.szene
  );
  return repeated ? 0.1 : 0.9;
}

export interface BelieveBreakdown {
  plausibility: number;
  characterBias: number;
  respectThreshold: number;
  storyConsistency: number;
  believeScore: number;
  decision: "GLAUBEN" | "ANZWEIFELN";
}

export function decideBelieve(story: Story, opponent: Opponent): BelieveBreakdown {
  const plausibility = scorePlausibility(story);
  const characterBias = scoreCharacterBias(story, opponent);
  const respectThreshold = scoreRespectThreshold(opponent);
  const storyConsistency = scoreStoryConsistency(story, opponent);

  const believeScore =
    plausibility * 0.4 +
    characterBias * 0.3 +
    respectThreshold * 0.2 +
    storyConsistency * 0.1;

  // Higher difficulty opponents demand a higher bar before believing.
  const threshold = 0.6 + (opponent.difficulty - 1) * 0.05;

  return {
    plausibility,
    characterBias,
    respectThreshold,
    storyConsistency,
    believeScore,
    decision: believeScore > threshold ? "GLAUBEN" : "ANZWEIFELN",
  };
}

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Opponent tells their own story each round (used as ground-truth card too). */
export function generateOpponentCard(): Card {
  return {
    gegner: randomFrom(GEGNER),
    waffe: randomFrom(WAFFE),
    szene: randomFrom(SZENE),
    konsequenz: randomFrom(["...ich war verletzt", "...es war eine Falle", "...ich war allein"]),
  };
}

export type { BiasType };
