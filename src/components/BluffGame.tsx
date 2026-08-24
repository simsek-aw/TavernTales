import { useState } from "react";
import { generateCard, cardToText } from "../lib/cardData";
import type { Card } from "../lib/cardData";
import { decideBelieve } from "../lib/aiLogic";
import { getDialogs, randomLine } from "../lib/dialogSystem";
import { checkWinner } from "../lib/gameState";
import type { GameState, RoundResult, Story } from "../lib/gameState";
import StoryBuilder from "./StoryBuilder";
import DialogBox from "./DialogBox";

interface BluffGameProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameEnd: (winner: "player" | "opponent") => void;
}

function RespektBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div>
      <p className="font-title text-sm uppercase tracking-widest text-amber-500">{label}</p>
      <p className="text-2xl text-amber-100" aria-label={`${value} von ${max} Respekt`}>
        {"★".repeat(Math.max(0, value))}
        {"☆".repeat(Math.max(0, max - value))}
        <span className="ml-2 text-sm text-amber-400">({Math.max(0, value)}/{max})</span>
      </p>
    </div>
  );
}

function mutateBluff(card: Card): Card {
  // Deviate at least one field to create a mismatch (a lie).
  const fields: (keyof Card)[] = ["gegner", "waffe", "szene"];
  const field = fields[Math.floor(Math.random() * fields.length)];
  const pools: Record<string, string[]> = {
    gegner: ["Goblin-Krieger", "Troll", "Dunkler Ritter", "Magier", "Banditen-Boss", "Drache", "Riese", "Dämon", "Kult-Anführer", "Koloss"],
    waffe: ["Legendäres Schwert", "Verfluchter Dolch", "Magie", "Schildsplitter", "Giftpfeil", "Feuer-Bombe", "Kette", "Mystischer Ring", "Faustkampf", "Kampftechniken"],
    szene: ["Taverne", "Schlachtfeld", "Dungeon", "Brücke", "Belagerung", "Verfolgung", "Turnier", "Hinterhalt", "Nachtkampf", "Letzter Stand"],
  };
  const pool = pools[field].filter((v) => v !== card[field]);
  const replacement = pool[Math.floor(Math.random() * pool.length)];
  return { ...card, [field]: replacement };
}

function storyMatchesCard(story: Story, card: Card): boolean {
  return story.gegner === card.gegner && story.waffe === card.waffe && story.szene === card.szene;
}

