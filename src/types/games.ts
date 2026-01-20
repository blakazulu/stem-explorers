import type { Grade } from "./index";

// ============================================================
// Game Type Identifiers
// ============================================================

/** All available game types in the Games Hub */
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

/** Difficulty levels for games */
export type Difficulty = "easy" | "medium" | "hard";

/** Categories for organizing games */
export type GameCategory = "quiz" | "memory" | "logic" | "math" | "words" | "build";

// ============================================================
// Category Configuration
// ============================================================

/** Configuration for a game category */
export interface CategoryInfo {
  id: GameCategory;
  nameHe: string;
  icon: string;
  color: string;
  pattern: string;
  games: GameType[];
}

// ============================================================
// Game Content Types
// ============================================================

/** Base interface for all game content */
export interface GameContentBase {
  id: string;
  gameType: GameType;
  grade: Grade;
  difficulty: Difficulty;
  createdAt: Date;
  updatedAt: Date;
}

/** Quiz game - multiple choice questions */
export interface QuizContent extends GameContentBase {
  gameType: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Memory matching pairs */
export interface MemoryPair {
  term: string;
  match: string;
  imageUrl?: string;
}

/** Memory game - match term/definition pairs */
export interface MemoryContent extends GameContentBase {
  gameType: "memory";
  pairs: MemoryPair[];
}

/** Item for sorting game */
export interface SortItem {
  text: string;
  correctBucket: string;
}

/** Sort game - categorize items into buckets */
export interface SortContent extends GameContentBase {
  gameType: "sort";
  buckets: string[];
  items: SortItem[];
}

/** Pattern recognition game */
export interface PatternContent extends GameContentBase {
  gameType: "pattern";
  sequence: string[];
  options: string[];
  correctIndex: number;
  rule: string;
}

/** Obstacle in coding game grid */
export interface CodingObstacle {
  x: number;
  y: number;
}

/** Coding game - visual programming */
export interface CodingContent extends GameContentBase {
  gameType: "coding";
  gridSize: number;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  obstacles: CodingObstacle[];
  maxMoves: number;
  allowLoops: boolean;
  allowConditionals: boolean;
}

/** Tangram piece definition */
export interface TangramPiece {
  type: string;
  color: string;
  initialPosition: { x: number; y: number };
  initialRotation: number;
}

/** Tangram game - shape building */
export interface TangramContent extends GameContentBase {
  gameType: "tangram";
  targetShape: string;
  pieces: TangramPiece[];
}

/** Math race game - speed math */
export interface MathRaceContent extends GameContentBase {
  gameType: "mathRace";
  problem: string;
  answer: number;
  options: number[];
}

/** Number pattern game - find missing number */
export interface NumberPatternContent extends GameContentBase {
  gameType: "numberPattern";
  sequence: (number | null)[];
  answer: number;
  rule: string;
}

/** Word search game */
export interface WordSearchContent extends GameContentBase {
  gameType: "wordSearch";
  words: string[];
  gridSize: number;
  directions: ("horizontal" | "vertical" | "diagonal")[];
}

/** Hangman game */
export interface HangmanContent extends GameContentBase {
  gameType: "hangman";
  word: string;
  hint: string;
  category: string;
}

/** Experiment step */
export interface ExperimentStep {
  instruction: string;
  imageUrl?: string;
}

/** Experiment simulation game */
export interface ExperimentContent extends GameContentBase {
  gameType: "experiment";
  title: string;
  hypothesisPrompt: string;
  steps: ExperimentStep[];
  conclusion: string;
  imageUrl?: string;
}

/** Bridge building material */
export interface BridgeMaterial {
  type: string;
  cost: number;
  strength: number;
}

/** Bridge building game */
export interface BridgeContent extends GameContentBase {
  gameType: "bridge";
  gapWidth: number;
  budget: number;
  materials: BridgeMaterial[];
  vehicleWeight: number;
}

/** Union of all game content types */
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

// ============================================================
// Player Progress & Stats
// ============================================================

/** Game-specific statistics */
export interface GameStats {
  averageScore: number;
  bestTime?: number;
  totalCorrect: number;
  totalAttempts: number;
}

/** Player progress for a specific game type */
export interface GameProgress {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorGrade: Grade;
  gameType: GameType;
  highScore: number;
  gamesPlayed: number;
  lastPlayed: Date;
  stats: GameStats;
}

// ============================================================
// Badges & Achievements
// ============================================================

/** Badge award criteria */
export interface BadgeCriteria {
  type: "score" | "games_played" | "streak" | "perfect" | "speed" | "category_mastery";
  threshold: number;
  gameType?: GameType;
  category?: GameCategory;
}

/** Badge definition */
export interface BadgeDefinition {
  id: string;
  nameHe: string;
  description: string;
  icon: string;
  category: GameCategory | "general";
  criteria: BadgeCriteria;
}

/** Earned badge record */
export interface EarnedBadge {
  badgeId: string;
  earnedAt: Date;
}

/** Player's badge collection */
export interface PlayerBadges {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorGrade: Grade;
  badges: EarnedBadge[];
  streakDays: number;
  lastPlayDate: Date;
}

// ============================================================
// Head-to-Head Challenges
// ============================================================

/** Player info in a challenge */
export interface ChallengePlayer {
  visitorId: string;
  visitorName: string;
  score: number;
  completedAt?: Date;
}

/** Challenge status */
export type ChallengeStatus = "pending" | "active" | "completed" | "expired";

/** Head-to-head challenge between two players */
export interface HeadToHeadChallenge {
  id: string;
  visitorGrade: Grade;
  gameType: GameType;
  status: ChallengeStatus;
  player1: ChallengePlayer;
  player2: ChallengePlayer | null;
  contentIds: string[];
  createdAt: Date;
  expiresAt: Date;
}

// ============================================================
// Game Session
// ============================================================

/** Active game session state */
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
