import { useState } from "react";
import { createInitialState } from "../lib/gameState";
import type { GameState } from "../lib/gameState";
import { ALDRIC, GROK, getDialogs } from "../lib/dialogSystem";
import TaverneIntro from "./TaverneIntro";
import BluffGame from "./BluffGame";

type Screen = "chapter1-intro" | "chapter1-game" | "chapter1-end" | "chapter2-intro" | "chapter2-game" | "chapter2-end";

export default function GameScene() {
  const [screen, setScreen] = useState<Screen>("chapter1-intro");
  const [state, setState] = useState<GameState>(() => createInitialState({ ...ALDRIC }, 1));
  const [endResult, setEndResult] = useState<"player" | "opponent" | null>(null);

  function startChapter(opponent: typeof ALDRIC, chapter: 1 | 2) {
    setState(createInitialState({ ...opponent, knownStories: state.legendLog }, chapter));
    setEndResult(null);
  }

  function handleGameEnd(winner: "player" | "opponent") {
    setEndResult(winner);
    setScreen(state.chapter === 1 ? "chapter1-end" : "chapter2-end");
  }

  const dialogs = getDialogs(state.opponent);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#2a1d10_0%,_#14100c_70%)] text-amber-50">
      <header className="border-b border-amber-900/60 p-4 text-center">
        <h1 className="font-title text-3xl tracking-wide text-amber-300">TAVERNE</h1>
        <p className="text-sm text-amber-500">
          Kapitel {state.chapter}: {state.chapter === 1 ? "Die Taverne" : "Der Marktplatz"}
        </p>
      </header>

      {screen === "chapter1-intro" && (
        <TaverneIntro
          opponent={state.opponent}
          onDone={() => {
            setState((prev) => ({ ...prev, gamePhase: "story-selection" }));
            setScreen("chapter1-game");
          }}
        />
      )}

      {screen === "chapter1-game" && (
        <BluffGame state={state} setState={setState} onGameEnd={handleGameEnd} />
      )}

      {screen === "chapter1-end" && endResult && (
        <EndScreen
          winner={endResult}
          opponentName={state.opponent.name}
          winText={dialogs.won}
          loseText={dialogs.lost}
          onContinue={
            endResult === "player"
              ? () => {
                  startChapter(GROK, 2);
                  setScreen("chapter2-intro");
                }
              : () => {
                  startChapter(ALDRIC, 1);
                  setScreen("chapter1-intro");
                }
          }
          continueLabel={endResult === "player" ? "WEITER ZU KAPITEL 2" : "NOCHMAL VERSUCHEN"}
        />
      )}

      {screen === "chapter2-intro" && (
        <TaverneIntro
          opponent={state.opponent}
          onDone={() => {
            setState((prev) => ({ ...prev, gamePhase: "story-selection" }));
            setScreen("chapter2-game");
          }}
        />
      )}

      {screen === "chapter2-game" && (
        <BluffGame state={state} setState={setState} onGameEnd={handleGameEnd} />
      )}

      {screen === "chapter2-end" && endResult && (
        <EndScreen
          winner={endResult}
          opponentName={state.opponent.name}
          winText={dialogs.won}
          loseText={dialogs.lost}
          onContinue={() => {
            startChapter(ALDRIC, 1);
            setScreen("chapter1-intro");
          }}
          continueLabel={endResult === "player" ? "NEUES SPIEL (MVP ENDE)" : "NOCHMAL VERSUCHEN"}
        />
      )}
    </div>
  );
}

interface EndScreenProps {
  winner: "player" | "opponent";
  opponentName: string;
  winText: string;
  loseText: string;
  onContinue: () => void;
  continueLabel: string;
}

function EndScreen({ winner, opponentName, winText, loseText, onContinue, continueLabel }: EndScreenProps) {
  const won = winner === "player";
  return (
    <div className="mx-auto max-w-xl space-y-6 p-8 text-center">
      <h2 className={`font-title text-4xl ${won ? "text-emerald-400" : "text-red-500"}`}>
        {won ? "SIEG" : "NIEDERLAGE"}
      </h2>
      <p className="text-amber-200">
        {won
          ? `Du hast ${opponentName} vor der ganzen Taverne bloßgestellt.`
          : `${opponentName} hat dich zum Gespött der Taverne gemacht.`}
      </p>
      <p className="italic text-amber-100">"{won ? winText : loseText}"</p>
      <button
        onClick={onContinue}
        className="rounded border border-amber-600 bg-amber-800/40 px-6 py-3 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60"
      >
        {continueLabel}
      </button>
    </div>
  );
}
