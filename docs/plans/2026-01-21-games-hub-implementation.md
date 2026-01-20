# Games Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Track progress using TodoWrite tool.

**Goal:** Add a comprehensive games section to the student dashboard with 12 STEM educational games, badges/achievements, and head-to-head multiplayer.

**Architecture:** Games hub page with 6 category cards → popup modal with game cards → full-screen game page. Firestore stores game content (admin-managed), player progress, badges, and head-to-head challenges. React Query for caching.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Firebase Firestore, React Query, @dnd-kit (for drag-drop games)

---

## Phase 1: Infrastructure

Build all foundational pieces before any games. Code review after phase completion.

---

### Task 1.1: TypeScript Types for Games

**Files:**
- Create: `src/types/games.ts`
- Modify: `src/types/index.ts`

**Step 1: Create games types file**

Create `src/types/games.ts`:

```typescript
import type { Grade } from "./index";

// Game type identifiers
export type GameType =
  | "quiz"
  | "memory"
  | "sort"
  | "pattern"
  | "coding"
  | "tangram"
  | "mathRace"
  | "numberPattern"
  | "wordSearch"
  | "hangman"
  | "experiment"
  | "bridge";

// Difficulty levels
export type Difficulty = "easy" | "medium" | "hard";

// Category identifiers
export type GameCategory =
  | "quiz"
  | "memory"
  | "logic"
  | "math"
  | "words"
  | "build";

// Category metadata
export interface CategoryInfo {
  id: GameCategory;
  nameHe: string;
  icon: string;
  color: string;
  pattern: string;
  games: GameType[];
}

// Base game content structure
export interface GameContentBase {
  id: string;
  gameType: GameType;
  grade: Grade;
  difficulty: Difficulty;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz content
export interface QuizContent extends GameContentBase {
  gameType: "quiz";
  content: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// Memory content
export interface MemoryContent extends GameContentBase {
  gameType: "memory";
  content: {
    pairs: Array<{
      term: string;
      match: string;
      imageUrl?: string;
    }>;
  };
}

// Sort content
export interface SortContent extends GameContentBase {
  gameType: "sort";
  content: {
    buckets: string[];
    items: Array<{
      text: string;
      correctBucket: number;
    }>;
  };
}

// Pattern content
export interface PatternContent extends GameContentBase {
  gameType: "pattern";
  content: {
    sequence: string[];
    options: string[];
    correctIndex: number;
    rule: string;
  };
}

// Coding puzzle content
export interface CodingContent extends GameContentBase {
  gameType: "coding";
  content: {
    gridSize: number;
    start: { x: number; y: number };
    goal: { x: number; y: number };
    obstacles: Array<{ x: number; y: number }>;
    maxMoves: number;
    allowLoops: boolean;
    allowConditionals: boolean;
  };
}

// Tangram content
export interface TangramContent extends GameContentBase {
  gameType: "tangram";
  content: {
    targetShape: string; // SVG path or image URL
    pieces: Array<{
      id: string;
      shape: string;
      initialPosition: { x: number; y: number; rotation: number };
    }>;
  };
}

// Math race content
export interface MathRaceContent extends GameContentBase {
  gameType: "mathRace";
  content: {
    problem: string;
    answer: number;
    options: number[];
  };
}

// Number pattern content
export interface NumberPatternContent extends GameContentBase {
  gameType: "numberPattern";
  content: {
    sequence: (number | null)[];
    answer: number;
    rule: string;
  };
}

// Word search content
export interface WordSearchContent extends GameContentBase {
  gameType: "wordSearch";
  content: {
    words: string[];
    gridSize: number;
    directions: ("horizontal" | "vertical" | "diagonal")[];
  };
}

// Hangman content
export interface HangmanContent extends GameContentBase {
  gameType: "hangman";
  content: {
    word: string;
    hint: string;
    category: string;
  };
}

// Experiment content
export interface ExperimentContent extends GameContentBase {
  gameType: "experiment";
  content: {
    title: string;
    hypothesisPrompt: string;
    steps: Array<{
      instruction: string;
      action: "drag" | "click" | "observe";
      targetId?: string;
    }>;
    conclusion: string;
    imageUrl?: string;
  };
}

// Bridge content
export interface BridgeContent extends GameContentBase {
  gameType: "bridge";
  content: {
    gapWidth: number;
    budget: number;
    materials: Array<{
      type: "beam" | "cable" | "support";
      cost: number;
      strength: number;
    }>;
    vehicleWeight: number;
  };
}

// Union type for all game content
export type GameContent =
  | QuizContent
  | MemoryContent
  | SortContent
  | PatternContent
  | CodingContent
  | TangramContent
  | MathRaceContent
  | NumberPatternContent
  | WordSearchContent
  | HangmanContent
  | ExperimentContent
  | BridgeContent;

// Player progress
export interface GameProgress {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorGrade: Grade;
  gameType: GameType;
  highScore: number;
  gamesPlayed: number;
  lastPlayed: Date;
  stats: Record<string, number>;
}

// Badge definition
export interface BadgeDefinition {
  id: string;
  nameHe: string;
  description: string;
  icon: string;
  category: "starter" | "mastery" | "streak" | "headToHead";
  criteria: {
    type: "games_played" | "score" | "streak" | "wins" | "game_specific";
    gameType?: GameType;
    threshold: number;
  };
}

// Player badges
export interface PlayerBadges {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorGrade: Grade;
  badges: Array<{
    id: string;
    earnedAt: Date;
  }>;
  streakDays: number;
  lastPlayDate: Date | null;
}

// Head-to-head challenge
export interface HeadToHeadChallenge {
  id: string;
  visitorGrade: Grade;
  gameType: "quiz" | "mathRace";
  status: "waiting" | "active" | "completed";
  player1: {
    odcumentId visitorId: string visitorId: string;
    visitorName: string;
    score: number;
  };
  player2: {
    odcumentId visitorId: string visitorId: string;
    visitorName: string;
    score: number;
  } | null;
  contentIds: string[];
  createdAt: Date;
  expiresAt: Date;
}

// Game session state (for active games)
export interface GameSession {
  gameType: GameType;
  difficulty: Difficulty;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  startTime: Date;
  timerEnabled: boolean;
  isHeadToHead: boolean;
  challengeId?: string;
}
```

**Step 2: Export from index.ts**

Add to `src/types/index.ts` at the end:

```typescript
// Games
export * from "./games";
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/types/games.ts src/types/index.ts
git commit -m "feat(games): add TypeScript types for games system"
```

---

### Task 1.2: Game Constants and Categories

**Files:**
- Create: `src/lib/constants/games.ts`

**Step 1: Create games constants file**

Create `src/lib/constants/games.ts`:

