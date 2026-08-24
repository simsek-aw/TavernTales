interface DialogBoxProps {
  speaker: string;
  text: string;
  onContinue?: () => void;
  continueLabel?: string;
}

export default function DialogBox({ speaker, text, onContinue, continueLabel = "WEITER" }: DialogBoxProps) {
  return (
    <div className="rounded-lg border border-amber-900/60 bg-black/40 p-5 shadow-inner">
      <p className="font-title text-sm uppercase tracking-widest text-amber-500">{speaker}</p>
      <p className="mt-2 text-lg leading-relaxed text-amber-50">{text}</p>
      {onContinue && (
        <button
          onClick={onContinue}
          className="mt-4 rounded border border-amber-600 bg-amber-800/40 px-4 py-2 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60"
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}
