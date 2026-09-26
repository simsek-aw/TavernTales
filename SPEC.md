# TAVERNE — BLUFFING CARD GAME
## MVP Specification (v2)

---

## DESIGN-GRUNDSATZ

Ein Computer kann kein Gesicht lesen. Deshalb basiert der Bluff **auf Information und Risiko**, nicht auf Mimik – wie bei Liar's Dice oder Poker:

- **Endliches, öffentliches Deck:** Jeder kann rechnen, wie wahrscheinlich eine Geschichte stimmt.
- **Eskalation:** Jede Geschichte muss die letzte übertreffen. Irgendwann muss jemand bluffen oder zweifeln.
- **Einsatz, Tells, Fassung:** Das „Menschen lesen“ wird zu lernbaren Spielmechaniken.

---

## RAHMENHANDLUNG

**Kapitel 1 – Zum Krummen Krug.** Du kommst pleite in einer Taverne an. Am Brett hängt ein Auftrag: *Geleitschutz nach Norden – 50 Gold*. Die Wirtin gibt ihn nur jemandem mit Namen – und den hat Aldric der Gefeierte. Hier gilt: Wer prahlt, wird gehört. Wer Aldric beim *Prahlen* schlägt, bekommt den Zettel.

**Kapitel 2 – Am Nordtor.** Der Karawanenmeister nimmt nur eine Wache mit. Grok der Grüne, ein Goblin-Söldner, will die Stelle ebenfalls – und hat gehört, wie du spielst.

„Prahlen“ ist ein bekanntes Tavernenspiel mit Trophäen-Karten. Wenn jemand zweifelt, werden die Trophäen gezeigt. So ist das Aufdecken in der Spielwelt begründet, ohne Knappe oder erfundene Vorgeschichte.

---

## KARTEN (minimal)

**Nur 2 Dimensionen, 20 Karten.** Jede Karte ist eine Trophäe: **Gegner** + **Umstand** (Attribut).

| Gegner | Trophäe | Ruhm | Anzahl |
|---|---|---|---|
| Wolf | Wolfszahn | 1 | 5 |
| Bandit | Banditenmesser | 2 | 5 |
| Troll | Trollhauer | 3 | 4 |
| Riese | Riesenknochen | 4 | 4 |
| Drache | Drachenschuppe | 5 | 2 |

**Umstände** (je 5×, reihum verteilt): Allein · Nachts · Verwundet · Unbewaffnet.

Die Abwechslung kommt aus den Kombinationen (5 Gegner × 11 Umstand-Kombinationen = 55 Geschichten) und aus variierenden Satz-Vorlagen, nicht aus vielen Kartentypen.

---

## SPIELABLAUF

1. Beide ziehen **4 Trophäen** (verdeckt).
2. Wer beginnt, erzählt eine Geschichte: **1 Gegner + 0–2 Umstände**.
   - **Ruhm** = Gegnerwert + 1 je Umstand (1–7).
   - **Wahr**, wenn die eigene Hand den Gegner und jeden Umstand enthält.
   - Optional **auf den Tisch hauen**: Einsatz ×2.
3. Der andere muss entweder:
   - **ÜBERTRUMPFEN** – eine Geschichte mit höherem Ruhm erzählen, oder
   - **ANZWEIFELN** – der Erzähler zeigt seine Trophäen.
4. Aufdeckung: Wer gelogen hat oder zu Unrecht gezweifelt hat, verliert **Respekt = Einsatz**.
5. Neue Runde, neue Hände. Der Verlierer der Aufdeckung beginnt.

**Sieg:** Der Gegner hat 0 Respekt (Start: 5).

### Fassung (nur Spieler)
- Start 3. Eine Lüge kostet 1, eine wahre Geschichte bringt 1 zurück.
- Bei 0 Fassung merkt der Gegner Lügen deutlich leichter. Wer dauernd lügt, fliegt auf.

---

## GEGNER-KI

Alles in `src/lib/aiLogic.ts`.

### Wahrheits-Schätzung (Bayes, exakt)
- Aufzählung aller möglichen Spielerhände aus den 16 Karten, die die KI nicht hält (C(16,4) = 1820).
- Ehrliche Spieler erzählen eine Geschichte, die ihre Hand belegt. Gelogen wird vor allem, wenn keine wahre Übertrumpfung mehr möglich ist (erzwungener Bluff > freiwilliger Bluff).
- Bluff-Neigung des Spielers wird aus **aufgedeckten** Geschichten gelernt (Prior 1/3).
- Hält die KI z. B. beide Drachen, ist jede Drachen-Geschichte sicher gelogen.

### Entscheidung
1. Eröffnung: niedrige, wahre Geschichte.
2. P(Lüge) + Rauschen > Zweifel-Schwelle → **anzweifeln**. Bei wenig Respekt sinkt die Schwelle.
3. Wahre Übertrumpfung vorhanden → erzählen (meist minimal).
4. Sonst Bluff (bevorzugt Halbwahrheiten), wenn die Chance, dass er durchkommt, größer ist als die Trefferchance eines Zweifels. Andernfalls zweifeln.

### Persönlichkeiten

| | Aldric (Kap. 1) | Grok (Kap. 2) |
|---|---|---|
| Zweifel-Schwelle | 0.58 (glaubt gern) | 0.48 (misstrauisch) |
| Bluff-Neigung | hoch | niedrig |
| Tell | „streicht über den Griff seines Schwerts“ (70 % bei Lüge, 12 % bei Wahrheit) | schwach im Text – verrät sich über den **Einsatz** (×2 bei 70 % seiner Lügen) |
| Vorwissen | keins | kennt deine aufgedeckten Lügen aus Kapitel 1 |

Zusätzlich gibt es neutrale Flavor-Zeilen, damit das bloße Vorhandensein eines Satzes nichts verrät.

### Balance (Simulation, 400 Partien)
Ein vernünftiger Skript-Spieler, der Tells, Einsatz und Kartenzählen *nicht* nutzt, gewinnt ~45 %. Wer die Tells liest, liegt deutlich darüber. Wer immer zweifelt, verliert immer.

---

## PROJEKTSTRUKTUR

```
src/
├── components/
│   ├── GameScene.tsx      # Kapitel-/Screen-Steuerung, Endscreen
│   ├── TaverneIntro.tsx   # Intro-Dialoge mit Sprechern
│   ├── BluffGame.tsx      # Tisch, Züge, Aufdeckung, Regeln
│   ├── StoryBuilder.tsx   # Geschichte bauen (Gegner, Umstände, Einsatz)
│   ├── CardView.tsx       # Trophäen-Karte
│   └── DialogBox.tsx
└── lib/
    ├── cardData.ts        # Deck, Ruhm, Belegbarkeit, Satz-Vorlagen
    ├── gameState.ts       # State + reine Übergänge (tell/doubt/nextRound)
    ├── aiLogic.ts         # Bayes-Schätzung + Entscheidung
    └── dialogSystem.ts    # Dialoge, Personas
```

---

## SPÄTER (nicht im MVP)

- **Widersprüche:** Geschichten aus früheren Runden/Kapiteln (`legendLog`) können sich widersprechen und angreifbar werden.
- **Publikum:** Die Gäste reagieren auf Geschichten und geben Zusatzinfos.
- Mehr Rivalen mit eigenen Tells, auch mit absichtlich falschen Tells.
- Sound, Animationen, Mobile-Feinschliff.
