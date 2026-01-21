/**
 * Seed script for Pattern Recognition game content
 * Run with: npx tsx scripts/seed-pattern-content.ts
 *
 * Creates Hebrew visual pattern completion tasks for all grades (א-ו) and difficulties (easy/medium/hard)
 * 6 patterns per grade/difficulty = 108 total
 * Uses emoji/text patterns: shapes, colors, letters, numbers
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type Grade = "א" | "ב" | "ג" | "ד" | "ה" | "ו";
type Difficulty = "easy" | "medium" | "hard";

interface PatternContentData {
  sequence: string[];
  options: string[];
  correctIndex: number;
  rule: string;
}

// =============================================================================
// PATTERN CONTENT DATA
// Organized by grade, then difficulty
// Each entry has: sequence (with ? for missing), options (4 choices), correctIndex, rule
// =============================================================================

const PATTERN_CONTENT: Record<Grade, Record<Difficulty, PatternContentData[]>> = {
  // Grade א (1st grade) - Very simple ABAB, AABB patterns with emojis
  א: {
    easy: [
      {
        sequence: ["🔴", "🔵", "🔴", "🔵", "?"],
        options: ["🔴", "🔵", "🟢", "🟡"],
        correctIndex: 0,
        rule: "דפוס חוזר: אדום, כחול, אדום, כחול...",
      },
      {
        sequence: ["⭐", "⭐", "🌙", "⭐", "⭐", "?"],
        options: ["⭐", "🌙", "☀️", "🌟"],
        correctIndex: 1,
        rule: "דפוס חוזר: כוכב, כוכב, ירח...",
      },
      {
        sequence: ["🍎", "🍌", "🍎", "🍌", "?"],
        options: ["🍇", "🍎", "🍌", "🍊"],
        correctIndex: 1,
        rule: "דפוס חוזר: תפוח, בננה, תפוח, בננה...",
      },
      {
        sequence: ["❤️", "❤️", "💙", "💙", "❤️", "?"],
        options: ["💙", "❤️", "💚", "💛"],
        correctIndex: 1,
        rule: "דפוס חוזר: שני אדומים, שני כחולים...",
      },
      {
        sequence: ["🐱", "🐶", "🐱", "🐶", "?"],
        options: ["🐰", "🐱", "🐶", "🐻"],
        correctIndex: 1,
        rule: "דפוס חוזר: חתול, כלב, חתול, כלב...",
      },
      {
        sequence: ["▲", "●", "▲", "●", "?"],
        options: ["■", "▲", "●", "◆"],
        correctIndex: 1,
        rule: "דפוס חוזר: משולש, עיגול, משולש, עיגול...",
      },
    ],
    medium: [
      {
        sequence: ["🔴", "🔴", "🔵", "🔴", "🔴", "?"],
        options: ["🔴", "🔵", "🟢", "🟡"],
        correctIndex: 1,
        rule: "דפוס חוזר: שני אדומים, כחול אחד...",
      },
      {
        sequence: ["🌸", "🌸", "🌸", "🌺", "🌸", "🌸", "?"],
        options: ["🌸", "🌺", "🌻", "🌷"],
        correctIndex: 0,
        rule: "דפוס חוזר: שלוש פרחים ורודים, פרח אחד אדום...",
      },
      {
        sequence: ["1", "2", "1", "2", "1", "?"],
        options: ["1", "2", "3", "0"],
        correctIndex: 1,
        rule: "דפוס חוזר: אחד, שתיים, אחד, שתיים...",
      },
      {
        sequence: ["א", "ב", "א", "ב", "א", "?"],
        options: ["א", "ב", "ג", "ד"],
        correctIndex: 1,
        rule: "דפוס חוזר: א, ב, א, ב...",
      },
      {
        sequence: ["→", "↓", "→", "↓", "?"],
        options: ["←", "↑", "→", "↓"],
        correctIndex: 2,
        rule: "דפוס חוזר: ימינה, למטה, ימינה, למטה...",
      },
      {
        sequence: ["😊", "😊", "😢", "😊", "😊", "?"],
        options: ["😊", "😢", "😮", "😄"],
        correctIndex: 1,
        rule: "דפוס חוזר: שתי פרצופים שמחים, פרצוף עצוב...",
      },
    ],
    hard: [
      {
        sequence: ["🔴", "🔵", "🟢", "🔴", "🔵", "?"],
        options: ["🔴", "🔵", "🟢", "🟡"],
        correctIndex: 2,
        rule: "דפוס חוזר של שלושה צבעים: אדום, כחול, ירוק...",
      },
      {
        sequence: ["🌙", "⭐", "⭐", "🌙", "⭐", "?"],
        options: ["🌙", "⭐", "☀️", "🌟"],
        correctIndex: 1,
        rule: "דפוס חוזר: ירח, שני כוכבים, ירח, שני כוכבים...",
      },
      {
        sequence: ["▲", "▲", "●", "●", "▲", "?"],
        options: ["●", "▲", "■", "◆"],
        correctIndex: 1,
        rule: "דפוס חוזר: שני משולשים, שני עיגולים...",
      },
      {
        sequence: ["1", "1", "2", "1", "1", "?"],
        options: ["1", "2", "3", "0"],
        correctIndex: 1,
        rule: "דפוס חוזר: שני אחדים, שתיים אחת...",
      },
      {
        sequence: ["🐟", "🐟", "🐠", "🐟", "🐟", "?"],
        options: ["🐟", "🐠", "🐡", "🦈"],
        correctIndex: 1,
        rule: "דפוס חוזר: שני דגים כחולים, דג צבעוני אחד...",
      },
      {
        sequence: ["❄️", "☀️", "❄️", "❄️", "☀️", "?"],
        options: ["❄️", "☀️", "🌧️", "⛈️"],
        correctIndex: 0,
        rule: "דפוס חוזר: פתית שלג, שמש, שני פתיתי שלג, שמש...",
      },
    ],
  },

  // Grade ב (2nd grade) - ABC patterns, growing patterns
  ב: {
    easy: [
      {
        sequence: ["🔴", "🔵", "🟢", "🔴", "🔵", "?"],
        options: ["🔴", "🔵", "🟢", "🟡"],
        correctIndex: 2,
        rule: "דפוס חוזר של שלושה: אדום, כחול, ירוק...",
      },
      {
        sequence: ["1", "2", "3", "1", "2", "?"],
        options: ["1", "2", "3", "4"],
        correctIndex: 2,
        rule: "דפוס חוזר: 1, 2, 3, 1, 2, 3...",
      },
      {
        sequence: ["🍎", "🍊", "🍋", "🍎", "🍊", "?"],
        options: ["🍎", "🍊", "🍋", "🍇"],
        correctIndex: 2,
        rule: "דפוס חוזר של שלושה פירות: תפוח, תפוז, לימון...",
      },
      {
        sequence: ["א", "ב", "ג", "א", "ב", "?"],
        options: ["א", "ב", "ג", "ד"],
        correctIndex: 2,
        rule: "דפוס חוזר: א, ב, ג, א, ב, ג...",
      },
      {
        sequence: ["▲", "■", "●", "▲", "■", "?"],
        options: ["▲", "■", "●", "◆"],
        correctIndex: 2,
        rule: "דפוס חוזר: משולש, ריבוע, עיגול...",
      },
      {
        sequence: ["😊", "😐", "😢", "😊", "😐", "?"],
        options: ["😊", "😐", "😢", "😮"],
        correctIndex: 2,
        rule: "דפוס חוזר: שמח, רגיל, עצוב...",
      },
    ],
    medium: [
      {
        sequence: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐", "⭐⭐", "?"],
        options: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐"],
        correctIndex: 2,
        rule: "דפוס גדל: כוכב אחד, שניים, שלושה, וחוזר...",
      },
      {
        sequence: ["🔴", "🔴🔴", "🔴🔴🔴", "🔴", "?"],
        options: ["🔴", "🔴🔴", "🔴🔴🔴", "🔴🔴🔴🔴"],
        correctIndex: 1,
        rule: "דפוס גדל: 1, 2, 3 וחוזר...",
      },
      {
        sequence: ["A", "B", "C", "D", "E", "?"],
        options: ["A", "D", "F", "G"],
        correctIndex: 2,
        rule: "סדרה לפי סדר האלף-בית האנגלי",
      },
      {
        sequence: ["→", "↗", "↑", "↖", "←", "?"],
        options: ["↙", "↓", "↘", "→"],
        correctIndex: 0,
        rule: "דפוס סיבוב נגד כיוון השעון",
      },
      {
        sequence: ["🌱", "🌿", "🌳", "🌱", "🌿", "?"],
        options: ["🌱", "🌿", "🌳", "🌲"],
        correctIndex: 2,
        rule: "דפוס צמיחה: זרע, שיח, עץ וחוזר...",
      },
      {
        sequence: ["1", "2", "2", "3", "3", "?"],
        options: ["3", "4", "1", "2"],
        correctIndex: 0,
        rule: "דפוס: מספר בודד, מספר כפול...",
      },
    ],
    hard: [
      {
        sequence: ["2", "4", "6", "8", "?"],
        options: ["9", "10", "11", "12"],
        correctIndex: 1,
        rule: "מספרים זוגיים: קפיצות של 2",
      },
      {
        sequence: ["🔵", "🔵🔵", "🔵🔵🔵", "🔵🔵🔵🔵", "?"],
        options: ["🔵🔵🔵🔵", "🔵🔵🔵🔵🔵", "🔵🔵🔵", "🔵"],
        correctIndex: 1,
        rule: "דפוס גדל: בכל פעם מוסיפים עיגול אחד",
      },
      {
        sequence: ["א", "ג", "ה", "ז", "?"],
        options: ["ח", "ט", "י", "כ"],
        correctIndex: 1,
        rule: "אותיות עבריות בדילוג: א, ג, ה, ז, ט...",
      },
      {
        sequence: ["1", "1", "2", "3", "5", "?"],
        options: ["6", "7", "8", "9"],
        correctIndex: 2,
        rule: "סדרת פיבונאצ'י: כל מספר הוא סכום שני הקודמים",
      },
      {
        sequence: ["🌑", "🌒", "🌓", "🌔", "?"],
        options: ["🌕", "🌖", "🌑", "🌙"],
        correctIndex: 0,
        rule: "מחזור הירח: מחודש חדש לירח מלא",
      },
      {
        sequence: ["❄️", "🌸", "☀️", "🍂", "?"],
        options: ["❄️", "🌸", "☀️", "🍂"],
        correctIndex: 0,
        rule: "מעגל עונות השנה: חורף, אביב, קיץ, סתיו...",
      },
    ],
  },

  // Grade ג (3rd grade) - Numeric patterns, growing/shrinking
  ג: {
    easy: [
      {
        sequence: ["5", "10", "15", "20", "?"],
        options: ["22", "24", "25", "30"],
        correctIndex: 2,
        rule: "קפיצות של 5: 5, 10, 15, 20, 25...",
      },
      {
        sequence: ["3", "6", "9", "12", "?"],
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        rule: "לוח הכפל של 3: קפיצות של 3",
      },
      {
        sequence: ["🔴", "🔴🔵", "🔴🔵🟢", "🔴🔵🟢🟡", "?"],
        options: ["🔴", "🔴🔵🟢🟡🟣", "🔵🟢🟡", "🔴🔵🟢"],
        correctIndex: 1,
        rule: "בכל שלב מוסיפים צבע חדש",
      },
      {
        sequence: ["20", "18", "16", "14", "?"],
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        rule: "יורד ב-2 כל פעם: 20, 18, 16, 14, 12...",
      },
      {
        sequence: ["1", "4", "7", "10", "?"],
        options: ["11", "12", "13", "14"],
        correctIndex: 2,
        rule: "קפיצות של 3: 1, 4, 7, 10, 13...",
      },
      {
        sequence: ["🌕", "🌖", "🌗", "🌘", "?"],
        options: ["🌕", "🌙", "🌑", "⭐"],
        correctIndex: 2,
        rule: "הירח הולך ונעלם: מלא לחדש",
      },
    ],
    medium: [
      {
        sequence: ["1", "2", "4", "8", "?"],
        options: ["10", "12", "14", "16"],
        correctIndex: 3,
        rule: "כפולות של 2: כל מספר כפול מהקודם",
      },
      {
        sequence: ["100", "90", "80", "70", "?"],
        options: ["50", "55", "60", "65"],
        correctIndex: 2,
        rule: "יורד ב-10 כל פעם",
      },
      {
        sequence: ["1", "3", "6", "10", "?"],
        options: ["12", "13", "14", "15"],
        correctIndex: 3,
        rule: "מספרים משולשים: +2, +3, +4, +5...",
      },
      {
        sequence: ["🔺", "🔺🔺", "🔺🔺🔺🔺", "🔺🔺🔺🔺🔺🔺🔺🔺", "?"],
        options: ["🔺×10", "🔺×12", "🔺×14", "🔺×16"],
        correctIndex: 3,
        rule: "כפולות: 1, 2, 4, 8, 16 משולשים",
      },
      {
        sequence: ["81", "27", "9", "3", "?"],
        options: ["0", "1", "2", "3"],
        correctIndex: 1,
        rule: "חלוקה ב-3 כל פעם: 81÷3=27, 27÷3=9...",
      },
      {
        sequence: ["⬜", "⬜⬛", "⬜⬛⬜", "⬜⬛⬜⬛", "?"],
        options: ["⬜⬛⬜⬛⬜", "⬛⬜⬛⬜⬛", "⬜⬜⬜⬜⬜", "⬛⬛⬛⬛⬛"],
        correctIndex: 0,
        rule: "דמקה גדלה: מוסיפים ריבוע מתחלף",
      },
    ],
    hard: [
      {
        sequence: ["1", "1", "2", "3", "5", "8", "?"],
        options: ["10", "11", "12", "13"],
        correctIndex: 3,
        rule: "פיבונאצ'י: כל מספר = סכום שני הקודמים",
      },
      {
        sequence: ["2", "3", "5", "7", "11", "?"],
        options: ["12", "13", "14", "15"],
        correctIndex: 1,
        rule: "מספרים ראשוניים: מתחלקים רק ב-1 ובעצמם",
      },
      {
        sequence: ["1", "4", "9", "16", "?"],
        options: ["20", "22", "24", "25"],
        correctIndex: 3,
        rule: "מספרים ריבועיים: 1², 2², 3², 4², 5²...",
      },
      {
        sequence: ["32", "16", "8", "4", "?"],
        options: ["1", "2", "3", "0"],
        correctIndex: 1,
        rule: "חצי כל פעם: 32÷2=16, 16÷2=8...",
      },
      {
        sequence: ["🔴", "🔵🔵", "🟢🟢🟢", "🟡🟡🟡🟡", "?"],
        options: ["🟣🟣🟣🟣", "🟣🟣🟣🟣🟣", "🟠🟠🟠🟠🟠", "🟤🟤🟤"],
        correctIndex: 1,
        rule: "גדל ב-1 כל פעם, צבע חדש: 1, 2, 3, 4, 5",
      },
      {
        sequence: ["A", "C", "E", "G", "?"],
        options: ["H", "I", "J", "K"],
        correctIndex: 1,
        rule: "דילוג של אות אחת: A, C, E, G, I...",
      },
    ],
  },

  // Grade ד (4th grade) - Complex numeric patterns, multi-rule patterns
  ד: {
    easy: [
      {
        sequence: ["7", "14", "21", "28", "?"],
        options: ["32", "33", "34", "35"],
        correctIndex: 3,
        rule: "לוח הכפל של 7: קפיצות של 7",
      },
      {
        sequence: ["1000", "900", "800", "700", "?"],
        options: ["500", "550", "600", "650"],
        correctIndex: 2,
        rule: "יורד ב-100 כל פעם",
      },
      {
        sequence: ["2", "6", "18", "54", "?"],
        options: ["108", "126", "162", "180"],
        correctIndex: 2,
        rule: "כפל ב-3 כל פעם: 2×3=6, 6×3=18...",
      },
      {
        sequence: ["1.5", "3", "4.5", "6", "?"],
        options: ["6.5", "7", "7.5", "8"],
        correctIndex: 2,
        rule: "קפיצות של 1.5",
      },
      {
        sequence: ["□", "□□", "□□□", "□□□□□", "?"],
        options: ["□□□□□□", "□□□□□□□□", "□□□□□□□", "□□□□□□□□□"],
        correctIndex: 1,
        rule: "1, 2, 3, 5... (פיבונאצ'י)",
      },
      {
        sequence: ["10", "15", "11", "16", "12", "?"],
        options: ["13", "14", "17", "18"],
        correctIndex: 2,
        rule: "שני דפוסים: +5, -4 לסירוגין",
      },
    ],
    medium: [
      {
        sequence: ["1", "8", "27", "64", "?"],
        options: ["100", "125", "150", "175"],
        correctIndex: 1,
        rule: "מספרים מעוקבים: 1³, 2³, 3³, 4³, 5³...",
      },
      {
        sequence: ["2", "5", "11", "23", "?"],
        options: ["35", "41", "47", "53"],
        correctIndex: 2,
        rule: "כפל 2 ועוד 1: (2×2)+1=5, (5×2)+1=11...",
      },
      {
        sequence: ["1", "2", "4", "7", "11", "?"],
        options: ["14", "15", "16", "17"],
        correctIndex: 2,
        rule: "מוסיפים +1, +2, +3, +4, +5...",
      },
      {
        sequence: ["3", "5", "9", "17", "33", "?"],
        options: ["49", "57", "65", "73"],
        correctIndex: 2,
        rule: "כפל 2 פחות 1: (3×2)-1=5, (5×2)-1=9...",
      },
      {
        sequence: ["⚫⚪", "⚫⚪⚫", "⚫⚪⚫⚪", "⚫⚪⚫⚪⚫", "?"],
        options: ["⚫⚪⚫⚪⚫⚪", "⚪⚫⚪⚫⚪⚫", "⚫⚫⚫⚫⚫⚫", "⚪⚪⚪⚪⚪⚪"],
        correctIndex: 0,
        rule: "דמקה גדלה: מוסיפים עיגול מתחלף",
      },
      {
        sequence: ["0.25", "0.5", "1", "2", "?"],
        options: ["2.5", "3", "4", "5"],
        correctIndex: 2,
        rule: "כפל ב-2 כל פעם (רבעים לשלמים)",
      },
    ],
    hard: [
      {
        sequence: ["1", "1", "2", "6", "24", "?"],
        options: ["48", "72", "100", "120"],
        correctIndex: 3,
        rule: "עצרת (פקטוריאל): n! = 1!, 2!, 3!, 4!, 5!...",
      },
      {
        sequence: ["2", "3", "5", "7", "11", "13", "?"],
        options: ["14", "15", "17", "19"],
        correctIndex: 2,
        rule: "מספרים ראשוניים לפי הסדר",
      },
      {
        sequence: ["1", "3", "7", "15", "31", "?"],
        options: ["47", "55", "63", "71"],
        correctIndex: 2,
        rule: "כפל 2 ועוד 1: (1×2)+1=3, (3×2)+1=7...",
      },
      {
        sequence: ["0", "1", "1", "2", "4", "7", "?"],
        options: ["11", "12", "13", "14"],
        correctIndex: 2,
        rule: "טריבונאצ'י: סכום שלושת הקודמים",
      },
      {
        sequence: ["🔲", "🔲🔲", "🔲🔲🔲🔲", "🔲×7", "?"],
        options: ["🔲×10", "🔲×11", "🔲×12", "🔲×13"],
        correctIndex: 1,
        rule: "1, 2, 4, 7, 11... (+1, +2, +3, +4)",
      },
      {
        sequence: ["256", "128", "64", "32", "?"],
        options: ["8", "12", "16", "24"],
        correctIndex: 2,
        rule: "חלוקה ב-2: חצי כל פעם",
      },
    ],
  },

  // Grade ה (5th grade) - Advanced patterns, multiple operations
  ה: {
    easy: [
      {
        sequence: ["0.1", "0.2", "0.4", "0.8", "?"],
        options: ["1.2", "1.4", "1.6", "1.8"],
        correctIndex: 2,
        rule: "כפל ב-2: 0.1×2=0.2, 0.2×2=0.4...",
      },
      {
        sequence: ["-8", "-4", "0", "4", "?"],
        options: ["6", "7", "8", "10"],
        correctIndex: 2,
        rule: "קפיצות של +4 (כולל שליליים)",
      },
      {
        sequence: ["1/4", "1/2", "3/4", "1", "?"],
        options: ["1/4", "1 1/4", "1 1/2", "2"],
        correctIndex: 1,
        rule: "קפיצות של רבע: 1/4, 2/4, 3/4, 4/4, 5/4...",
      },
      {
        sequence: ["1", "4", "9", "16", "25", "?"],
        options: ["30", "32", "36", "40"],
        correctIndex: 2,
        rule: "ריבועים: 1², 2², 3², 4², 5², 6²...",
      },
      {
        sequence: ["2", "4", "8", "16", "32", "?"],
        options: ["48", "56", "64", "72"],
        correctIndex: 2,
        rule: "חזקות של 2: 2¹, 2², 2³, 2⁴, 2⁵, 2⁶...",
      },
      {
        sequence: ["A1", "B2", "C3", "D4", "?"],
        options: ["D5", "E4", "E5", "F5"],
        correctIndex: 2,
        rule: "אות עולה + מספר עולה",
      },
    ],
    medium: [
      {
        sequence: ["1", "2", "6", "24", "120", "?"],
        options: ["240", "480", "600", "720"],
        correctIndex: 3,
        rule: "עצרת: 1!, 2!, 3!, 4!, 5!, 6!",
      },
      {
        sequence: ["3", "6", "11", "18", "27", "?"],
        options: ["34", "36", "38", "40"],
        correctIndex: 2,
        rule: "+3, +5, +7, +9, +11... (מוסיפים 2 לתוספת)",
      },
      {
        sequence: ["1", "-2", "4", "-8", "16", "?"],
        options: ["-24", "-32", "24", "32"],
        correctIndex: 1,
        rule: "כפל ב-(-2): מתחלף בסימן וכפול",
      },
      {
        sequence: ["π", "2π", "3π", "4π", "?"],
        options: ["4.5π", "5π", "6π", "πײ5"],
        correctIndex: 1,
        rule: "כפולות של פאי: π, 2π, 3π...",
      },
      {
        sequence: ["1/2", "2/3", "3/4", "4/5", "?"],
        options: ["5/5", "5/6", "6/6", "6/7"],
        correctIndex: 1,
        rule: "מונה ומכנה עולים ב-1",
      },
      {
        sequence: ["√1", "√4", "√9", "√16", "?"],
        options: ["√20", "√25", "√30", "√36"],
        correctIndex: 1,
        rule: "שורשים של ריבועים שלמים: √1, √4, √9...",
      },
    ],
    hard: [
      {
        sequence: ["2", "3", "5", "8", "13", "21", "?"],
        options: ["29", "32", "34", "36"],
        correctIndex: 2,
        rule: "פיבונאצ'י מתחיל מ-2: כל מספר = סכום שני הקודמים",
      },
      {
        sequence: ["1", "8", "27", "64", "125", "?"],
        options: ["196", "216", "256", "289"],
        correctIndex: 1,
        rule: "מעוקבים: 1³, 2³, 3³, 4³, 5³, 6³...",
      },
      {
        sequence: ["2", "6", "12", "20", "30", "?"],
        options: ["38", "40", "42", "44"],
        correctIndex: 2,
        rule: "n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7...",
      },
      {
        sequence: ["1", "2", "4", "7", "11", "16", "?"],
        options: ["20", "21", "22", "23"],
        correctIndex: 2,
        rule: "+1, +2, +3, +4, +5, +6...",
      },
      {
        sequence: ["10", "11", "13", "17", "25", "?"],
        options: ["33", "37", "41", "49"],
        correctIndex: 2,
        rule: "+1, +2, +4, +8, +16... (חזקות של 2)",
      },
      {
        sequence: ["1", "4", "10", "20", "35", "?"],
        options: ["50", "52", "54", "56"],
        correctIndex: 3,
        rule: "מספרים טטרהדרליים: סכום משולשים",
      },
    ],
  },

  // Grade ו (6th grade) - Complex patterns, algebraic sequences
  ו: {
    easy: [
      {
        sequence: ["x", "2x", "4x", "8x", "?"],
        options: ["10x", "12x", "14x", "16x"],
        correctIndex: 3,
        rule: "כפל ב-2: x, 2x, 4x, 8x, 16x...",
      },
      {
        sequence: ["n", "n+2", "n+4", "n+6", "?"],
        options: ["n+7", "n+8", "n+9", "n+10"],
        correctIndex: 1,
        rule: "קפיצות של 2: n, n+2, n+4, n+6, n+8...",
      },
      {
        sequence: ["10²", "11²", "12²", "13²", "?"],
        options: ["14²", "15²", "140", "150"],
        correctIndex: 0,
        rule: "ריבועים עוקבים: 100, 121, 144, 169, 196...",
      },
      {
        sequence: ["-27", "-8", "-1", "0", "?"],
        options: ["1", "2", "4", "8"],
        correctIndex: 0,
        rule: "מעוקבים: (-3)³, (-2)³, (-1)³, 0³, 1³...",
      },
      {
        sequence: ["2⁰", "2¹", "2²", "2³", "?"],
        options: ["2⁴", "2⁵", "8", "12"],
        correctIndex: 0,
        rule: "חזקות של 2: 1, 2, 4, 8, 16...",
      },
      {
        sequence: ["1/8", "1/4", "1/2", "1", "?"],
        options: ["1.5", "2", "3", "4"],
        correctIndex: 1,
        rule: "כפל ב-2 (שברים): 1/8, 1/4, 1/2, 1, 2...",
      },
    ],
    medium: [
      {
        sequence: ["a²", "a²+2a", "a²+4a", "a²+6a", "?"],
        options: ["a²+7a", "a²+8a", "a²+9a", "a²+10a"],
        correctIndex: 1,
        rule: "הוספת 2a כל פעם",
      },
      {
        sequence: ["log₁₀1", "log₁₀10", "log₁₀100", "log₁₀1000", "?"],
        options: ["log₁₀10000", "3", "4", "5"],
        correctIndex: 0,
        rule: "לוגריתמים: 0, 1, 2, 3, 4...",
      },
      {
        sequence: ["sin0°", "sin30°", "sin45°", "sin60°", "?"],
        options: ["sin75°", "sin90°", "sin120°", "1"],
        correctIndex: 1,
        rule: "זוויות סינוס עיקריות: 0°, 30°, 45°, 60°, 90°",
      },
      {
        sequence: ["1/1", "1/3", "1/9", "1/27", "?"],
        options: ["1/54", "1/72", "1/81", "1/90"],
        correctIndex: 2,
        rule: "חלוקה ב-3 כל פעם: 1, 1/3, 1/9, 1/27, 1/81...",
      },
      {
        sequence: ["0!", "1!", "2!", "3!", "4!", "?"],
        options: ["5!", "24", "100", "120"],
        correctIndex: 0,
        rule: "עצרת: 1, 1, 2, 6, 24, 120...",
      },
      {
        sequence: ["3", "9", "27", "81", "?"],
        options: ["162", "216", "243", "256"],
        correctIndex: 2,
        rule: "חזקות של 3: 3¹, 3², 3³, 3⁴, 3⁵...",
      },
    ],
    hard: [
      {
        sequence: ["1", "4", "27", "256", "?"],
        options: ["625", "1024", "3125", "4096"],
        correctIndex: 2,
        rule: "nⁿ: 1¹, 2², 3³, 4⁴, 5⁵...",
      },
      {
        sequence: ["e⁰", "e¹", "e²", "e³", "?"],
        options: ["e⁴", "e⁵", "4e", "5e"],
        correctIndex: 0,
        rule: "חזקות של e: 1, e, e², e³, e⁴...",
      },
      {
        sequence: ["∑1", "∑2", "∑3", "∑4", "?"],
        options: ["∑5", "10", "15", "20"],
        correctIndex: 0,
        rule: "סכומים: 1, 3, 6, 10, 15... (מספרים משולשים)",
      },
      {
        sequence: ["2", "6", "15", "31", "?"],
        options: ["52", "54", "56", "58"],
        correctIndex: 2,
        rule: "2ⁿ-1 + סכום עד n: דפוס מורכב",
      },
      {
        sequence: ["i⁰", "i¹", "i²", "i³", "?"],
        options: ["i⁴", "-i", "1", "-1"],
        correctIndex: 0,
        rule: "חזקות של i: 1, i, -1, -i, 1... (מחזורי)",
      },
      {
        sequence: ["C(4,0)", "C(4,1)", "C(4,2)", "C(4,3)", "?"],
        options: ["C(4,4)", "C(5,4)", "4", "5"],
        correctIndex: 0,
        rule: "מקדמים בינומיים: 1, 4, 6, 4, 1",
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "pattern")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedPatternContent() {
  console.log("🎯 Starting Pattern Recognition game content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Pattern items in database.`);
    console.log("   Skipping seed to avoid duplicates.");
    console.log("   Delete existing content first if you want to reseed.\n");
    return;
  }

  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  let totalAdded = 0;
  let errors = 0;

  for (const grade of grades) {
    for (const difficulty of difficulties) {
      const contentSets = PATTERN_CONTENT[grade][difficulty];

      console.log(`📝 Adding ${contentSets.length} patterns for grade ${grade}, ${difficulty}...`);

      for (const contentData of contentSets) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "pattern",
            grade,
            difficulty,
            sequence: contentData.sequence,
            options: contentData.options,
            correctIndex: contentData.correctIndex,
            rule: contentData.rule,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Failed to add content:`, error);
          errors++;
        }
      }
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Total items added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\n📊 Content summary:");
  for (const grade of grades) {
    const gradeTotal =
      PATTERN_CONTENT[grade].easy.length +
      PATTERN_CONTENT[grade].medium.length +
      PATTERN_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} patterns`);
  }
}

// Run the seed
seedPatternContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
