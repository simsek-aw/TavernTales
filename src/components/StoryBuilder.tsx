import { useState } from "react";
import { GEGNER, WAFFE, SZENE, KONSEQUENZ } from "../lib/cardData";
import type { Story } from "../lib/gameState";

interface StoryBuilderProps {
  onTell: (story: Omit<Story, "generatedText" | "teller">) => void;
  disabled?: boolean;
}

export default function StoryBuilder({ onTell, disabled }: StoryBuilderProps) {
  const [gegner, setGegner] = useState<string>(GEGNER[0]);
  const [waffe, setWaffe] = useState<string>(WAFFE[0]);
  const [szene, setSzene] = useState<string>(SZENE[0]);
  const [konsequenz, setKonsequenz] = useState<string>(KONSEQUENZ[0]);

  const preview = `Ich besiegte einen ${gegner} mit ${waffe} bei ${szene}, ${konsequenz}`;

  return (
    <div className="rounded-lg border border-amber-900/60 bg-black/30 p-5">
      <p className="mb-3 font-title text-sm uppercase tracking-widest text-amber-500">
        Erzähle deine Geschichte
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-amber-200">
          Ich besiegte einen:
          <select
            value={gegner}
            onChange={(e) => setGegner(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded border border-amber-700 bg-stone-900 p-2 text-amber-50"
          >
            {GEGNER.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-amber-200">
          mit:
          <select
            value={waffe}
            onChange={(e) => setWaffe(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded border border-amber-700 bg-stone-900 p-2 text-amber-50"
          >
            {WAFFE.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-amber-200">
          bei:
          <select
            value={szene}
            onChange={(e) => setSzene(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded border border-amber-700 bg-stone-900 p-2 text-amber-50"
          >
            {SZENE.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-amber-200">
          Konsequenz:
          <select
            value={konsequenz}
            onChange={(e) => setKonsequenz(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded border border-amber-700 bg-stone-900 p-2 text-amber-50"
          >
            {KONSEQUENZ.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 italic text-amber-100">"{preview}"</p>

      <button
        disabled={disabled}
        onClick={() => onTell({ gegner, waffe, szene, konsequenz })}
        className="mt-4 rounded border border-amber-600 bg-amber-800/40 px-4 py-2 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ERZÄHLEN
      </button>
    </div>
  );
}
