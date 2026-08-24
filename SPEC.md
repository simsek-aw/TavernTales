# TAVERNE — BLUFFING CARD GAME
## MVP Specification

---

## PROJECT STRUCTURE

```
taverne/
├── src/
│   ├── components/
│   │   ├── GameScene.tsx      # Main game container
│   │   ├── TaverneIntro.tsx   # Rivale intro sequence
│   │   ├── BluffGame.tsx      # Game board / respekt tracking
│   │   ├── StoryBuilder.tsx   # 4-dropdown story selection
│   │   └── DialogBox.tsx      # Character dialogs
│   ├── lib/
│   │   ├── gameState.ts       # State management
│   │   ├── cardData.ts        # Story card definitions
│   │   ├── aiLogic.ts         # Opponent decision logic (plausibility ML)
│   │   └── dialogSystem.ts    # Dialog branching
│   ├── App.tsx
│   └── index.css
├── public/
├── SPEC.md (this file)
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## CORE MECHANICS

### 1. STORY-TEMPLATES (Story Builder)

**4 Dropdowns that combine into: "Ich besiegte einen [A] mit [B] bei [C], [D]"**

**A — GEGNER (10 options):**
- Goblin-Krieger
- Troll
- Dunkler Ritter
- Magier
- Banditen-Boss
- Drache
- Riese
- Dämon
- Kult-Anführer
- Koloss

**B — WAFFE (10 options):**
- Legendäres Schwert
- Verfluchter Dolch
- Magie
- Schildsplitter
- Giftpfeil
- Feuer-Bombe
- Kette
- Mystischer Ring
- Faustkampf
- Kampftechniken

**C — SZENE (10 options):**
- Taverne
- Schlachtfeld
- Dungeon
- Brücke
- Belagerung
- Verfolgung
- Turnier
- Hinterhalt
- Nachtkampf
- Letzter Stand

**D — KONSEQUENZ (10 options):**
- ...ich war verletzt
- ...es war eine Falle
- ...ich war allein
- ...es war unmöglich
- ...war mein letzter Versuch
- ...ich hatte fast keine Waffe
- ...ich war im Sturm
- ...andere hielten mich für tot
- ...ich entkam kaum
- ...mein Gegner war übermächtig

---

### 2. BLUFFING GAME FLOW

**Per Round:**

1. **Player tells story** (via 4 dropdowns → generated text)
2. **Opponent decides:** GLAUBEN or ANZWEIFELN
   - **GLAUBEN:** Card stays face-down, Opponent loses 1 Respekt
   - **ANZWEIFELN:** Card flips
     - If match (Gegner + Waffe + Szene align): Player correct, Opponent loses 2 Respekt
     - If mismatch: Player caught lying, loses 1 Respekt
3. **Opponent's turn** (same flow, player decides)

**Win Condition:**
- Opponent Respekt → 0 = Player wins
- Player Respekt → 0 = Player loses

**Respekt Counter:**
- Both start with 5 points
- Visual tracker shows current state

---

### 3. OPPONENT AI (Plausibility-Based)

**Decision Logic for Opponent:**

```typescript
believeScore = (
  plausibility * 0.4 +      // Does combo make sense?
  characterBias * 0.3 +      // Opponent personality
  respectThreshold * 0.2 +   // How desperate is opponent?
  storyConsistency * 0.1     // Does player repeat stories?
)

if believeScore > 0.6 → BELIEVE
else → DOUBT
```

**Plausibility Scoring (per combo):**
- Goblin + Faustkampf + Taverne = high (common, believable)
- Drache + Giftpfeil + Dungeon = medium (odd combo)
- Riese + Magie + Nachtkampf = low (weird combo)

**Character Bias (Aldric):**
- Believes stories that make him look good (indirect credit)
- Doubts stories that contradict his own narratives
- Gets more paranoid as respekt drops

---

### 4. SCENES / CHAPTERS

**Chapter 1: Taverne (Rivale Aldric)**

**Flow:**
1. Intro Scene (2min narration)
   - Aldric enters
   - Thekendame greets him
   - Aldric tells epic story
   - Player gets demoted ("billigplörre", "knappe, schenk nach")
   - Kill moment: Aldric credits player only for support
   - Player grätscht rein
2. Player selects first story
3. Aldric reacts (believe/doubt)
4. Bluffing game begins (5-10 rounds)
5. Win/Lose condition

**Aldric Properties:**
- Name: "Aldric der Gefeierte"
- BiasType: "vain" (likes stories where he's involved)
- Respekt: 5
- Difficulty: 1

**Win condition:** Aldric Respekt → 0
**Lose condition:** Player Respekt → 0

---

**Chapter 2: Marktplatz (Goblin Krieger Grok)**

**Setup:**
- New location (marketplace, public)
- Grok appears: "Du bist der, der mich angeblich besiegt hast?"
- Knows player's stories from Chapter 1
- Similar bluffing game (5-10 rounds)

**Grok Properties:**
- Name: "Grok der Grüne"
- BiasType: "direct" (wants proof, doubts easily)
- Respekt: 5
- Difficulty: 2 (more skeptical, knows your stories)

**Win condition:** Grok Respekt → 0
**Lose condition:** Player Respekt → 0

**→ After beating Grok: End of MVP (can extend to Chapter 3 later)**

---

## UI/UX

### Main Screen Layout

```
┌─────────────────────────────────────┐
│  TAVERNE - Chapter 1: Intro         │
└─────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐
│  ALDRIC          │ │ [Dialog Box]     │
│  ⭐⭐⭐⭐⭐      │ │ "Ich allein.     │
│  (5 Respekt)     │ │  Mein Schwert.   │
│                  │ │  Und wir kämpf..│
│                  │ │                  │
│                  │ │ [CONTINUE]       │
└──────────────────┘ └──────────────────┘

