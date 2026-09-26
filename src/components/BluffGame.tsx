import { useEffect, useMemo, useState } from "react";
import { LEGEND_MIN_RUHM, MAX_UMSTAENDE, ruhm, storySummary } from "../lib/cardData";
import type { Claim } from "../lib/cardData";
import { decideOpponentMove, deckSummary } from "../lib/aiLogic";
import { getDialogs, randomLine } from "../lib/dialogSystem";
import { MAX_FASSUNG, callContradiction, currentClaim, doubt, minRuhm, nextRound, tell } from "../lib/gameState";
import type { Actor, GameState, LegendEntry } from "../lib/gameState";
import StoryBuilder from "./StoryBuilder";
import DialogBox from "./DialogBox";
import CardView from "./CardView";

interface BluffGameProps {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameEnd: (winner: Actor) => void;
}

const OPPONENT_THINK_MS = 1100;

function LegendList({ title, entries, chapter }: { title: string; entries: LegendEntry[]; chapter: 1 | 2 }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-amber-500">{title}</p>
      {entries.length === 0 ? (
        <p className="text-sm italic text-amber-400/70">Noch keine großen Taten.</p>
      ) : (
        <ul className="text-sm text-amber-100">
          {entries.map((e) => (
            <li key={e.gegner}>
              {storySummary(e)}
              {e.chapter !== chapter && <span className="ml-1 text-xs text-amber-500">(Krummer Krug)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RespektBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div>
      <p className="font-title text-sm uppercase tracking-widest text-amber-500">{label}</p>
      <p className="text-2xl text-amber-100" aria-label={`${value} von ${max} Respekt`}>
        {"★".repeat(Math.max(0, value))}
        {"☆".repeat(Math.max(0, max - value))}
      </p>
    </div>
  );
}

export default function BluffGame({ state, setState, onGameEnd }: BluffGameProps) {
  const [opponentLine, setOpponentLine] = useState<string | null>(null);
  const dialogs = getDialogs(state.opponent);
  const current = currentClaim(state);
  const opponentName = state.opponent.name;

  useEffect(() => {
    if (state.phase !== "turn" || state.turn !== "opponent") return;
    const timer = setTimeout(() => {
      const move = decideOpponentMove(state);
      if (move.type === "doubt") {
        setOpponentLine(randomLine(dialogs.doubts));
        setState((prev) => doubt(prev, "opponent"));
      } else if (move.type === "widerspruch") {
        setOpponentLine(randomLine(dialogs.callsContradiction));
        setState((prev) => callContradiction(prev, "opponent"));
      } else {
        setOpponentLine(currentClaim(state) ? randomLine(dialogs.raises) : null);
        setState((prev) => tell(prev, "opponent", move.claim, move.extras));
      }
    }, OPPONENT_THINK_MS);
    return () => clearTimeout(timer);
  }, [state, dialogs, setState]);

  useEffect(() => {
    if (state.phase === "end" && state.winner) onGameEnd(state.winner);
  }, [state.phase, state.winner, onGameEnd]);

  function handleTell(claim: Claim) {
    setOpponentLine(null);
    setState((prev) => tell(prev, "player", claim));
  }

  function handleDoubt() {
    setOpponentLine(null);
    setState((prev) => doubt(prev, "player"));
  }

  function handleContradiction() {
    setOpponentLine(null);
    setState((prev) => callContradiction(prev, "player"));
  }

  function handleNext() {
    setOpponentLine(null);
    setState((prev) => nextRound(prev));
  }

  const reveal = state.phase === "reveal" ? state.lastReveal : null;
  const revealLine = useMemo(() => {
    if (!reveal) return "";
    if (reveal.kind === "widerspruch") {
      if (reveal.doubter === "opponent") return randomLine(dialogs.caughtPlayer);
      return randomLine(reveal.claim.contradicts ? dialogs.caughtContradicting : dialogs.falseContradiction);
    }
    if (reveal.claim.teller === "player") {
      return randomLine(reveal.claim.truthful ? dialogs.wronglyDoubted : dialogs.caughtPlayer);
    }
    return randomLine(reveal.claim.truthful ? dialogs.provedTrue : dialogs.caughtLying);
  }, [reveal, dialogs]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="flex items-center justify-between rounded-lg border border-amber-900/60 bg-black/30 p-4">
        <RespektBar label={opponentName} value={state.opponentRespekt} />
        <p className="font-title text-xs uppercase text-amber-500">Runde {state.round}</p>
        <div className="text-right">
          <RespektBar label="Du" value={state.playerRespekt} />
          <p className="text-xs text-amber-400" title="Lügen kostet Fassung, Wahrheit bringt sie zurück. Bei 0 sieht man dir das Lügen an.">
            Fassung {"●".repeat(state.fassung)}
            {"○".repeat(MAX_FASSUNG - state.fassung)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-900/60 bg-black/30 p-4">
        <p className="mb-2 font-title text-sm uppercase tracking-widest text-amber-500">Am Tisch</p>
        {state.claims.length === 0 && (
          <p className="text-amber-400">
            {state.turn === "player" ? "Du eröffnest die Runde." : `${opponentName} eröffnet die Runde …`}
          </p>
        )}
        <ul className="space-y-2">
          {state.claims.map((c, i) => (
            <li key={i} className={c.teller === "player" ? "text-right" : ""}>
              <p className="text-xs text-amber-500">
                {c.teller === "player" ? "Du" : opponentName} · Ruhm {ruhm(c)}
                {c.einsatz === 2 && <span className="ml-1 text-red-400">· haut auf den Tisch (×2)</span>}
              </p>
              <p className="italic text-amber-100">"{c.text}"</p>
              {c.flavor && <p className="text-sm text-amber-300/80">{c.flavor}</p>}
              {c.crowd && (
                <p className="text-sm text-sky-200/80">
                  <span className="text-sky-300">{c.crowd.guest}:</span> „{c.crowd.text}“
                </p>
              )}
            </li>
          ))}
        </ul>
        {opponentLine && state.phase === "turn" && (
          <p className="mt-3 text-amber-200">
            <span className="font-title text-amber-500">{opponentName}:</span> {opponentLine}
          </p>
        )}
      </div>

      {reveal && (
        <div className="space-y-3 rounded-lg border border-amber-700 bg-black/40 p-4">
          {opponentLine && (
            <p className="text-amber-200">
              <span className="font-title text-amber-500">{opponentName}:</span> {opponentLine}
            </p>
          )}
          {reveal.kind === "doubt" ? (
            <>
              <p className="text-amber-200">
                {reveal.doubter === "player"
                  ? `Du zweifelst. ${opponentName} legt die Trophäen auf den Tisch:`
                  : `${opponentName} zweifelt. Du legst deine Trophäen auf den Tisch:`}
              </p>
              <div className="flex flex-wrap gap-2">
                {reveal.tellerHand.map((card) => (
                  <CardView
                    key={card.id}
                    card={card}
                    highlight={card.gegner === reveal.claim.gegner || reveal.claim.umstaende.includes(card.umstand)}
                  />
                ))}
              </div>
              <p className={reveal.claim.truthful ? "text-emerald-400" : "text-red-400"}>
                {reveal.claim.truthful ? "Die Geschichte stimmt." : "Gelogen!"}{" "}
                {reveal.loser === "player" ? "Du verlierst" : `${opponentName} verliert`} {reveal.stake} Respekt.
              </p>
            </>
          ) : (
            <>
              <p className="text-amber-200">
                {reveal.doubter === "player" ? "Du rufst: „Widerspruch!“" : `${opponentName} ruft: „Widerspruch!“`}
              </p>
              {reveal.claim.contradicts ? (
                <p className="text-amber-100">
                  Legende: <span className="text-amber-300">{storySummary(reveal.claim.contradicts)}</span>
                  <br />
                  Jetzt: <span className="text-red-300">{storySummary(reveal.claim)}</span>
                </p>
              ) : (
                <p className="text-amber-100">Die Geschichte passt zur Legende – kein Widerspruch.</p>
              )}
              <p className={reveal.loser === "player" ? "text-red-400" : "text-emerald-400"}>
                {reveal.loser === "player" ? "Du verlierst" : `${opponentName} verliert`} 1 Respekt. Die Gäste lachen.
              </p>
            </>
          )}
          <DialogBox speaker={opponentName} text={revealLine} onContinue={handleNext} continueLabel="WEITER" />
        </div>
      )}

      {state.phase === "turn" && state.turn === "opponent" && (
        <p className="text-center italic text-amber-400">{opponentName} überlegt …</p>
      )}

      {state.phase === "turn" && state.turn === "player" && (
        <div className="rounded-lg border border-amber-900/60 bg-black/30 p-4">
          <p className="mb-3 font-title text-sm uppercase tracking-widest text-amber-500">
            {current ? "Übertrumpfen oder zweifeln?" : "Erzähle deine Geschichte"}
          </p>
          {current && (
            <div className="mb-4 flex flex-wrap gap-3">
              <button
                onClick={handleDoubt}
                className="rounded border border-red-600 bg-red-800/40 px-4 py-2 font-title text-sm tracking-wide text-red-100 transition hover:bg-red-700/60"
              >
                ANZWEIFELN
              </button>
              <button
                onClick={handleContradiction}
                title="Nur wenn die Geschichte einer großen Tat aus der Legende widerspricht – sonst verlierst du 1 Respekt."
                className="rounded border border-purple-500 bg-purple-900/40 px-4 py-2 font-title text-sm tracking-wide text-purple-100 transition hover:bg-purple-800/60"
              >
                WIDERSPRUCH!
              </button>
            </div>
          )}
          <StoryBuilder
            key={`${state.round}-${state.claims.length}`}
            hand={state.playerHand}
            legend={state.legends.player}
            minRuhm={minRuhm(state)}
            submitLabel={current ? "ÜBERTRUMPFEN" : "ERZÄHLEN"}
            onTell={handleTell}
          />
        </div>
      )}

      {state.phase !== "reveal" && (
        <div>
          <p className="mb-2 font-title text-sm uppercase tracking-widest text-amber-500">Deine Trophäen</p>
          <div className="flex flex-wrap gap-2">
            {state.playerHand.map((card) => (
              <CardView
                key={card.id}
                card={card}
                highlight={current?.teller === "opponent" && card.gegner === current.gegner}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 rounded-lg border border-amber-900/60 bg-black/20 p-3 sm:grid-cols-2">
        <LegendList title="Deine Legende" entries={state.legends.player} chapter={state.chapter} />
        <LegendList title={`Legende: ${opponentName}`} entries={state.legends.opponent} chapter={state.chapter} />
      </div>

      <details className="rounded-lg border border-amber-900/60 bg-black/20 p-3 text-sm text-amber-300">
        <summary className="cursor-pointer font-title uppercase tracking-widest text-amber-500">Regeln & Deck</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Beide halten 4 Trophäen. Jede zeigt einen Gegner und einen Umstand.</li>
          <li>Ruhm = Gegnerwert + 1 je Umstand (max. {MAX_UMSTAENDE}). Jede Geschichte muss mehr Ruhm haben als die letzte.</li>
          <li>Wahr ist eine Geschichte, wenn du den Gegner und jeden Umstand auf deinen Trophäen hast.</li>
          <li>Statt zu übertrumpfen kannst du zweifeln. Wer gelogen hat oder zu Unrecht zweifelt, verliert Respekt (×2 bei „auf den Tisch hauen“).</li>
          <li>Lügen kostet Fassung, Wahrheit bringt sie zurück. Bei 0 Fassung sieht man dir das Lügen an.</li>
          <li>
            Große Taten (Gegner ab Ruhm {LEGEND_MIN_RUHM}), die geglaubt wurden, gehen in die Legende ein – auch über Kapitel hinweg.
            Erzählt jemand dieselbe Tat mit anderen Umständen, kann man „Widerspruch!“ rufen: Der Erzähler verliert 1 Respekt.
            Wer grundlos ruft, verliert selbst 1 Respekt.
          </li>
          <li>Die Gäste reden dazwischen. Manche wissen etwas, andere nicht – wem du trauen kannst, musst du selbst herausfinden.</li>
          <li>Im Spiel sind 20 Trophäen: {deckSummary()}. Jeder Umstand kommt 5× vor.</li>
        </ul>
      </details>
    </div>
  );
}