```typescript
import type { CategoryInfo, BadgeDefinition, GameType } from "@/types/games";

// Category definitions with visual styling
export const GAME_CATEGORIES: CategoryInfo[] = [
  {
    id: "quiz",
    nameHe: "חידונים",
    icon: "lightbulb",
    color: "amber",
    pattern: "sparkle",
    games: ["quiz"],
  },
  {
    id: "memory",
    nameHe: "זיכרון ומיון",
    icon: "brain",
    color: "violet",
    pattern: "shapes",
    games: ["memory", "sort"],
  },
  {
    id: "logic",
    nameHe: "חשיבה לוגית",
    icon: "cog",
    color: "cyan",
    pattern: "circuit",
    games: ["pattern", "coding", "tangram"],
  },
  {
    id: "math",
    nameHe: "אתגרי חשבון",
    icon: "calculator",
    color: "orange",
    pattern: "grid",
    games: ["mathRace", "numberPattern"],
  },
  {
    id: "words",
    nameHe: "משחקי מילים",
    icon: "type",
    color: "pink",
    pattern: "letters",
    games: ["wordSearch", "hangman"],
  },
  {
    id: "build",
    nameHe: "בנייה וניסויים",
    icon: "flask",
    color: "indigo",
    pattern: "blueprint",
    games: ["experiment", "bridge"],
  },
];

// Game metadata
export const GAME_INFO: Record<GameType, { nameHe: string; icon: string; hasHeadToHead: boolean; defaultTimer: boolean }> = {
  quiz: { nameHe: "חידון STEM", icon: "help-circle", hasHeadToHead: true, defaultTimer: true },
  memory: { nameHe: "משחק זיכרון", icon: "grid-3x3", hasHeadToHead: false, defaultTimer: false },
  sort: { nameHe: "מיון וסיווג", icon: "git-merge", hasHeadToHead: false, defaultTimer: false },
  pattern: { nameHe: "זיהוי תבניות", icon: "workflow", hasHeadToHead: false, defaultTimer: false },
  coding: { nameHe: "חידות תכנות", icon: "code", hasHeadToHead: false, defaultTimer: false },
  tangram: { nameHe: "טנגרם", icon: "shapes", hasHeadToHead: false, defaultTimer: false },
  mathRace: { nameHe: "מרוץ חשבון", icon: "zap", hasHeadToHead: true, defaultTimer: true },
  numberPattern: { nameHe: "סדרות מספרים", icon: "hash", hasHeadToHead: false, defaultTimer: false },
  wordSearch: { nameHe: "חיפוש מילים", icon: "search", hasHeadToHead: false, defaultTimer: false },
  hangman: { nameHe: "איש תלוי", icon: "user", hasHeadToHead: false, defaultTimer: false },
  experiment: { nameHe: "מעבדה וירטואלית", icon: "flask", hasHeadToHead: false, defaultTimer: false },
  bridge: { nameHe: "בנה גשר", icon: "construction", hasHeadToHead: false, defaultTimer: false },
};

// Badge definitions
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Starter badges
  {
    id: "first_game",
    nameHe: "צעדים ראשונים",
    description: "שחקת את המשחק הראשון שלך",
    icon: "star",
    category: "starter",
    criteria: { type: "games_played", threshold: 1 },
  },
  {
    id: "explorer",
    nameHe: "חוקר",
    description: "שחקת ב-3 משחקים שונים",
    icon: "compass",
    category: "starter",
    criteria: { type: "games_played", threshold: 3 },
  },
  {
    id: "adventurer",
    nameHe: "הרפתקן",
    description: "שחקת בכל 12 המשחקים",
    icon: "map",
    category: "starter",
    criteria: { type: "games_played", threshold: 12 },
  },
  // Mastery badges
  {
    id: "quiz_master",
    nameHe: "אלוף החידונים",
    description: "השגת 100% בחידון",
    icon: "trophy",
    category: "mastery",
    criteria: { type: "score", gameType: "quiz", threshold: 100 },
  },
  {
    id: "memory_master",
    nameHe: "מלך הזיכרון",
    description: "סיימת משחק זיכרון ברמה קשה",
    icon: "brain",
    category: "mastery",
    criteria: { type: "game_specific", gameType: "memory", threshold: 1 },
  },
  {
    id: "math_champion",
    nameHe: "אלוף החשבון",
    description: "ניצחת ב-5 מרוצי חשבון",
    icon: "calculator",
    category: "mastery",
    criteria: { type: "wins", gameType: "mathRace", threshold: 5 },
  },
  {
    id: "code_ninja",
    nameHe: "נינג'ת הקוד",
    description: "פתרת 10 חידות תכנות",
    icon: "code",
    category: "mastery",
    criteria: { type: "game_specific", gameType: "coding", threshold: 10 },
  },
  {
    id: "word_wizard",
    nameHe: "קוסם המילים",
    description: "מצאת את כל המילים בזמן",
    icon: "wand-2",
    category: "mastery",
    criteria: { type: "game_specific", gameType: "wordSearch", threshold: 1 },
  },
  {
    id: "bridge_builder",
    nameHe: "בונה גשרים",
    description: "בנית 5 גשרים מוצלחים",
    icon: "construction",
    category: "mastery",
    criteria: { type: "game_specific", gameType: "bridge", threshold: 5 },
  },
  {
    id: "lab_scientist",
    nameHe: "מדען מעבדה",
    description: "השלמת 5 ניסויים",
    icon: "flask",
    category: "mastery",
    criteria: { type: "game_specific", gameType: "experiment", threshold: 5 },
  },
  // Streak badges
  {
    id: "on_fire",
    nameHe: "בוער",
    description: "שחקת 3 ימים ברצף",
    icon: "flame",
    category: "streak",
    criteria: { type: "streak", threshold: 3 },
  },
  {
    id: "dedicated",
    nameHe: "מסור",
    description: "שחקת 7 ימים ברצף",
    icon: "calendar",
    category: "streak",
    criteria: { type: "streak", threshold: 7 },
  },
  {
    id: "unstoppable",
    nameHe: "בלתי ניתן לעצירה",
    description: "שחקת 14 ימים ברצף",
    icon: "rocket",
    category: "streak",
    criteria: { type: "streak", threshold: 14 },
  },
  // Head-to-head badges
  {
    id: "challenger",
    nameHe: "מאתגר",
    description: "שחקת את המשחק הראשון ראש בראש",
    icon: "swords",
    category: "headToHead",
    criteria: { type: "games_played", threshold: 1 },
  },
  {
    id: "champion",
    nameHe: "אלוף",
    description: "ניצחת ב-10 משחקים ראש בראש",
    icon: "crown",
    category: "headToHead",
    criteria: { type: "wins", threshold: 10 },
  },
];

// Hebrew alphabet for hangman keyboard
export const HEBREW_ALPHABET = [
  "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
  "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר",
  "ש", "ת",
];

// Final letters mapping
export const FINAL_LETTERS: Record<string, string> = {
  "כ": "ך",
  "מ": "ם",
  "נ": "ן",
  "פ": "ף",
  "צ": "ץ",
};

// Difficulty labels in Hebrew
export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "מאתגר",
};
```

**Step 2: Verify no errors**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/constants/games.ts
git commit -m "feat(games): add game constants, categories, and badge definitions"
```

---

### Task 1.3: Firestore Services for Games

**Files:**
- Create: `src/lib/services/games.ts`

**Step 1: Create games service file**

Create `src/lib/services/games.ts`:

```typescript
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type {
  GameContent,
  GameType,
  Difficulty,
  GameProgress,
  PlayerBadges,
  HeadToHeadChallenge,
} from "@/types/games";
import type { Grade } from "@/types";

// Collections
const GAME_CONTENT = "gameContent";
const GAME_PROGRESS = "gameProgress";
const BADGES = "gameBadges";
const HEAD_TO_HEAD = "headToHead";

// ==================== GAME CONTENT ====================

export async function getGameContent(
  gameType: GameType,
  grade: Grade,
  difficulty?: Difficulty
): Promise<GameContent[]> {
  try {
    let q = query(
      collection(db, GAME_CONTENT),
      where("gameType", "==", gameType),
      where("grade", "==", grade)
    );

    if (difficulty) {
      q = query(q, where("difficulty", "==", difficulty));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as GameContent[];
  } catch (error) {
    handleFirebaseError(error, "getGameContent");
    return [];
  }
}

export async function getAllGameContent(
  gameType?: GameType,
  grade?: Grade
): Promise<GameContent[]> {
  try {
    let q = query(collection(db, GAME_CONTENT));

    if (gameType) {
      q = query(q, where("gameType", "==", gameType));
    }
    if (grade) {
      q = query(q, where("grade", "==", grade));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as GameContent[];
  } catch (error) {
    handleFirebaseError(error, "getAllGameContent");
    return [];
  }
}

export async function createGameContent(
  data: Omit<GameContent, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, GAME_CONTENT), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createGameContent");
    throw error;
  }
}