export default function BluffGame({ state, setState, onGameEnd }: BluffGameProps) {
  const [roundCard, setRoundCard] = useState<Card | null>(null);
  const [opponentStory, setOpponentStory] = useState<Story | null>(null);
  const [resultLine, setResultLine] = useState<string | null>(null);

  const dialogs = getDialogs(state.opponent);

  function applyResult(result: RoundResult) {
    setState((prev) => {
      const playerRespekt = Math.max(0, prev.playerRespekt + result.respektChange.player);
      const opponentRespekt = Math.max(0, prev.opponentRespekt + result.respektChange.opponent);
      const legendLog = [...prev.legendLog, result.story];
      const roundHistory = [...prev.roundHistory, result];
      const next: GameState = {
        ...prev,
        playerRespekt,
        opponentRespekt,
        legendLog,
        roundHistory,
        lastResult: result,
        gamePhase: "card-reveal",
      };
      const winner = checkWinner(next);
      if (winner) {
        next.winner = winner;
        next.gamePhase = "end";
      }
      return next;
    });
  }

  function handlePlayerTells(partial: Omit<Story, "generatedText" | "teller">) {
    const story: Story = {
      ...partial,
      generatedText: `Ich besiegte einen ${partial.gegner} mit ${partial.waffe} bei ${partial.szene}, ${partial.konsequenz}`,
      teller: "player",
    };
    const card = generateCard();
    setRoundCard(card);

    const decision = decideBelieve(story, state.opponent);
    const matched = storyMatchesCard(story, card);

    let playerDelta = 0;
    let opponentDelta = 0;
    let line: string;

    if (decision.decision === "GLAUBEN") {
      opponentDelta = -1;
      line = randomLine(dialogs.believes);
    } else if (matched) {
      opponentDelta = -2;
      line = randomLine(dialogs.believesCorrectly);
    } else {
      playerDelta = -1;
      line = randomLine(dialogs.doubtsCorrectly);
    }

    setResultLine(line);
    applyResult({
      actor: "player",
      story,
      card,
      decision: decision.decision,
      matched,
      respektChange: { player: playerDelta, opponent: opponentDelta },
    });
  }

  function startOpponentTurn() {
    const card = generateCard();
    const willBluff = Math.random() < 0.5;
    const claimedCard = willBluff ? mutateBluff(card) : card;
    const story: Story = {
      ...claimedCard,
      generatedText: cardToText(claimedCard),
      teller: "opponent",
    };
    setRoundCard(card);
    setOpponentStory(story);
    setResultLine(null);
    setState((prev) => ({ ...prev, activeActor: "opponent", gamePhase: "opponent-turn" }));
  }

  function handlePlayerDecision(decision: "GLAUBEN" | "ANZWEIFELN") {
    if (!opponentStory || !roundCard) return;
    const matched = storyMatchesCard(opponentStory, roundCard);

    let playerDelta = 0;
    let opponentDelta = 0;
    let line: string;

    if (decision === "GLAUBEN") {
      playerDelta = -1;
      line = randomLine(dialogs.believes);
    } else if (matched) {
      playerDelta = -2;
      line = randomLine(dialogs.believesCorrectly);
    } else {
      opponentDelta = -1;
      line = randomLine(dialogs.doubtsCorrectly);
    }

    setResultLine(line);
    applyResult({
      actor: "opponent",
      story: opponentStory,
      card: roundCard,
      decision,
      matched,
      respektChange: { player: playerDelta, opponent: opponentDelta },
    });
  }

  function nextRound() {
    setRoundCard(null);
    setOpponentStory(null);
    setResultLine(null);
    setState((prev) => {
      if (prev.winner) return prev;
      const nextActor = prev.activeActor === "player" ? "opponent" : "player";
      return {
        ...prev,
        round: nextActor === "player" ? prev.round + 1 : prev.round,
        activeActor: nextActor,
        gamePhase: nextActor === "player" ? "story-selection" : "opponent-turn",
      };
    });
  }

  if (state.gamePhase === "end" && state.winner) {
    onGameEnd(state.winner);
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between rounded-lg border border-amber-900/60 bg-black/30 p-4">
        <RespektBar label={state.opponent.name} value={state.opponentRespekt} />
        <p className="font-title text-xs uppercase text-amber-500">Runde {state.round}</p>
        <RespektBar label="Du" value={state.playerRespekt} />
      </div>

      {state.gamePhase === "card-reveal" && resultLine && (
        <DialogBox speaker={state.opponent.name} text={resultLine} onContinue={nextRound} continueLabel="WEITER" />
      )}

      {state.gamePhase === "story-selection" && (
        <StoryBuilder onTell={handlePlayerTells} />
      )}

      {state.gamePhase === "opponent-turn" && !opponentStory && (
        <DialogBox
          speaker={state.opponent.name}
          text="Lass mich dir von meinem letzten Kampf erzählen..."
          onContinue={startOpponentTurn}
          continueLabel="ZUHÖREN"
        />
      )}

      {state.gamePhase === "opponent-turn" && opponentStory && (
        <div className="rounded-lg border border-amber-900/60 bg-black/30 p-5">
          <p className="mb-2 font-title text-sm uppercase tracking-widest text-amber-500">
            {state.opponent.name}s Geschichte
          </p>
          <p className="italic text-amber-100">"{opponentStory.generatedText}"</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handlePlayerDecision("GLAUBEN")}
              className="rounded border border-emerald-600 bg-emerald-800/40 px-4 py-2 font-title text-sm tracking-wide text-emerald-100 transition hover:bg-emerald-700/60"
            >
              GLAUBEN
            </button>
            <button
              onClick={() => handlePlayerDecision("ANZWEIFELN")}
              className="rounded border border-red-600 bg-red-800/40 px-4 py-2 font-title text-sm tracking-wide text-red-100 transition hover:bg-red-700/60"
            >
              ANZWEIFELN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
