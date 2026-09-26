import { useCallback, useState } from "react";
import { createInitialState } from "../lib/gameState";
import type { Actor, GameState, LegendEntry, Opponent, PlayerRecord } from "../lib/gameState";
import { ALDRIC, GROK, getDialogs } from "../lib/dialogSystem";
import TaverneIntro from "./TaverneIntro";
import BluffGame from "./BluffGame";

type Screen = "intro" | "game" | "end";

const FRESH_RECORD: PlayerRecord = { revealed: 0, revealedLies: 0 };

export default function GameScene() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [state, setState] = useState<GameState>(() => createInitialState(ALDRIC, 1, FRESH_RECORD));
  const [endResult, setEndResult] = useState<Actor | null>(null);
  // Was aus Kapitel 1 mitgenommen wird: aufgedeckte Lügen und die eigene Legende.
  const [carryOver, setCarryOver] = useState<{ record: PlayerRecord; legend: LegendEntry[] }>({
    record: FRESH_RECORD,
    legend: [],
  });

  // Grok hat von deinem Spiel gehört: Er kennt deine Legende und deine aufgedeckten Lügen.
  function startChapter(opponent: Opponent, chapter: 1 | 2, record: PlayerRecord, legend: LegendEntry[] = []) {
    setState(createInitialState(opponent, chapter, record, legend));
    setEndResult(null);
    setScreen("intro");
  }

  const handleGameEnd = useCallback((winner: Actor) => {
    setEndResult(winner);
    setScreen("end");
  }, []);

  const dialogs = getDialogs(state.opponent);
  const won = endResult === "player";

  function handleContinue() {
    if (state.chapter === 1 && won) {
      const next = { record: state.record, legend: state.legends.player };
      setCarryOver(next);
      startChapter(GROK, 2, next.record, next.legend);
    } else if (state.chapter === 2 && !won) startChapter(GROK, 2, carryOver.record, carryOver.legend);
    else startChapter(ALDRIC, 1, FRESH_RECORD);
  }

  const continueLabel =
    state.chapter === 1 ? (won ? "WEITER ZU KAPITEL 2" : "NOCHMAL VERSUCHEN") : won ? "NEUES SPIEL (MVP ENDE)" : "NOCHMAL VERSUCHEN";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#2a1d10_0%,_#14100c_70%)] text-amber-50">
      <header className="border-b border-amber-900/60 p-4 text-center">
        <h1 className="font-title text-3xl tracking-wide text-amber-300">TAVERNE</h1>
        <p className="text-sm text-amber-500">
          Kapitel {state.chapter}: {state.chapter === 1 ? "Zum Krummen Krug" : "Am Nordtor"}
        </p>
      </header>

      {screen === "intro" && <TaverneIntro key={state.chapter} lines={dialogs.intro} onDone={() => setScreen("game")} />}

      {screen === "game" && <BluffGame state={state} setState={setState} onGameEnd={handleGameEnd} />}

      {screen === "end" && endResult && (
        <div className="mx-auto max-w-xl space-y-6 p-8 text-center">
          <h2 className={`font-title text-4xl ${won ? "text-emerald-400" : "text-red-500"}`}>{won ? "SIEG" : "NIEDERLAGE"}</h2>
          <p className="text-amber-200">{won ? dialogs.winText : dialogs.loseText}</p>
          <p className="italic text-amber-100">
            {state.opponent.name}: "{won ? dialogs.lost : dialogs.won}"
          </p>
          <button
            onClick={handleContinue}
            className="rounded border border-amber-600 bg-amber-800/40 px-6 py-3 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60"
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}
