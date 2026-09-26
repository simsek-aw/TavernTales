import { gegnerDef, umstandDef } from "../lib/cardData";
import type { Card } from "../lib/cardData";

interface CardViewProps {
  card: Card;
  highlight?: boolean;
}

export default function CardView({ card, highlight }: CardViewProps) {
  const g = gegnerDef(card.gegner);
  return (
    <div
      className={`w-24 rounded-md border p-2 text-center shadow ${
        highlight ? "border-amber-300 bg-amber-900/60" : "border-amber-800 bg-stone-900"
      }`}
    >
      <p className="text-xs text-amber-500">{g.trophaee}</p>
      <p className="font-title text-base text-amber-100">{g.name}</p>
      <p className="text-xs text-amber-400">Ruhm {g.ruhm}</p>
      <p className="mt-1 rounded bg-black/40 px-1 text-xs italic text-amber-200">{umstandDef(card.umstand).label}</p>
    </div>
  );
}