export async function updateGameContent(
  id: string,
  data: Partial<Omit<GameContent, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, GAME_CONTENT, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "updateGameContent");
    throw error;
  }
}

export async function deleteGameContent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GAME_CONTENT, id));
  } catch (error) {
    handleFirebaseError(error, "deleteGameContent");
    throw error;
  }
}

// ==================== GAME PROGRESS ====================

export async function getGameProgress(
  visitorId: string,
  visitorGrade: Grade,
  gameType?: GameType
): Promise<GameProgress[]> {
  try {
    let q = query(
      collection(db, GAME_PROGRESS),
      where("visitorId", "==", visitorId),
      where("visitorGrade", "==", visitorGrade)
    );

    if (gameType) {
      q = query(q, where("gameType", "==", gameType));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastPlayed: doc.data().lastPlayed?.toDate(),
    })) as GameProgress[];
  } catch (error) {
    handleFirebaseError(error, "getGameProgress");
    return [];
  }
}

export async function updateGameProgress(
  visitorId: string,
  visitorName: string,
  visitorGrade: Grade,
  gameType: GameType,
  score: number,
  stats?: Record<string, number>
): Promise<void> {
  try {
    const progressId = `${visitorId}_${visitorGrade}_${gameType}`;
    const docRef = doc(db, GAME_PROGRESS, progressId);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      const existing = existingDoc.data() as GameProgress;
      await updateDoc(docRef, {
        highScore: Math.max(existing.highScore, score),
        gamesPlayed: existing.gamesPlayed + 1,
        lastPlayed: serverTimestamp(),
        stats: stats ? { ...existing.stats, ...stats } : existing.stats,
      });
    } else {
      await updateDoc(docRef, {
        visitorId,
        visitorName,
        visitorGrade,
        gameType,
        highScore: score,
        gamesPlayed: 1,
        lastPlayed: serverTimestamp(),
        stats: stats || {},
      }).catch(() => {
        // Doc doesn't exist, create it
        addDoc(collection(db, GAME_PROGRESS), {
          visitorId,
          visitorName,
          visitorGrade,
          gameType,
          highScore: score,
          gamesPlayed: 1,
          lastPlayed: serverTimestamp(),
          stats: stats || {},
        });
      });
    }
  } catch (error) {
    handleFirebaseError(error, "updateGameProgress");
    throw error;
  }
}

// ==================== BADGES ====================

export async function getPlayerBadges(
  visitorId: string,
  visitorGrade: Grade
): Promise<PlayerBadges | null> {
  try {
    const badgeId = `${visitorId}_${visitorGrade}`;
    const docRef = doc(db, BADGES, badgeId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      badges: data.badges?.map((b: { id: string; earnedAt: Timestamp }) => ({
        ...b,
        earnedAt: b.earnedAt?.toDate(),
      })) || [],
      lastPlayDate: data.lastPlayDate?.toDate() || null,
    } as PlayerBadges;
  } catch (error) {
    handleFirebaseError(error, "getPlayerBadges");
    return null;
  }
}

export async function awardBadge(
  visitorId: string,
  visitorName: string,
  visitorGrade: Grade,
  badgeId: string
): Promise<void> {
  try {
    const docId = `${visitorId}_${visitorGrade}`;
    const docRef = doc(db, BADGES, docId);
    const snapshot = await getDoc(docRef);

    const newBadge = { id: badgeId, earnedAt: serverTimestamp() };

    if (snapshot.exists()) {
      const existing = snapshot.data();
      const badges = existing.badges || [];

      // Don't add if already earned
      if (badges.some((b: { id: string }) => b.id === badgeId)) return;

      await updateDoc(docRef, {
        badges: [...badges, newBadge],
      });
    } else {
      await addDoc(collection(db, BADGES), {
        visitorId,
        visitorName,
        visitorGrade,
        badges: [newBadge],
        streakDays: 0,
        lastPlayDate: null,
      });
    }
  } catch (error) {
    handleFirebaseError(error, "awardBadge");
    throw error;
  }
}

export async function updateStreak(
  visitorId: string,
  visitorName: string,
  visitorGrade: Grade
): Promise<number> {
  try {
    const docId = `${visitorId}_${visitorGrade}`;
    const docRef = doc(db, BADGES, docId);
    const snapshot = await getDoc(docRef);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const lastPlay = data.lastPlayDate?.toDate();

      if (lastPlay) {
        const lastPlayDate = new Date(lastPlay);
        lastPlayDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today.getTime() - lastPlayDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, no change
          return data.streakDays;
        } else if (diffDays === 1) {
          // Consecutive day, increment streak
          const newStreak = (data.streakDays || 0) + 1;
          await updateDoc(docRef, {
            streakDays: newStreak,
            lastPlayDate: serverTimestamp(),
          });
          return newStreak;
        } else {
          // Streak broken, reset to 1
          await updateDoc(docRef, {
            streakDays: 1,
            lastPlayDate: serverTimestamp(),
          });
          return 1;
        }
      }
    }

    // First time playing
    const batch = writeBatch(db);
    batch.set(docRef, {
      visitorId,
      visitorName,
      visitorGrade,
      badges: [],
      streakDays: 1,
      lastPlayDate: serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return 1;
  } catch (error) {
    handleFirebaseError(error, "updateStreak");
    return 0;
  }
}

// ==================== HEAD-TO-HEAD ====================

export async function createChallenge(
  visitorGrade: Grade,
  gameType: "quiz" | "mathRace",
  player1Id: string,
  player1Name: string,
  contentIds: string[]
): Promise<string> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 min timeout

    const docRef = await addDoc(collection(db, HEAD_TO_HEAD), {
      visitorGrade,
      gameType,
      status: "waiting",
      player1: { visitorId: player1Id, visitorName: player1Name, score: 0 },
      player2: null,
      contentIds,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createChallenge");
    throw error;
  }
}

export async function getWaitingChallenges(
  visitorGrade: Grade,
  gameType: "quiz" | "mathRace"
): Promise<HeadToHeadChallenge[]> {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, HEAD_TO_HEAD),
      where("visitorGrade", "==", visitorGrade),
      where("gameType", "==", gameType),
      where("status", "==", "waiting"),
      where("expiresAt", ">", now)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
    })) as HeadToHeadChallenge[];
  } catch (error) {
    handleFirebaseError(error, "getWaitingChallenges");
    return [];
  }
}

export async function joinChallenge(
  challengeId: string,
  player2Id: string,
  player2Name: string
): Promise<void> {
  try {
    await updateDoc(doc(db, HEAD_TO_HEAD, challengeId), {
      status: "active",
      player2: { visitorId: player2Id, visitorName: player2Name, score: 0 },
    });
  } catch (error) {
    handleFirebaseError(error, "joinChallenge");
    throw error;
  }
}

