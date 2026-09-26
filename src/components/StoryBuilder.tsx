import { useState } from "react";
import { GEGNER, MAX_RUHM, MAX_UMSTAENDE, UMSTAENDE, isBacked, ruhm, storyText } from "../lib/cardData";
import type { Card, Claim, GegnerId, UmstandId } from "../lib/cardData";

interface StoryBuilderProps {
  hand: Card[];
  minRuhm: number;
  submitLabel: string;
  onTell: (claim: Claim) => void;
}

export default function StoryBuilder({ hand, minRuhm, submitLabel, onTell }: StoryBuilderProps) {
  const [gegner, setGegner] = useState<GegnerId>(hand[0].gegner);
  const [umstaende, setUmstaende] = useState<UmstandId[]>([]);
  const [einsatz, setEinsatz] = useState<1 | 2>(1);

  const draft = { gegner, umstaende };
  const value = ruhm(draft);
  const truthful = isBacked(draft, hand);
  const valid = value >= minRuhm;

  function toggleUmstand(id: UmstandId) {
    setUmstaende((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : prev.length < MAX_UMSTAENDE ? [...prev, id] : prev
    );
  }

  if (minRuhm > MAX_RUHM) {
    return <p className="text-amber-300">Diese Geschichte ist nicht mehr zu übertreffen. Du kannst nur noch zweifeln.</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm text-amber-200">Ich besiegte …</p>
        <div className="flex flex-wrap gap-2">
          {GEGNER.map((g) => {
            const held = hand.some((c) => c.gegner === g.id);
            return (
              <button
                key={g.id}
                onClick={() => setGegner(g.id)}
                className={`rounded border px-3 py-1 text-sm transition ${
                  gegner === g.id ? "border-amber-300 bg-amber-800/60 text-amber-50" : "border-amber-800 bg-stone-900 text-amber-200"
                }`}
              >
                {g.name} <span className="text-amber-400">({g.ruhm})</span>
                {held && <span className="ml-1 text-emerald-400">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm text-amber-200">Umstände (je +1 Ruhm, max. {MAX_UMSTAENDE})</p>
        <div className="flex flex-wrap gap-2">
          {UMSTAENDE.map((u) => {
            const held = hand.some((c) => c.umstand === u.id);
            const active = umstaende.includes(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggleUmstand(u.id)}
                className={`rounded border px-3 py-1 text-sm transition ${
                  active ? "border-amber-300 bg-amber-800/60 text-amber-50" : "border-amber-800 bg-stone-900 text-amber-200"
                }`}
              >
                {u.label}
                {held && <span className="ml-1 text-emerald-400">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-amber-200">
        <input type="checkbox" checked={einsatz === 2} onChange={(e) => setEinsatz(e.target.checked ? 2 : 1)} />
        Auf den Tisch hauen (Einsatz ×2)
      </label>

      <div className="rounded bg-black/30 p-3 text-sm">
        <p className="italic text-amber-100">"{storyText(draft, 0)}"</p>
        <p className="mt-1">
          <span className={valid ? "text-amber-300" : "text-red-400"}>
            Ruhm {value} {valid ? "" : `(mindestens ${minRuhm} nötig)`}
          </span>
          {" · "}
          <span className={truthful ? "text-emerald-400" : "text-red-400"}>
            {truthful ? "Wahr – deine Trophäen belegen es" : "Gelogen – hoffentlich zweifelt keiner"}
          </span>
        </p>
      </div>

      <button
        disabled={!valid}
        onClick={() => onTell({ gegner, umstaende, einsatz })}
        className="rounded border border-amber-600 bg-amber-800/40 px-4 py-2 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </div>
  );
}
