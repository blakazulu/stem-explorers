# Games Hub Design Document

**Date:** 2026-01-21
**Feature:** Student Games Section (משחקים)

## Overview

Add a comprehensive games section to the student dashboard with 12 STEM-related educational games organized into 6 categories. Games feature grade-adaptive content, badges/achievements, and head-to-head multiplayer for select games.

## Navigation & Routes

### New Sidenav Item (Students)
- **Label:** משחקים
- **Icon:** `gamepad-2` or `puzzle`
- **Route:** `/student/games`

### Route Structure
```
/student/games                    → Games Hub (category grid)
/student/games/[gameType]         → Full-screen game page
/admin/games                      → Admin content management
```

## Games Hub Page

### Layout
```
┌─────────────────────────────────────────────────────┐
│  🎮 משחקי STEM                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ 🏆 ההישגים שלי    [badges row]    3/18  [הכל →]││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 🧪 חידונים  │ │ 🧠 זיכרון   │ │ 🧩 חשיבה    │   │
│  │   1 game    │ │  ומיון      │ │   לוגית     │   │
│  │             │ │   2 games   │ │   3 games   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 🔢 אתגרי   │ │ 📝 משחקי   │ │ 🔬 בנייה    │   │
│  │   חשבון     │ │   מילים     │ │  וניסויים   │   │
│  │   2 games   │ │   2 games   │ │   2 games   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### User Flow
1. Student clicks category card → **Popup modal** shows games in that category
2. Student clicks game card → **Full-screen game page** (100vw × 100vh)
3. Game page shows ONLY the game + controls (no sidebar, no header)

## Categories & Games

| Category | Hebrew | Visual Motif | Color | Games |
|----------|--------|--------------|-------|-------|
| Quiz & Trivia | חידונים | Lightbulbs, stars | Yellow/Gold | STEM Quiz |
| Memory & Sorting | זיכרון ומיון | Brain, cards | Purple/Violet | Memory Cards, Sort It Out |
| Logic & Puzzles | חשיבה לוגית | Gears, circuits | Cyan/Teal | Pattern Recognition, Coding Puzzles, Tangram |
| Math Challenges | אתגרי חשבון | Numbers, equations | Orange/Coral | Math Race, Number Patterns |
| Word Games | משחקי מילים | Letters, books | Pink/Magenta | Word Search, Hangman |
| Build & Experiment | בנייה וניסויים | Beakers, bridges | Blue/Indigo | Virtual Lab, Build a Bridge |

## Game Specifications

### 1. STEM Quiz (חידון STEM)
- **Type:** Multiple choice (4 options)
- **Round:** 10 questions
- **Scoring:** +10 correct, +5 speed bonus (under 5 sec)
- **Features:** Shows explanation after each answer
- **Head-to-head:** ✅ Same questions, race to answer

### 2. Memory Cards (משחק זיכרון)
- **Type:** Classic card matching
- **Grids:** 3×4 (easy), 4×4 (medium), 4×5 (hard)
- **Pairs:** STEM term ↔ image, Hebrew ↔ definition

### 3. Sort It Out (מיון וסיווג)
- **Type:** Drag items to category buckets
- **Buckets:** 3-4 per round
- **Scoring:** Accuracy + speed
- **Examples:** Living/non-living, states of matter, renewable/non-renewable

### 4. Pattern Recognition (זיהוי תבניות)
- **Type:** Pick next item in sequence
- **Options:** 4 choices
- **Patterns:** Colors, shapes, numbers, rotation, multi-rule

### 5. Coding Puzzles (חידות תכנות)
- **Type:** Block-based programming
- **Commands:** ↑ ↓ ← → + loops + conditionals (advanced)
- **Goal:** Move character to target on grid
- **Progression:** Simple paths → loops → conditionals

### 6. Tangram (טנגרם)
- **Type:** Arrange 7 pieces to match silhouette
- **Actions:** Drag, rotate, flip
- **Hints:** Show one piece placement
- **Shapes:** Animals, vehicles, letters, STEM objects

### 7. Math Race (מרוץ חשבון)
- **Type:** Speed arithmetic
- **Round:** 10-20 problems
- **Visual:** Car/rocket advances with correct answers
- **Head-to-head:** ✅ Side-by-side race
- **Grade content:**
  - א-ב: Addition/subtraction within 20
  - ג-ד: Multiplication, division within 100
  - ה-ו: Fractions, decimals, order of operations

### 8. Number Patterns (סדרות מספרים)
- **Type:** Fill in missing numbers
- **Hints:** Show the rule
- **Examples:** 2,4,__,8,10 | Fibonacci | ×2 patterns

### 9. Word Search (חיפוש מילים)
- **Type:** Find words in letter grid
- **Grids:** 8×8 (easy) → 12×12 (hard)
- **Directions:** Horizontal only (easy) → all directions (hard)
- **Content:** STEM vocabulary per unit/topic

### 10. Hangman (איש תלוי)
- **Type:** Letter guessing
- **Guesses:** 6 wrong allowed
- **Hints:** Category or first letter
- **Hebrew:** Full א-ת keyboard, final letters handled

### 11. Virtual Experiment Lab (מעבדה וירטואלית)
- **Type:** Guided interactive experiments
- **Structure:**
  1. Hypothesis - "What do you think will happen?"
  2. Experiment - Drag ingredients/tools
  3. Observation - "What happened?"
  4. Conclusion - Explanation revealed
- **Experiments:**
  - א-ב: Sink/float, magnets
  - ג-ד: Circuits, plant growth
  - ה-ו: Chemical reactions, density

### 12. Build a Bridge (בנה גשר)
- **Type:** Physics-based construction
- **Materials:** Beams, cables, supports (limited)
- **Test:** Vehicle crosses, bridge must hold
- **Feedback:** Stress indicators, collapse replay
- **Scoring:** Star rating based on efficiency

## Grade Adaptation

**Mixed approach:**
1. Grade determines starting content/difficulty
2. Student can manually adjust: קל / בינוני / מאתגר

**Content pre-defined per grade in Firestore**

## Time Limits

- **Racing games** (Math Race, Quiz): Timer by default
- **Puzzle games:** No timer by default
- **All games:** Optional timer toggle for extra challenge

## Head-to-Head Multiplayer

**Supported games:** STEM Quiz, Math Race

**Matchmaking system:**
1. Student A clicks "head-to-head" → game shows "waiting for opponent"
2. Student B (same grade, different computer) sees notification
3. Student B accepts → randomly matched with a waiting player
4. Multiple matches can happen simultaneously
5. Students can always choose solo instead

**Note:** Multiple students share same user account per grade, so matching is random within grade.

## Badges & Achievements

### Badge Categories

**🎯 Getting Started**
| Badge | Hebrew | Criteria |
|-------|--------|----------|
| First Steps | צעדים ראשונים | Play first game |
| Explorer | חוקר | Try 3 different games |
| Adventurer | הרפתקן | Try all 12 games |

**🏆 Mastery (per game)**
| Badge | Hebrew | Criteria |
|-------|--------|----------|
| Quiz Whiz | אלוף החידונים | Score 100% on quiz |
| Memory Master | מלך הזיכרון | Complete hard mode memory |
| Math Champion | אלוף החשבון | Win 5 math races |
| Code Ninja | נינג'ת הקוד | Complete 10 coding puzzles |
| Word Wizard | קוסם המילים | Find all words under time |
| Bridge Builder | בונה גשרים | Build 5 successful bridges |
| Lab Scientist | מדען מעבדה | Complete 5 experiments |

**🔥 Streaks**
| Badge | Hebrew | Criteria |
|-------|--------|----------|
| On Fire | בוער | 3 days in a row |
| Dedicated | מסור | 7 days in a row |
| Unstoppable | בלתי ניתן לעצירה | 14 days in a row |

**⚔️ Head-to-Head**
| Badge | Hebrew | Criteria |
|-------|--------|----------|
| Challenger | מאתגר | First head-to-head |
| Champion | אלוף | Win 10 head-to-head |

### Display
- Trophy shelf on games hub showing earned badges
- Locked badges shown as gray silhouettes
- "View all" modal with full progress

## Firestore Data Structure

### `gameContent/{contentId}`
```typescript
{
  gameType: "quiz" | "memory" | "sort" | "pattern" | "coding" |
            "tangram" | "mathRace" | "numberPattern" |
            "wordSearch" | "hangman" | "experiment" | "bridge",
  grade: "א" | "ב" | "ג" | "ד" | "ה" | "ו",
  difficulty: "easy" | "medium" | "hard",
  content: { /* game-specific structure */ },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `gameProgress/{visitorId_visitorGrade_gameType}`
```typescript
{
  visitorId: string,
  visitorName: string,
  visitorGrade: "א" | "ב" | "ג" | "ד" | "ה" | "ו",
  gameType: string,
  highScore: number,
  gamesPlayed: number,
  lastPlayed: Timestamp,
  stats: { /* game-specific stats */ }
}
```

### `badges/{visitorId_visitorGrade}`
```typescript
{
  visitorId: string,
  visitorName: string,
  visitorGrade: "א" | "ב" | "ג" | "ד" | "ה" | "ו",
  badges: [
    { id: "first_game", earnedAt: Timestamp },
    // ...
  ]
}
```

### `headToHead/{challengeId}`
```typescript
{
  visitorGrade: "א" | "ב" | "ג" | "ד" | "ה" | "ו",
  gameType: "quiz" | "mathRace",
  status: "waiting" | "active" | "completed",
  player1: { odcumentId visitorId: string, score: number },
  player2: { odcumentId visitorId: string, score: number } | null,
  contentIds: string[],
  createdAt: Timestamp,
  expiresAt: Timestamp
}
```

## Admin Panel

### Route: `/admin/games`

### Features
- Table view of all game content
- Filter by: game type, grade, difficulty
- CRUD operations for each content item
- Game-specific editor forms
- Bulk import/export (CSV/JSON)
- Duplicate content to different grade

### Editor Forms
Each game type has specific form fields matching its content structure.

## Audio

**No audio** - Silent games for school-friendly environment.

## Implementation Order

### Phase 1: Infrastructure
1. Firestore collections setup + types
2. Game services (CRUD operations)
3. React Query hooks for games
4. Games hub page + category cards
5. Category popup modal
6. Full-screen game layout component
7. Badge system + display
8. Admin panel for content management
9. Head-to-head matchmaking system

**→ Code review → User approval before Phase 2**

### Phase 2: Games (Easiest to Hardest)
Build each game, run code-review, wait for user testing & approval:

1. Hangman
2. Word Search
3. Memory Cards
4. STEM Quiz (+ head-to-head)
5. Sort It Out
6. Number Patterns
7. Math Race (+ head-to-head)
8. Pattern Recognition
9. Coding Puzzles
10. Tangram
11. Virtual Lab
12. Build a Bridge

## Visual Design

Each category has unique visual identity:

| Category | Background Pattern | Accent Color |
|----------|-------------------|--------------|
| חידונים | Sparkle particles | Yellow/Gold |
| זיכרון ומיון | Floating shapes | Purple/Violet |
| חשיבה לוגית | Circuit board lines | Cyan/Teal |
| אתגרי חשבון | Grid paper | Orange/Coral |
| משחקי מילים | Scattered letters | Pink/Magenta |
| בנייה וניסויים | Blueprint grid | Blue/Indigo |

All designs maintain cohesion with student emerald theme while having distinct category personalities.
