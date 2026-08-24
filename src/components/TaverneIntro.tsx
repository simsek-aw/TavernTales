import { useState } from "react";
import type { Opponent } from "../lib/gameState";
import { getDialogs } from "../lib/dialogSystem";
import DialogBox from "./DialogBox";

interface TaverneIntroProps {
  opponent: Opponent;
  onDone: () => void;
}

export default function TaverneIntro({ opponent, onDone }: TaverneIntroProps) {
  const dialogs = getDialogs(opponent);
  const [step, setStep] = useState(-1);

  if (step === -1) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4 text-center">
        <p className="text-amber-200">{dialogs.entrance}</p>
        <button
          onClick={() => setStep(0)}
          className="rounded border border-amber-600 bg-amber-800/40 px-4 py-2 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60"
        >
          WEITER
        </button>
      </div>
    );
  }

  const lines = dialogs.introLines;
  const isLast = step >= lines.length - 1;

  return (
    <div className="mx-auto max-w-2xl p-4">
      <DialogBox
        speaker={opponent.name}
        text={lines[step]}
        onContinue={() => (isLast ? onDone() : setStep(step + 1))}
        continueLabel={isLast ? "GEGENÜBERSTELLEN" : "WEITER"}
      />
    </div>
  );
}