export async function updateChallengeScore(
  challengeId: string,
  playerId: string,
  score: number
): Promise<void> {
  try {
    const docRef = doc(db, HEAD_TO_HEAD, challengeId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return;

    const data = snapshot.data();
    const isPlayer1 = data.player1?.visitorId === playerId;

    await updateDoc(docRef, {
      [isPlayer1 ? "player1.score" : "player2.score"]: score,
    });
  } catch (error) {
    handleFirebaseError(error, "updateChallengeScore");
    throw error;
  }
}

export async function completeChallenge(challengeId: string): Promise<void> {
  try {
    await updateDoc(doc(db, HEAD_TO_HEAD, challengeId), {
      status: "completed",
    });
  } catch (error) {
    handleFirebaseError(error, "completeChallenge");
    throw error;
  }
}

export function subscribeToChallenge(
  challengeId: string,
  callback: (challenge: HeadToHeadChallenge | null) => void
): () => void {
  const unsubscribe = onSnapshot(
    doc(db, HEAD_TO_HEAD, challengeId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
      } as HeadToHeadChallenge);
    }
  );
  return unsubscribe;
}
```

**Step 2: Verify no errors**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/services/games.ts
git commit -m "feat(games): add Firestore services for game content, progress, badges, and head-to-head"
```

---

### Task 1.4: React Query Hooks for Games

**Files:**
- Modify: `src/lib/queries/keys.ts`
- Create: `src/lib/queries/games.ts`
- Modify: `src/lib/queries/index.ts`

**Step 1: Add game query keys**

Add to `src/lib/queries/keys.ts`:

```typescript
// Add to queryKeys object:
  games: {
    content: {
      all: ["games", "content"] as const,
      byType: (gameType: string) => ["games", "content", gameType] as const,
      byTypeAndGrade: (gameType: string, grade: string) =>
        ["games", "content", gameType, grade] as const,
    },
    progress: {
      all: ["games", "progress"] as const,
      byVisitor: (visitorId: string, grade: string) =>
        ["games", "progress", visitorId, grade] as const,
    },
    badges: {
      byVisitor: (visitorId: string, grade: string) =>
        ["games", "badges", visitorId, grade] as const,
    },
    headToHead: {
      waiting: (grade: string, gameType: string) =>
        ["games", "headToHead", "waiting", grade, gameType] as const,
      single: (challengeId: string) =>
        ["games", "headToHead", challengeId] as const,
    },
  },
```

**Step 2: Create games hooks file**

Create `src/lib/queries/games.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getGameContent,
  getAllGameContent,
  createGameContent,
  updateGameContent,
  deleteGameContent,
  getGameProgress,
  updateGameProgress,
  getPlayerBadges,
  awardBadge,
  updateStreak,
  createChallenge,
  getWaitingChallenges,
  joinChallenge,
  updateChallengeScore,
  completeChallenge,
} from "@/lib/services/games";
import type { GameType, Difficulty, GameContent } from "@/types/games";
import type { Grade } from "@/types";

// ==================== GAME CONTENT HOOKS ====================

export function useGameContent(
  gameType: GameType | null,
  grade: Grade | null,
  difficulty?: Difficulty
) {
  return useQuery({
    queryKey: queryKeys.games.content.byTypeAndGrade(gameType!, grade!),
    queryFn: () => getGameContent(gameType!, grade!, difficulty),
    enabled: !!gameType && !!grade,
  });
}

export function useAllGameContent(gameType?: GameType, grade?: Grade) {
  return useQuery({
    queryKey: gameType || grade
      ? queryKeys.games.content.byType(gameType || "all")
      : queryKeys.games.content.all,
    queryFn: () => getAllGameContent(gameType, grade),
  });
}

export function useCreateGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGameContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.content.all });
    },
  });
}

export function useUpdateGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<GameContent, "id" | "createdAt" | "updatedAt">> }) =>
      updateGameContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.content.all });
    },
  });
}

export function useDeleteGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGameContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.content.all });
    },
  });
}

// ==================== GAME PROGRESS HOOKS ====================

export function useGameProgress(
  visitorId: string | null,
  visitorGrade: Grade | null,
  gameType?: GameType
) {
  return useQuery({
    queryKey: queryKeys.games.progress.byVisitor(visitorId!, visitorGrade!),
    queryFn: () => getGameProgress(visitorId!, visitorGrade!, gameType),
    enabled: !!visitorId && !!visitorGrade,
  });
}

export function useUpdateGameProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorId,
      visitorName,
      visitorGrade,
      gameType,
      score,
      stats,
    }: {
      visitorId: string;
      visitorName: string;
      visitorGrade: Grade;
      gameType: GameType;
      score: number;
      stats?: Record<string, number>;
    }) => updateGameProgress(visitorId, visitorName, visitorGrade, gameType, score, stats),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.progress.byVisitor(variables.visitorId, variables.visitorGrade),
      });
    },
  });
}

// ==================== BADGES HOOKS ====================

export function usePlayerBadges(visitorId: string | null, visitorGrade: Grade | null) {
  return useQuery({
    queryKey: queryKeys.games.badges.byVisitor(visitorId!, visitorGrade!),
    queryFn: () => getPlayerBadges(visitorId!, visitorGrade!),
    enabled: !!visitorId && !!visitorGrade,
  });
}

export function useAwardBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorId,
      visitorName,
      visitorGrade,
      badgeId,
    }: {
      visitorId: string;
      visitorName: string;
      visitorGrade: Grade;
      badgeId: string;
    }) => awardBadge(visitorId, visitorName, visitorGrade, badgeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.badges.byVisitor(variables.visitorId, variables.visitorGrade),
      });
    },
  });
}

export function useUpdateStreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorId,
      visitorName,
      visitorGrade,
    }: {
      visitorId: string;
      visitorName: string;
      visitorGrade: Grade;
    }) => updateStreak(visitorId, visitorName, visitorGrade),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.badges.byVisitor(variables.visitorId, variables.visitorGrade),
      });
    },
  });
}

// ==================== HEAD-TO-HEAD HOOKS ====================

export function useWaitingChallenges(
  visitorGrade: Grade | null,
  gameType: "quiz" | "mathRace" | null
) {
  return useQuery({
    queryKey: queryKeys.games.headToHead.waiting(visitorGrade!, gameType!),
    queryFn: () => getWaitingChallenges(visitorGrade!, gameType!),
    enabled: !!visitorGrade && !!gameType,
    refetchInterval: 3000, // Poll every 3 seconds for waiting challenges
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorGrade,
      gameType,
      player1Id,
      player1Name,
      contentIds,
    }: {
      visitorGrade: Grade;
      gameType: "quiz" | "mathRace";
      player1Id: string;
      player1Name: string;
      contentIds: string[];
    }) => createChallenge(visitorGrade, gameType, player1Id, player1Name, contentIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.headToHead.waiting(variables.visitorGrade, variables.gameType),
      });
    },
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      challengeId,
      player2Id,
      player2Name,
    }: {
      challengeId: string;
      player2Id: string;
      player2Name: string;
    }) => joinChallenge(challengeId, player2Id, player2Name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", "headToHead"] });
    },
  });
}

export function useUpdateChallengeScore() {
  return useMutation({
    mutationFn: ({
      challengeId,
      playerId,
      score,
    }: {
      challengeId: string;
      playerId: string;
      score: number;
    }) => updateChallengeScore(challengeId, playerId, score),
  });
}

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", "headToHead"] });
    },
  });
}
```

**Step 3: Export from index.ts**

Add to `src/lib/queries/index.ts`:

```typescript
export * from "./games";
```

**Step 4: Verify no errors**

Run: `npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add src/lib/queries/keys.ts src/lib/queries/games.ts src/lib/queries/index.ts
git commit -m "feat(games): add React Query hooks for games data"
```

---

### Task 1.5: Add Icons to Icon Component

**Files:**
- Modify: `src/components/ui/Icon.tsx`

**Step 1: Add game-related icons**

Find the `iconMap` object in `src/components/ui/Icon.tsx` and add these icons:

