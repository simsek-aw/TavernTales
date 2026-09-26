import { useState } from "react";
import type { DialogLine } from "../lib/dialogSystem";
import DialogBox from "./DialogBox";

interface TaverneIntroProps {
  lines: DialogLine[];
  onDone: () => void;
}

export default function TaverneIntro({ lines, onDone }: TaverneIntroProps) {
  const [step, setStep] = useState(0);
  const isLast = step >= lines.length - 1;
  const line = lines[step];

  return (
    <div className="mx-auto max-w-2xl p-4">
      <DialogBox
        speaker={line.speaker}
        text={line.text}
        onContinue={() => (isLast ? onDone() : setStep(step + 1))}
        continueLabel={isLast ? "PRAHLEN" : "WEITER"}
      />
    </div>
  );
}
