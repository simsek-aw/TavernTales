import { useState } from "react";
import { GEGNER, MAX_RUHM, MAX_UMSTAENDE, UMSTAENDE, isBacked, ruhm, storySummary, storyText } from "../lib/cardData";
import type { Card, Claim, GegnerId, UmstandId } from "../lib/cardData";
import { findContradiction } from "../lib/gameState";
import type { LegendEntry } from "../lib/gameState";
import CardView, { CardSlot, FaceCard } from "./CardView";

interface StoryBuilderProps {
  hand: Card[];
  legend: LegendEntry[];
  minRuhm: number;
  submitLabel: string;
  onTell: (claim: Claim) => void;
}

/**
 * Die Geschichte wird aus Karten gelegt: aus den eigenen Trophäen (wahr) oder aus den
 * Erzählkarten (erfunden). Tisch-Plätze: 1 Gegner + bis zu 2 Umstände.
 */
export default function StoryBuilder({ hand, legend, minRuhm, submitLabel, onTell }: StoryBuilderProps) {
  const [gegner, setGegner] = useState<GegnerId | null>(null);
  const [umstaende, setUmstaende] = useState<UmstandId[]>([]);
  const [einsatz, setEinsatz] = useState<1 | 2>(1);

  const holdsGegner = (id: GegnerId) => hand.some((c) => c.gegner === id);
  const holdsUmstand = (id: UmstandId) => hand.some((c) => c.umstand === id);

  function toggleUmstand(id: UmstandId) {
    setUmstaende((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : prev.length < MAX_UMSTAENDE ? [...prev, id] : prev
    );
  }

  if (minRuhm > MAX_RUHM) {
    return <p className="text-amber-300">Diese Geschichte ist nicht mehr zu übertreffen. Du kannst nur noch zweifeln.</p>;
  }

  const draft = gegner ? { gegner, umstaende } : null;
  const value = draft ? ruhm(draft) : 0;
  const valid = draft !== null && value >= minRuhm;
  const truthful = draft ? isBacked(draft, hand) : false;
  const contradiction = draft ? findContradiction(legend, draft) : null;

  return (
    <div className="space-y-5">
      <section>
        <p className="mb-2 text-sm text-amber-200">Deine Geschichte (mindestens Ruhm {minRuhm})</p>
        <div className="flex flex-wrap items-end gap-3 rounded-lg bg-emerald-950/30 p-3 ring-1 ring-emerald-900/50">
          {gegner ? (
            <FaceCard kind="gegner" id={gegner} held={holdsGegner(gegner)} selected onClick={() => setGegner(null)} />
          ) : (
            <CardSlot label="Gegner wählen" />
          )}
          {Array.from({ length: MAX_UMSTAENDE }, (_, i) =>
            umstaende[i] ? (
              <FaceCard
                key={umstaende[i]}
                kind="umstand"
                id={umstaende[i]}
                held={holdsUmstand(umstaende[i])}
                selected
                small
                onClick={() => toggleUmstand(umstaende[i])}
              />
            ) : (
              <CardSlot key={`slot-${i}`} label="Umstand (optional)" small />
            )
          )}
          <div className="ml-auto text-right">
            <p className={`font-title text-3xl ${valid || !draft ? "text-amber-300" : "text-red-400"}`}>{value}</p>
            <p className="text-xs uppercase tracking-widest text-amber-500">Ruhm</p>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm text-amber-200">
          Deine Trophäen <span className="text-amber-500">– oben Gegner, unten Umstand antippen</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {hand.map((card) => (
            <CardView
              key={card.id}
              card={card}
              onPickGegner={() => setGegner(card.gegner)}
              onPickUmstand={() => toggleUmstand(card.umstand)}
              usedGegner={gegner === card.gegner}
              usedUmstand={umstaende.includes(card.umstand)}
            />
          ))}
        </div>
      </section>

      <details className="rounded-lg border border-dashed border-amber-900/70 p-3">
        <summary className="cursor-pointer text-sm text-amber-300">
          Erfinden <span className="text-amber-500">– Karten, die du nicht hast (Lüge)</span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {GEGNER.map((g) => (
            <FaceCard
              key={g.id}
              kind="gegner"
              id={g.id}
              held={holdsGegner(g.id)}
              selected={gegner === g.id}
              small
              onClick={() => setGegner(g.id)}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {UMSTAENDE.map((u) => (
            <FaceCard
              key={u.id}
              kind="umstand"
              id={u.id}
              held={holdsUmstand(u.id)}
              selected={umstaende.includes(u.id)}
              small
              onClick={() => toggleUmstand(u.id)}
            />
          ))}
        </div>
      </details>

      {draft && (
        <div className="rounded bg-black/30 p-3 text-sm">
          <p className="italic text-amber-100">"{storyText(draft, 0)}"</p>
          <p className="mt-1">
            {!valid && <span className="text-red-400">Zu wenig Ruhm – mindestens {minRuhm}. · </span>}
            <span className={truthful ? "text-emerald-400" : "text-red-400"}>
              {truthful ? "Wahr – deine Trophäen belegen es" : "Gelogen – hoffentlich zweifelt keiner"}
            </span>
          </p>
          {contradiction && (
            <p className="mt-1 text-purple-300">
              Widerspricht deiner Legende – dort hieß es: {storySummary(contradiction)}. Man kann „Widerspruch!“ rufen.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEinsatz(einsatz === 2 ? 1 : 2)}
          className={`rounded border px-4 py-2 text-sm transition ${
            einsatz === 2 ? "border-red-400 bg-red-900/50 text-red-100" : "border-amber-800 bg-stone-900 text-amber-200"
          }`}
        >
          👊 Auf den Tisch hauen {einsatz === 2 ? "(Einsatz ×2)" : ""}
        </button>
        <button
          disabled={!valid}
          onClick={() => draft && onTell({ ...draft, einsatz })}
          className="rounded border border-amber-600 bg-amber-800/40 px-5 py-2 font-title text-sm tracking-wide text-amber-100 transition hover:bg-amber-700/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