```typescript
// Add to imports at top:
import {
  // ... existing imports
  Gamepad2,
  Construction,
  Shapes,
  Hash,
  Workflow,
  Code,
  GitMerge,
  Grid3x3,
  Swords,
  Crown,
  Wand2,
  Compass,
  Map,
  Flame,
  Calendar,
  Calculator,
  Type,
} from "lucide-react";

// Add to iconMap object:
  "gamepad-2": Gamepad2,
  construction: Construction,
  shapes: Shapes,
  hash: Hash,
  workflow: Workflow,
  code: Code,
  "git-merge": GitMerge,
  "grid-3x3": Grid3x3,
  swords: Swords,
  crown: Crown,
  "wand-2": Wand2,
  compass: Compass,
  map: Map,
  flame: Flame,
  calendar: Calendar,
  calculator: Calculator,
  type: Type,
```

**Step 2: Verify no errors**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/Icon.tsx
git commit -m "feat(games): add game-related icons to Icon component"
```

---

### Task 1.6: Add Games to Sidebar Navigation

**Files:**
- Modify: `src/components/dashboard/Sidebar.tsx`
- Modify: `src/lib/constants/visibility-defaults.ts`

**Step 1: Add Gamepad2 import to Sidebar**

In `src/components/dashboard/Sidebar.tsx`, add to imports:

```typescript
import { Gamepad2 } from "lucide-react";
```

**Step 2: Add games nav item**

Find the `navItems` array and add after "יוצאים לדרך":

```typescript
  { label: "משחקים", href: "/games", roles: ["admin", "student"], icon: Gamepad2 },
```

**Step 3: Update visibility defaults**

In `src/lib/constants/visibility-defaults.ts`, add to `ALL_DASHBOARD_CARDS`:

```typescript
  games: { label: "משחקים", description: "משחקי STEM חינוכיים" },
```

Add to `ALL_SIDEBAR_LINKS`:

```typescript
  games: { defaultLabel: "משחקים", href: "/games" },
```

Add to `DEFAULT_STUDENT_DASHBOARD.cards`:

```typescript
    { id: "games", visible: true, order: 4, description: "משחקי STEM חינוכיים" },
```

Add to `DEFAULT_STUDENT_SIDEBAR.links`:

```typescript
    { id: "games", visible: true },
```

**Step 4: Verify no errors**

Run: `npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx src/lib/constants/visibility-defaults.ts
git commit -m "feat(games): add games to sidebar navigation and visibility config"
```

---

### Task 1.7: Games Hub Page with Category Cards

**Files:**
- Create: `src/app/(dashboard)/[role]/games/page.tsx`
- Create: `src/components/games/CategoryCard.tsx`
- Create: `src/components/games/CategoryModal.tsx`
- Create: `src/components/games/BadgeShelf.tsx`

**Step 1: Create CategoryCard component**

Create `src/components/games/CategoryCard.tsx`:

```typescript
"use client";

import { Icon } from "@/components/ui/Icon";
import { GAME_INFO } from "@/lib/constants/games";
import type { CategoryInfo } from "@/types/games";

interface CategoryCardProps {
  category: CategoryInfo;
  onClick: () => void;
}

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: "from-amber-400/20 to-yellow-500/20", border: "border-amber-400/30", text: "text-amber-600" },
  violet: { bg: "from-violet-400/20 to-purple-500/20", border: "border-violet-400/30", text: "text-violet-600" },
  cyan: { bg: "from-cyan-400/20 to-teal-500/20", border: "border-cyan-400/30", text: "text-cyan-600" },
  orange: { bg: "from-orange-400/20 to-red-500/20", border: "border-orange-400/30", text: "text-orange-600" },
  pink: { bg: "from-pink-400/20 to-rose-500/20", border: "border-pink-400/30", text: "text-pink-600" },
  indigo: { bg: "from-indigo-400/20 to-blue-500/20", border: "border-indigo-400/30", text: "text-indigo-600" },
};

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const colors = colorClasses[category.color] || colorClasses.amber;
  const gameCount = category.games.length;

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border-2 ${colors.border}
        bg-gradient-to-br ${colors.bg} backdrop-blur-sm
        p-6 text-center transition-all duration-300
        hover:scale-105 hover:shadow-xl hover:shadow-${category.color}-500/20
        focus:outline-none focus:ring-2 focus:ring-${category.color}-500/50
        group cursor-pointer
      `}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className={`w-full h-full bg-${category.color}-500/10`} />
      </div>

      {/* Icon */}
      <div className={`
        mx-auto mb-4 w-16 h-16 rounded-full
        bg-white/50 flex items-center justify-center
        group-hover:scale-110 transition-transform duration-300
        ${colors.text}
      `}>
        <Icon name={category.icon as any} size={32} />
      </div>

      {/* Name */}
      <h3 className="text-xl font-rubik font-bold text-gray-800 mb-2">
        {category.nameHe}
      </h3>

      {/* Game count */}
      <p className="text-sm text-gray-600">
        {gameCount} {gameCount === 1 ? "משחק" : "משחקים"}
      </p>

      {/* Mini game icons */}
      <div className="flex justify-center gap-2 mt-4">
        {category.games.slice(0, 3).map((gameType) => (
          <div
            key={gameType}
            className={`w-8 h-8 rounded-full bg-white/60 flex items-center justify-center ${colors.text}`}
          >
            <Icon name={GAME_INFO[gameType].icon as any} size={16} />
          </div>
        ))}
      </div>
    </button>
  );
}
```

**Step 2: Create CategoryModal component**

