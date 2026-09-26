import { gegnerDef, umstandDef } from "../lib/cardData";
import type { Card, GegnerId, UmstandId } from "../lib/cardData";

const FACE = "relative flex flex-col overflow-hidden rounded-lg border-2 shadow-lg transition";

interface CardViewProps {
  card: Card;
  highlight?: boolean;
  /** Oben = Gegner, unten = Umstand. Beide Hälften sind einzeln spielbar. */
  onPickGegner?: () => void;
  onPickUmstand?: () => void;
  usedGegner?: boolean;
  usedUmstand?: boolean;
}

/** Trophäen-Karte aus der eigenen Hand. */
export default function CardView({ card, highlight, onPickGegner, onPickUmstand, usedGegner, usedUmstand }: CardViewProps) {
  const g = gegnerDef(card.gegner);
  const u = umstandDef(card.umstand);
  const interactive = Boolean(onPickGegner || onPickUmstand);
  return (
    <div
      className={`${FACE} h-40 w-28 ${
        highlight ? "border-amber-300 bg-amber-900/70" : "border-amber-700 bg-gradient-to-b from-stone-800 to-stone-950"
      }`}
    >
      <button
        type="button"
        disabled={!onPickGegner}
        onClick={onPickGegner}
        title={interactive ? `${g.name} erzählen` : undefined}
        className={`flex flex-1 flex-col items-center justify-center px-1 pt-2 ${
          interactive ? "hover:bg-amber-700/30" : "cursor-default"
        } ${usedGegner ? "bg-emerald-800/40" : ""}`}
      >
        <span className="absolute left-1.5 top-1 font-title text-sm text-amber-300">{g.ruhm}</span>
        <span className="text-3xl leading-none">{g.icon}</span>
        <span className="mt-1 font-title text-base text-amber-100">{g.name}</span>
        <span className="text-[10px] uppercase tracking-wider text-amber-500">{g.trophaee}</span>
      </button>
      <button
        type="button"
        disabled={!onPickUmstand}
        onClick={onPickUmstand}
        title={interactive ? `Umstand „${u.label}“ erzählen` : undefined}
        className={`flex items-center justify-center gap-1 border-t border-amber-800/70 py-1.5 text-xs italic text-amber-200 ${
          interactive ? "hover:bg-amber-700/30" : "cursor-default"
        } ${usedUmstand ? "bg-emerald-800/40" : "bg-black/40"}`}
      >
        <span className="not-italic">{u.icon}</span> {u.label}
      </button>
    </div>
  );
}

interface FaceCardProps {
  kind: "gegner" | "umstand";
  id: GegnerId | UmstandId;
  held?: boolean;
  selected?: boolean;
  small?: boolean;
  /** Ohne „belegt/erfunden“-Hinweis – für Geschichten des Gegners. */
  plain?: boolean;
  onClick?: () => void;
}

/** Erzählkarte: ein einzelner Gegner oder Umstand – aus der Hand belegt oder frei erfunden. */
export function FaceCard({ kind, id, held, selected, small, plain, onClick }: FaceCardProps) {
  const def = kind === "gegner" ? gegnerDef(id as GegnerId) : umstandDef(id as UmstandId);
  const ruhm = kind === "gegner" ? gegnerDef(id as GegnerId).ruhm : 1;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${FACE} ${small ? "h-24 w-20" : "h-32 w-24"} items-center justify-center ${
        plain
          ? "border-amber-700 bg-stone-900"
          : selected
          ? "-translate-y-1 border-amber-300 bg-amber-800/60"
          : held
            ? "border-emerald-600 bg-stone-900 hover:-translate-y-1"
            : "border-dashed border-amber-900 bg-stone-950/80 hover:-translate-y-1"
      }`}
    >
      <span className="absolute left-1.5 top-1 font-title text-xs text-amber-300">
        {kind === "gegner" ? ruhm : `+${ruhm}`}
      </span>
      <span className={small ? "text-2xl" : "text-3xl"}>{def.icon}</span>
      <span className={`mt-1 font-title text-amber-100 ${small ? "text-xs" : "text-sm"}`}>{"name" in def ? def.name : def.label}</span>
      {!plain && (
        <span className={`text-[10px] uppercase tracking-wider ${held ? "text-emerald-400" : "text-amber-600"}`}>
          {held ? "belegt" : "erfunden"}
        </span>
      )}
    </button>
  );
}

/** Leerer Platz auf dem Tisch. */
export function CardSlot({ label, small }: { label: string; small?: boolean }) {
  return (
    <div
      className={`${small ? "h-24 w-20" : "h-32 w-24"} flex items-center justify-center rounded-lg border-2 border-dashed border-amber-900/70 p-1 text-center text-xs text-amber-700`}
    >
      {label}
    </div>
  );
}