[Rest: Taverne flavor text]
```

### Game Board (Bluffing)

```
┌─────────────────────────────────────┐
│  ALDRIC DER GEFEIERTE               │
│  Respekt: ⭐⭐⭐⭐ (4/5)           │
├─────────────────────────────────────┤
│  [ALDRIC'S STORY]                   │
│  "Ich besiegte einen Dämon..."      │
│                                     │
│  [ GLAUBEN ] [ ANZWEIFELN ]         │
├─────────────────────────────────────┤
│  DU                                 │
│  Respekt: ⭐⭐⭐⭐⭐ (5/5)         │
├─────────────────────────────────────┤
│ SELECT YOUR STORY:                  │
│ Ich besiegte einen [Gegner]         │
│ mit [Waffe]                         │
│ bei [Szene]                         │
│ [Konsequenz]                        │
│                                     │
│ [ERZÄHLEN]                          │
└─────────────────────────────────────┘
```

### Story Builder (Dropdown UI)

```
Ich besiegte einen:
[Goblin-Krieger ▼]

mit:
[Legendäres Schwert ▼]

bei:
[Taverne ▼]

[...ich war verletzt ▼]

[STORY ERZÄHLEN]
```

---

## STATE MANAGEMENT

### GameState (TypeScript)

```typescript
interface GameState {
  chapter: 1 | 2;
  opponent: Opponent;
  playerRespekt: number;
  opponentRespekt: number;
  round: number;
  gamePhase: "intro" | "story-selection" | "awaiting-decision" | "card-reveal" | "end";
  legendLog: Story[];  // All stories told this chapter
}

interface Opponent {
  name: string;
  biasType: "vain" | "direct" | "aggressive";
  respekt: number;
  knownStories: Story[];  // For later chapters
}

interface Story {
  gegner: string;
  waffe: string;
  szene: string;
  konsequenz: string;
  generatedText: string;
  teller: "player" | "opponent";
}

interface Card {
  gegner: string;
  waffe: string;
  szene: string;
  konsequenz: string;
}
```

---

## CARD DECK

**Per Chapter: Deck of 40 cards** (random mix of templates)

```typescript
const GEGNER = ["Goblin-Krieger", "Troll", ...];
const WAFFE = ["Legendäres Schwert", "Verfluchter Dolch", ...];
const SZENE = ["Taverne", "Schlachtfeld", ...];
const KONSEQUENZ = ["...ich war verletzt", "...es war eine Falle", ...];

function generateDeck() {
  const deck = [];
  for (let i = 0; i < 40; i++) {
    deck.push({
      gegner: random(GEGNER),
      waffe: random(WAFFE),
      szene: random(SZENE),
      konsequenz: random(KONSEQUENZ),
    });
  }
  return deck;
}
```

**Cards are face-down during bluff → revealed only on ANZWEIFELN**

---

## DIALOG SYSTEM

**Dialogs are data-driven:**

```typescript
const DIALOGS = {
  aldric: {
    entrance: "Aldric der Gefeierte betritt die Taverne...",
    believes: [
      "Interessant. Aber das macht dich noch nicht zu meinem Ebenbild.",
      "Vielleicht habe ich dich unterschätzt.",
    ],
    doubts: [
      "Das ist pure Erfindung. Ich war dort.",
      "Du versuchst nur auf meine Welle zu reiten.",
    ],
    lost: "Das kann nicht sein! ICH bin Aldric der Gefeierte!",
  },
};
```

**Text is shown in DialogBox component, can be triggered by game state**

---

## TECH STACK

- **Frontend:** React 18 + TypeScript
- **State:** useState + Context (no Redux for MVP)
- **Styling:** Tailwind CSS (or plain CSS)
- **Cards:** Plain TypeScript objects (JSON)
- **Hosting:** GitHub Pages (or Vercel)

---

## MVP SCOPE (Phase 1)

**Must Have:**
- Taverne Intro scene (fully scripted)
- Story builder (4 dropdowns)
- Bluffing game loop (believe/doubt)
- Card reveal + respekt calc
- Aldric opponent (Chapter 1)
- Win/lose screens

**Nice to Have (Phase 2):**
- Grok opponent (Chapter 2)
- Intro animations
- Sound effects
- Persistent run tracking

**Not in MVP:**
- Meta-progression
- Multiple endings
- Chapter 3+
- Mobile optimization

---

## DEVELOPMENT FLOW

1. **Setup:** React + TS boilerplate, folder structure
2. **Components:** DialogBox → StoryBuilder → BluffGame (bottom-up)
3. **Logic:** gameState + aiLogic (opponent decision)
4. **Data:** cardData (all 40-card deck)
5. **Integration:** Wire components together
6. **Testing:** Manual playthrough of Chapter 1 (multiple runs)
7. **Polish:** Dialog timing, UI feedback, win/lose states

**Estimated time:** 8-12 hours for solid MVP

---

## GIT WORKFLOW

```bash
git init taverne
git remote add origin [your-repo]

# Branches:
main          # Production
dev           # Development
feat/intro    # Feature branches
feat/gameplay
feat/dialogs
```

---

## NEXT STEPS

1. Create GitHub repo
2. Initialize React + TS project
3. Start in Claude Code
4. Build component skeleton first
5. Wire up Taverne Intro
6. Test bluffing game loop
7. Deploy to GitHub Pages

