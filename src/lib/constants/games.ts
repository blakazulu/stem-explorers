import type {
  CategoryInfo,
  GameType,
  BadgeDefinition,
  Difficulty,
} from "@/types/games";

// ============================================================
// Game Categories
// ============================================================

/** All game categories with their metadata */
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

// ============================================================
// Game Info
// ============================================================

/** Metadata for each game type */
export const GAME_INFO: Record<
  GameType,
  {
    nameHe: string;
    icon: string;
    hasHeadToHead: boolean;
    defaultTimer: boolean;
  }
> = {
  quiz: {
    nameHe: "חידון STEM",
    icon: "help-circle",
    hasHeadToHead: true,
    defaultTimer: true,
  },
  memory: {
    nameHe: "משחק זיכרון",
    icon: "grid-3x3",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  sort: {
    nameHe: "מיון וסיווג",
    icon: "git-merge",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  pattern: {
    nameHe: "זיהוי תבניות",
    icon: "workflow",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  coding: {
    nameHe: "חידות תכנות",
    icon: "code",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  tangram: {
    nameHe: "טנגרם",
    icon: "shapes",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  mathRace: {
    nameHe: "מרוץ חשבון",
    icon: "zap",
    hasHeadToHead: true,
    defaultTimer: true,
  },
  numberPattern: {
    nameHe: "סדרות מספרים",
    icon: "hash",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  wordSearch: {
    nameHe: "חיפוש מילים",
    icon: "search",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  hangman: {
    nameHe: "איש תלוי",
    icon: "user",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  experiment: {
    nameHe: "מעבדה וירטואלית",
    icon: "flask",
    hasHeadToHead: false,
    defaultTimer: false,
  },
  bridge: {
    nameHe: "בנה גשר",
    icon: "construction",
    hasHeadToHead: false,
    defaultTimer: false,
  },
};

// ============================================================
// Badge Definitions
// ============================================================

/** All badge definitions organized by category */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Starter badges (3)
  {
    id: "first_game",
    nameHe: "צעדים ראשונים",
    description: "שיחקת את המשחק הראשון שלך",
    icon: "star",
    category: "general",
    criteria: { type: "games_played", threshold: 1 },
  },
  {
    id: "explorer",
    nameHe: "חוקר",
    description: "שיחקת 3 משחקים",
    icon: "compass",
    category: "general",
    criteria: { type: "games_played", threshold: 3 },
  },
  {
    id: "adventurer",
    nameHe: "הרפתקן",
    description: "שיחקת 12 משחקים",
    icon: "map",
    category: "general",
    criteria: { type: "games_played", threshold: 12 },
  },

  // Mastery badges (7)
  {
    id: "quiz_master",
    nameHe: "אלוף החידונים",
    description: "השגת ניקוד של 100 בחידון",
    icon: "trophy",
    category: "quiz",
    criteria: { type: "score", threshold: 100, gameType: "quiz" },
  },
  {
    id: "memory_master",
    nameHe: "מלך הזיכרון",
    description: "סיימת משחק זיכרון בהצלחה",
    icon: "brain",
    category: "memory",
    criteria: { type: "game_specific", threshold: 1, gameType: "memory" },
  },
  {
    id: "math_champion",
    nameHe: "אלוף החשבון",
    description: "ניצחת 5 פעמים במרוץ חשבון",
    icon: "calculator",
    category: "math",
    criteria: { type: "wins", threshold: 5, gameType: "mathRace" },
  },
  {
    id: "code_ninja",
    nameHe: "נינג'ת הקוד",
    description: "פתרת 10 חידות תכנות",
    icon: "code",
    category: "logic",
    criteria: { type: "game_specific", threshold: 10, gameType: "coding" },
  },
  {
    id: "word_wizard",
    nameHe: "קוסם המילים",
    description: "סיימת משחק חיפוש מילים",
    icon: "wand-2",
    category: "words",
    criteria: { type: "game_specific", threshold: 1, gameType: "wordSearch" },
  },
  {
    id: "bridge_builder",
    nameHe: "בונה גשרים",
    description: "בנית 5 גשרים בהצלחה",
    icon: "construction",
    category: "build",
    criteria: { type: "game_specific", threshold: 5, gameType: "bridge" },
  },
  {
    id: "lab_scientist",
    nameHe: "מדען מעבדה",
    description: "השלמת 5 ניסויים במעבדה",
    icon: "flask",
    category: "build",
    criteria: { type: "game_specific", threshold: 5, gameType: "experiment" },
  },

  // Streak badges (3)
  {
    id: "on_fire",
    nameHe: "בוער",
    description: "שיחקת 3 ימים ברצף",
    icon: "flame",
    category: "general",
    criteria: { type: "streak", threshold: 3 },
  },
  {
    id: "dedicated",
    nameHe: "מסור",
    description: "שיחקת 7 ימים ברצף",
    icon: "calendar",
    category: "general",
    criteria: { type: "streak", threshold: 7 },
  },
  {
    id: "unstoppable",
    nameHe: "בלתי ניתן לעצירה",
    description: "שיחקת 14 ימים ברצף",
    icon: "rocket",
    category: "general",
    criteria: { type: "streak", threshold: 14 },
  },

  // HeadToHead badges (2)
  {
    id: "challenger",
    nameHe: "מאתגר",
    description: "שיחקת משחק ראש בראש",
    icon: "swords",
    category: "general",
    criteria: { type: "games_played", threshold: 1 },
  },
  {
    id: "champion",
    nameHe: "אלוף",
    description: "ניצחת 10 משחקים ראש בראש",
    icon: "crown",
    category: "general",
    criteria: { type: "wins", threshold: 10 },
  },
];

// ============================================================
// Hebrew Language Utilities
// ============================================================

/** Hebrew alphabet letters */
export const HEBREW_ALPHABET: string[] = [
  "א",
  "ב",
  "ג",
  "ד",
  "ה",
  "ו",
  "ז",
  "ח",
  "ט",
  "י",
  "כ",
  "ל",
  "מ",
  "נ",
  "ס",
  "ע",
  "פ",
  "צ",
  "ק",
  "ר",
  "ש",
  "ת",
];

/** Mapping of regular letters to their final forms */
export const FINAL_LETTERS: Record<string, string> = {
  כ: "ך",
  מ: "ם",
  נ: "ן",
  פ: "ף",
  צ: "ץ",
};

// ============================================================
// Difficulty Labels
// ============================================================

/** Hebrew labels for difficulty levels */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "מאתגר",
};