Create `src/components/games/CategoryModal.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { GAME_INFO } from "@/lib/constants/games";
import type { CategoryInfo, GameType } from "@/types/games";

interface CategoryModalProps {
  category: CategoryInfo | null;
  onClose: () => void;
}

const colorClasses: Record<string, { bg: string; border: string; text: string; button: string }> = {
  amber: { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", text: "text-amber-700", button: "bg-amber-500 hover:bg-amber-600" },
  violet: { bg: "from-violet-50 to-purple-50", border: "border-violet-200", text: "text-violet-700", button: "bg-violet-500 hover:bg-violet-600" },
  cyan: { bg: "from-cyan-50 to-teal-50", border: "border-cyan-200", text: "text-cyan-700", button: "bg-cyan-500 hover:bg-cyan-600" },
  orange: { bg: "from-orange-50 to-red-50", border: "border-orange-200", text: "text-orange-700", button: "bg-orange-500 hover:bg-orange-600" },
  pink: { bg: "from-pink-50 to-rose-50", border: "border-pink-200", text: "text-pink-700", button: "bg-pink-500 hover:bg-pink-600" },
  indigo: { bg: "from-indigo-50 to-blue-50", border: "border-indigo-200", text: "text-indigo-700", button: "bg-indigo-500 hover:bg-indigo-600" },
};

export function CategoryModal({ category, onClose }: CategoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (category) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [category]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!category) return null;

  const colors = colorClasses[category.color] || colorClasses.amber;

  const handleGameClick = (gameType: GameType) => {
    onClose();
    router.push(`/${role}/games/${gameType}`);
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-2xl w-full shadow-2xl animate-scale-in border-0"
      onClose={onClose}
    >
      <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl overflow-hidden`} dir="rtl">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-white/80 flex items-center justify-center ${colors.text}`}>
              <Icon name={category.icon as any} size={24} />
            </div>
            <h2 className="text-2xl font-rubik font-bold text-gray-800">
              {category.nameHe}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg cursor-pointer"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>

        {/* Games Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {category.games.map((gameType) => {
            const game = GAME_INFO[gameType];
            return (
              <button
                key={gameType}
                onClick={() => handleGameClick(gameType)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl
                  bg-white/70 border-2 ${colors.border}
                  hover:bg-white hover:shadow-lg transition-all duration-200
                  text-right cursor-pointer
                `}
              >
                <div className={`w-14 h-14 rounded-xl ${colors.button} flex items-center justify-center text-white flex-shrink-0`}>
                  <Icon name={game.icon as any} size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-bold text-gray-800 text-lg">
                    {game.nameHe}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    {game.hasHeadToHead && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        ראש בראש
                      </span>
                    )}
                    {game.defaultTimer && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        עם טיימר
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
```

**Step 3: Create BadgeShelf component**

Create `src/components/games/BadgeShelf.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { BADGE_DEFINITIONS } from "@/lib/constants/games";
import type { PlayerBadges } from "@/types/games";

interface BadgeShelfProps {
  playerBadges: PlayerBadges | null;
  isLoading: boolean;
}

export function BadgeShelf({ playerBadges, isLoading }: BadgeShelfProps) {
  const [showAllModal, setShowAllModal] = useState(false);

  const earnedBadgeIds = new Set(playerBadges?.badges.map((b) => b.id) || []);
  const earnedCount = earnedBadgeIds.size;
  const totalCount = BADGE_DEFINITIONS.length;

  // Show first 5 earned badges, or first 5 badges if none earned
  const displayBadges = BADGE_DEFINITIONS.filter((b) => earnedBadgeIds.has(b.id)).slice(0, 5);
  const remainingSlots = 5 - displayBadges.length;
  const lockedBadges = BADGE_DEFINITIONS.filter((b) => !earnedBadgeIds.has(b.id)).slice(0, remainingSlots);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-3" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="trophy" size={20} className="text-amber-500" />
            <h2 className="font-rubik font-bold text-gray-800">ההישגים שלי</h2>
          </div>
          <button
            onClick={() => setShowAllModal(true)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {earnedCount}/{totalCount} הישגים
            <span className="mr-1">←</span>
          </button>
        </div>

        <div className="flex gap-3">
          {displayBadges.map((badge) => (
            <div
              key={badge.id}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-md"
              title={badge.nameHe}
            >
              <Icon name={badge.icon as any} size={24} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <Icon name="check" size={12} className="text-white" />
              </div>
            </div>
          ))}
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"
              title={badge.nameHe}
            >
              <Icon name={badge.icon as any} size={24} />
            </div>
          ))}
        </div>
      </div>

      {/* All Badges Modal */}
      {showAllModal && (
        <dialog
          open
          className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 max-w-2xl w-full shadow-2xl border-0"
          onClick={(e) => e.target === e.currentTarget && setShowAllModal(false)}
        >
          <div className="bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-rubik font-bold">כל ההישגים</h2>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {(["starter", "mastery", "streak", "headToHead"] as const).map((category) => {
                const categoryBadges = BADGE_DEFINITIONS.filter((b) => b.category === category);
                const categoryNames = {
                  starter: "התחלה",
                  mastery: "מומחיות",
                  streak: "רצף",
                  headToHead: "ראש בראש",
                };
                return (
                  <div key={category} className="mb-6">
                    <h3 className="font-bold text-gray-600 mb-3">{categoryNames[category]}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categoryBadges.map((badge) => {
                        const isEarned = earnedBadgeIds.has(badge.id);
                        return (
                          <div
                            key={badge.id}
                            className={`
                              flex items-center gap-3 p-3 rounded-xl border
                              ${isEarned ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}
                            `}
                          >
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              ${isEarned
                                ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
                                : "bg-gray-200 text-gray-400"}
                            `}>
                              <Icon name={badge.icon as any} size={20} />
                            </div>
                            <div>
                              <div className={`font-medium ${isEarned ? "text-gray-800" : "text-gray-500"}`}>
                                {badge.nameHe}
                              </div>
                              <div className="text-xs text-gray-500">
                                {badge.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
```

**Step 4: Create Games Hub page**

Create `src/app/(dashboard)/[role]/games/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerBadges } from "@/lib/queries/games";
import { GAME_CATEGORIES } from "@/lib/constants/games";
import { CategoryCard } from "@/components/games/CategoryCard";
import { CategoryModal } from "@/components/games/CategoryModal";
import { BadgeShelf } from "@/components/games/BadgeShelf";
import { Icon } from "@/components/ui/Icon";
import type { CategoryInfo } from "@/types/games";
import type { UserRole } from "@/types";

export default function GamesHubPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);

  const urlRole = params.role as UserRole;

  // Role validation
  useEffect(() => {
    if (!session) return;

    const allowedRoles = ["admin", "student"];
    if (!allowedRoles.includes(session.user.role)) {
      router.replace(`/${session.user.role}`);
      return;
    }

    if (urlRole !== session.user.role) {
      router.replace(`/${session.user.role}/games`);
    }
  }, [session, urlRole, router]);

  // Get visitor ID for badges (using session password as unique ID)
  const visitorId = session?.password || null;
  const visitorGrade = session?.user.grade || null;

  const { data: playerBadges, isLoading: badgesLoading } = usePlayerBadges(
    visitorId,
    visitorGrade
  );

  if (!session) {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-pulse" dir="rtl">
        <div className="h-10 bg-gray-200 rounded w-48 mb-6" />
        <div className="h-24 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <Icon name="gamepad-2" size={24} />
        </div>
        <h1 className="text-3xl font-rubik font-bold text-gray-800">
          משחקי STEM
        </h1>
      </div>

      {/* Badge Shelf */}
      <div className="mb-8">
        <BadgeShelf playerBadges={playerBadges || null} isLoading={badgesLoading} />
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>

      {/* Category Modal */}
      <CategoryModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  );
}
```

**Step 5: Verify no errors**

Run: `npm run dev`
Navigate to `/student/games`
Expected: See 6 category cards, badge shelf, clicking opens modal

**Step 6: Commit**

```bash
git add src/app/\(dashboard\)/\[role\]/games/page.tsx src/components/games/
git commit -m "feat(games): add Games Hub page with category cards and badge shelf"
```

---

### Task 1.8: Full-Screen Game Layout Component

**Files:**
- Create: `src/components/games/GameLayout.tsx`
- Create: `src/app/(dashboard)/[role]/games/[gameType]/page.tsx`

**Step 1: Create GameLayout component**

Create `src/components/games/GameLayout.tsx`:

```typescript
"use client";

import { useRouter, useParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { GameType, Difficulty, GameSession } from "@/types/games";

interface GameLayoutProps {
  gameType: GameType;
  children: React.ReactNode;
  session: GameSession;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  timerEnabled: boolean;
  onTimerToggle: () => void;
  onHeadToHead?: () => void;
  timeRemaining?: number;
}

export function GameLayout({
  gameType,
  children,
  session,
  difficulty,
  onDifficultyChange,
  timerEnabled,
  onTimerToggle,
  onHeadToHead,
  timeRemaining,
}: GameLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;
  const gameInfo = GAME_INFO[gameType];

  const handleBack = () => {
    router.push(`/${role}/games`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
        {/* Left: Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Icon name="arrow-right" size={20} />
          <span className="font-medium">חזרה</span>
        </button>

        {/* Center: Game title & score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name={gameInfo.icon as any} size={24} className="text-emerald-600" />
            <h1 className="text-xl font-rubik font-bold">{gameInfo.nameHe}</h1>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-lg font-medium">
            <Icon name="star" size={20} className="text-amber-500" />
            <span>{session.score}</span>
          </div>
          {session.totalQuestions > 0 && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-gray-600">
                {session.currentQuestion}/{session.totalQuestions}
              </span>
            </>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Timer display */}
          {timerEnabled && timeRemaining !== undefined && (
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg
              ${timeRemaining <= 10 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}
            `}>
              <Icon name="clock" size={18} />
              <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}</span>
            </div>
          )}

          {/* Difficulty selector */}
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            className="px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>

          {/* Timer toggle (for non-racing games) */}
          {!gameInfo.defaultTimer && (
            <button
              onClick={onTimerToggle}
              className={`
                p-2 rounded-lg transition-colors
                ${timerEnabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}
              `}
              title={timerEnabled ? "כבה טיימר" : "הפעל טיימר"}
            >
              <Icon name="clock" size={20} />
            </button>
          )}

          {/* Head-to-head button */}
          {gameInfo.hasHeadToHead && onHeadToHead && (
            <button
              onClick={onHeadToHead}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <Icon name="swords" size={20} />
              <span>ראש בראש</span>
            </button>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Create game page placeholder**

Create `src/app/(dashboard)/[role]/games/[gameType]/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GameLayout } from "@/components/games/GameLayout";
import { GAME_INFO } from "@/lib/constants/games";
import { Icon } from "@/components/ui/Icon";
import type { GameType, Difficulty, GameSession } from "@/types/games";
import type { UserRole } from "@/types";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();

  const urlRole = params.role as UserRole;
  const gameType = params.gameType as GameType;

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession>({
    gameType,
    difficulty: "easy",
    currentQuestion: 0,
    totalQuestions: 0,
    score: 0,
    startTime: new Date(),
    timerEnabled: false,
    isHeadToHead: false,
  });

  // Role validation
  useEffect(() => {
    if (!session) return;

    const allowedRoles = ["admin", "student"];
    if (!allowedRoles.includes(session.user.role)) {
      router.replace(`/${session.user.role}`);
      return;
    }

    if (urlRole !== session.user.role) {
      router.replace(`/${session.user.role}/games/${gameType}`);
    }
  }, [session, urlRole, router, gameType]);

  // Validate game type
  useEffect(() => {
    if (gameType && !GAME_INFO[gameType]) {
      router.replace(`/${urlRole}/games`);
    }
  }, [gameType, urlRole, router]);

  const gameInfo = GAME_INFO[gameType];

  if (!session || !gameInfo) {
    return (
      <div className="fixed inset-0 bg-emerald-50 flex items-center justify-center">
        <div className="animate-spin">
          <Icon name="loader-2" size={48} className="text-emerald-500" />
        </div>
      </div>
    );
  }

  // Initialize timer for racing games
  useEffect(() => {
    if (gameInfo.defaultTimer) {
      setTimerEnabled(true);
    }
  }, [gameInfo.defaultTimer]);

  const handleHeadToHead = () => {
    // TODO: Implement head-to-head logic
    console.log("Head-to-head clicked");
  };

  return (
    <GameLayout
      gameType={gameType}
      session={gameSession}
      difficulty={difficulty}
      onDifficultyChange={setDifficulty}
      timerEnabled={timerEnabled}
      onTimerToggle={() => setTimerEnabled(!timerEnabled)}
      onHeadToHead={gameInfo.hasHeadToHead ? handleHeadToHead : undefined}
      timeRemaining={timerEnabled ? 300 : undefined}
    >
      {/* Placeholder - will be replaced with actual game components */}
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <Icon name={gameInfo.icon as any} size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-rubik font-bold mb-4">{gameInfo.nameHe}</h2>
        <p className="text-gray-600 mb-6">
          המשחק בבנייה - בקרוב!
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Icon name="construction" size={16} />
          <span>רמת קושי: {DIFFICULTY_LABELS[difficulty]}</span>
        </div>
      </div>
    </GameLayout>
  );
}
```

**Step 3: Verify no errors**

Run: `npm run dev`
Navigate to `/student/games/hangman`
Expected: See full-screen game layout with placeholder

**Step 4: Commit**

```bash
git add src/components/games/GameLayout.tsx src/app/\(dashboard\)/\[role\]/games/\[gameType\]/page.tsx
git commit -m "feat(games): add full-screen game layout and game page placeholder"
```

---

### Task 1.9: Admin Panel for Game Content

**Files:**
- Create: `src/app/(dashboard)/[role]/games/admin/page.tsx`
- Create: `src/components/games/admin/GameContentTable.tsx`
- Create: `src/components/games/admin/GameContentForm.tsx`

**Step 1: Create GameContentTable component**

Create `src/components/games/admin/GameContentTable.tsx`:

```typescript
"use client";

import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { GameContent, GameType, Difficulty } from "@/types/games";
import type { Grade } from "@/types";

interface GameContentTableProps {
  content: GameContent[];
  isLoading: boolean;
  onEdit: (item: GameContent) => void;
  onDelete: (id: string) => void;
  filters: {
    gameType: GameType | "";
    grade: Grade | "";
    difficulty: Difficulty | "";
  };
  onFilterChange: (key: string, value: string) => void;
}

export function GameContentTable({
  content,
  isLoading,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
}: GameContentTableProps) {
  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={filters.gameType}
          onChange={(e) => onFilterChange("gameType", e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">כל המשחקים</option>
          {Object.entries(GAME_INFO).map(([type, info]) => (
            <option key={type} value={type}>{info.nameHe}</option>
          ))}
        </select>

        <select
          value={filters.grade}
          onChange={(e) => onFilterChange("grade", e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">כל הכיתות</option>
          {grades.map((g) => (
            <option key={g} value={g}>כיתה {g}</option>
          ))}
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => onFilterChange("difficulty", e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">כל הרמות</option>
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-600">משחק</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">כיתה</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">רמה</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">תאריך</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {content.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  אין תוכן להצגה
                </td>
              </tr>
            ) : (
              content.map((item) => {
                const gameInfo = GAME_INFO[item.gameType];
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon name={gameInfo.icon as any} size={20} className="text-gray-500" />
                        <span>{gameInfo.nameHe}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.grade}</td>
                    <td className="px-4 py-3">{DIFFICULTY_LABELS[item.difficulty]}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.createdAt?.toLocaleDateString("he-IL")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Icon name="pencil" size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Icon name="trash-2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 2: Create GameContentForm component**

Create `src/components/games/admin/GameContentForm.tsx`:

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { GameContent, GameType, Difficulty, HangmanContent, QuizContent } from "@/types/games";
import type { Grade } from "@/types";

interface GameContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<GameContent, "id" | "createdAt" | "updatedAt">) => void;
  editItem: GameContent | null;
  isLoading: boolean;
}

export function GameContentForm({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  isLoading,
}: GameContentFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

  const [gameType, setGameType] = useState<GameType>("hangman");
  const [grade, setGrade] = useState<Grade>("א");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  // Hangman fields
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [category, setCategory] = useState("");

  // Quiz fields
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editItem) {
      setGameType(editItem.gameType);
      setGrade(editItem.grade);
      setDifficulty(editItem.difficulty);

      if (editItem.gameType === "hangman") {
        const content = (editItem as HangmanContent).content;
        setWord(content.word);
        setHint(content.hint);
        setCategory(content.category);
      } else if (editItem.gameType === "quiz") {
        const content = (editItem as QuizContent).content;
        setQuestion(content.question);
        setOptions(content.options);
        setCorrectIndex(content.correctIndex);
        setExplanation(content.explanation);
      }
    } else {
      // Reset form
      setWord("");
      setHint("");
      setCategory("");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      setExplanation("");
    }
  }, [editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let content: any;
    if (gameType === "hangman") {
      content = { word, hint, category };
    } else if (gameType === "quiz") {
      content = { question, options, correctIndex, explanation };
    } else {
      content = {};
    }

    onSubmit({
      gameType,
      grade,
      difficulty,
      content,
    } as Omit<GameContent, "id" | "createdAt" | "updatedAt">);
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 max-w-2xl w-full shadow-2xl border-0 max-h-[90vh] overflow-hidden"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-rubik font-bold">
            {editItem ? "עריכת תוכן" : "הוספת תוכן חדש"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Base fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">סוג משחק</label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!!editItem}
              >
                {Object.entries(GAME_INFO).map(([type, info]) => (
                  <option key={type} value={type}>{info.nameHe}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">כיתה</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>כיתה {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">רמת קושי</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Game-specific fields */}
          {gameType === "hangman" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">מילה</label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">רמז</label>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">קטגוריה</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="לדוגמה: בעלי חיים, מדע, חלל"
                  required
                />
              </div>
            </>
          )}

          {gameType === "quiz" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">שאלה</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תשובות</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder={`תשובה ${idx + 1}`}
                      required
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500">סמן את התשובה הנכונה</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">הסבר</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="הסבר שיוצג אחרי התשובה"
                />
              </div>
            </>
          )}

          {!["hangman", "quiz"].includes(gameType) && (
            <div className="p-4 bg-amber-50 rounded-lg text-amber-800">
              <p>טופס עריכה למשחק זה עדיין בפיתוח.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" loading={isLoading}>
              {editItem ? "שמור שינויים" : "הוסף תוכן"}
            </Button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
```

**Step 3: Create Admin Games page**

Create `src/app/(dashboard)/[role]/games/admin/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAllGameContent,
  useCreateGameContent,
  useUpdateGameContent,
  useDeleteGameContent,
} from "@/lib/queries/games";
import { GameContentTable } from "@/components/games/admin/GameContentTable";
import { GameContentForm } from "@/components/games/admin/GameContentForm";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { GameContent, GameType, Difficulty } from "@/types/games";
import type { Grade, UserRole } from "@/types";

export default function AdminGamesPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const { addToast } = useToast();

  const urlRole = params.role as UserRole;

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<GameContent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    gameType: GameType | "";
    grade: Grade | "";
    difficulty: Difficulty | "";
  }>({
    gameType: "",
    grade: "",
    difficulty: "",
  });

  // Admin-only page
  useEffect(() => {
    if (!session) return;

    if (session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
      return;
    }

    if (urlRole !== "admin") {
      router.replace("/admin/games/admin");
    }
  }, [session, urlRole, router]);

  const { data: content = [], isLoading } = useAllGameContent(
    filters.gameType || undefined,
    filters.grade || undefined
  );

  const createMutation = useCreateGameContent();
  const updateMutation = useUpdateGameContent();
  const deleteMutation = useDeleteGameContent();

  // Filter by difficulty client-side
  const filteredContent = filters.difficulty
    ? content.filter((c) => c.difficulty === filters.difficulty)
    : content;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (item: GameContent) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      addToast("תוכן | נמחק בהצלחה", "success");
    } catch {
      addToast("תוכן | שגיאה במחיקה", "error");
    }
    setDeleteId(null);
  };

  const handleSubmit = async (data: Omit<GameContent, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data });
        addToast("תוכן | עודכן בהצלחה", "success");
      } else {
        await createMutation.mutateAsync(data);
        addToast("תוכן | נוסף בהצלחה", "success");
      }
      setShowForm(false);
      setEditItem(null);
    } catch {
      addToast("תוכן | שגיאה בשמירה", "error");
    }
  };

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="gamepad-2" size={28} className="text-indigo-600" />
          <h1 className="text-2xl font-rubik font-bold">ניהול משחקים</h1>
        </div>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Icon name="plus" size={20} />
          הוסף תוכן
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-indigo-600">{content.length}</div>
          <div className="text-sm text-gray-600">פריטי תוכן</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-emerald-600">
            {new Set(content.map((c) => c.gameType)).size}
          </div>
          <div className="text-sm text-gray-600">סוגי משחקים</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-amber-600">
            {new Set(content.map((c) => c.grade)).size}
          </div>
          <div className="text-sm text-gray-600">כיתות</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">משחקים זמינים</div>
        </div>
      </div>

      {/* Table */}
      <GameContentTable
        content={filteredContent}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Form Modal */}
      <GameContentForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        editItem={editItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="מחיקת תוכן"
        message="האם אתה בטוח שברצונך למחוק תוכן זה? פעולה זו אינה ניתנת לביטול."
        confirmText="מחק"
        variant="danger"
      />
    </div>
  );
}
```

**Step 4: Add admin link to sidebar**

In `src/components/dashboard/Sidebar.tsx`, add to navItems (for admin only):

```typescript
  { label: "ניהול משחקים", href: "/games/admin", roles: ["admin"], icon: Gamepad2 },
```

**Step 5: Verify no errors**

Run: `npm run dev`
Navigate to `/admin/games/admin`
Expected: See admin panel with table, filters, add button

**Step 6: Commit**

```bash
git add src/app/\(dashboard\)/\[role\]/games/admin/page.tsx src/components/games/admin/ src/components/dashboard/Sidebar.tsx
git commit -m "feat(games): add admin panel for game content management"
```

---

### Task 1.10: Phase 1 Code Review

**Action:** Run code-reviewer agent

```bash
# Use code-reviewer agent to review all Phase 1 changes
```

Review checklist:
- [ ] All types properly defined
- [ ] Services handle errors correctly
- [ ] React Query hooks follow patterns
- [ ] Components are accessible (ARIA)
- [ ] RTL layout correct
- [ ] No TypeScript errors
- [ ] Theme utilities used correctly

**After code review passes:**

```bash
git add -A
git commit -m "chore(games): Phase 1 infrastructure complete - ready for games implementation"
```

---

## 🛑 CHECKPOINT: User Approval Required

**Phase 1 Infrastructure Complete!**

Before proceeding to Phase 2 (building games), wait for user to:
1. Test the games hub at `/student/games`
2. Test admin panel at `/admin/games/admin`
3. Confirm everything works as expected
4. Give approval to proceed with games

---

## Phase 2: Games (Easiest to Hardest)

Each game follows this pattern:
1. Build the game component
2. Run code-reviewer
3. **Wait for user testing and approval**
4. Proceed to next game

---

### Task 2.1: Hangman Game

**Files:**
- Create: `src/components/games/hangman/HangmanGame.tsx`
- Create: `src/components/games/hangman/HangmanKeyboard.tsx`
- Create: `src/components/games/hangman/HangmanFigure.tsx`
- Modify: `src/app/(dashboard)/[role]/games/[gameType]/page.tsx`

*[Detailed implementation steps for Hangman...]*

---

### Task 2.2: Word Search Game

*[Implementation details...]*

---

### Task 2.3: Memory Cards Game

*[Implementation details...]*

---

### Task 2.4: STEM Quiz Game (+ Head-to-Head)

*[Implementation details...]*

---

### Task 2.5: Sort It Out Game

*[Implementation details...]*

---

### Task 2.6: Number Patterns Game

*[Implementation details...]*

---

### Task 2.7: Math Race Game (+ Head-to-Head)

*[Implementation details...]*

---

### Task 2.8: Pattern Recognition Game

*[Implementation details...]*

---

### Task 2.9: Coding Puzzles Game

*[Implementation details...]*

---

### Task 2.10: Tangram Game

*[Implementation details...]*

---

### Task 2.11: Virtual Lab Game

*[Implementation details...]*

---

### Task 2.12: Build a Bridge Game

*[Implementation details...]*

---

## Summary

**Phase 1 (Infrastructure):** 9 tasks
- Types, constants, services, hooks, icons, sidebar, hub page, game layout, admin panel

**Phase 2 (Games):** 12 tasks
- Each game built individually, reviewed, and approved before next

**Total:** 21 tasks

**Checkpoints:**
- After Phase 1: User approval required
- After each game: User testing and approval required
