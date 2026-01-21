/**
 * Seed script for Number Pattern game content
 * Run with: npx tsx scripts/seed-number-pattern-content.ts
 *
 * Creates number sequences for all grades (א-ו) and difficulties (easy/medium/hard)
 * 6 patterns per grade/difficulty = 108 total
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

interface NumberPattern {
  sequence: (number | null)[];
  answer: number;
  rule: string;
}

// =============================================================================
// NUMBER PATTERN CONTENT DATA
// Organized by grade, then difficulty
// Each pattern has: sequence (with one null for missing), answer, rule
// =============================================================================

const NUMBER_PATTERN_CONTENT: Record<Grade, Record<Difficulty, NumberPattern[]>> = {
  // Grade א (1st grade) - Very simple patterns
  א: {
    easy: [
      {
        sequence: [1, 2, 3, null, 5],
        answer: 4,
        rule: "כל מספר גדל ב-1",
      },
      {
        sequence: [2, 4, null, 8, 10],
        answer: 6,
        rule: "כל מספר גדל ב-2",
      },
      {
        sequence: [1, 1, 1, null, 1],
        answer: 1,
        rule: "כל המספרים שווים",
      },
      {
        sequence: [5, 4, 3, null, 1],
        answer: 2,
        rule: "כל מספר קטן ב-1",
      },
      {
        sequence: [0, 1, 2, 3, null],
        answer: 4,
        rule: "כל מספר גדל ב-1",
      },
      {
        sequence: [10, null, 8, 7, 6],
        answer: 9,
        rule: "כל מספר קטן ב-1",
      },
    ],
    medium: [
      {
        sequence: [1, 3, null, 7, 9],
        answer: 5,
        rule: "כל מספר גדל ב-2",
      },
      {
        sequence: [2, 2, 3, 3, null],
        answer: 4,
        rule: "כל מספר חוזר פעמיים ואז עולה",
      },
      {
        sequence: [1, 2, 1, null, 1],
        answer: 2,
        rule: "המספרים מתחלפים: 1, 2, 1, 2...",
      },
      {
        sequence: [0, 2, 4, null, 8],
        answer: 6,
        rule: "כל מספר גדל ב-2",
      },
      {
        sequence: [10, 8, null, 4, 2],
        answer: 6,
        rule: "כל מספר קטן ב-2",
      },
      {
        sequence: [5, null, 7, 8, 9],
        answer: 6,
        rule: "כל מספר גדל ב-1",
      },
    ],
    hard: [
      {
        sequence: [1, 2, 4, null, 8],
        answer: 5,
        rule: "כל מספר גדל: +1, +2, +1, +3... (לא, זה +1 עולה)",
      },
      {
        sequence: [3, 6, null, 12, 15],
        answer: 9,
        rule: "כל מספר גדל ב-3",
      },
      {
        sequence: [1, 1, 2, null, 3],
        answer: 2,
        rule: "1, 1, 2, 2, 3, 3... כל מספר פעמיים",
      },
      {
        sequence: [0, 5, null, 15, 20],
        answer: 10,
        rule: "כל מספר גדל ב-5",
      },
      {
        sequence: [20, 18, 16, null, 12],
        answer: 14,
        rule: "כל מספר קטן ב-2",
      },
      {
        sequence: [1, 3, 5, null, 9],
        answer: 7,
        rule: "מספרים אי-זוגיים עולים",
      },
    ],
  },

  // Grade ב (2nd grade) - Simple skip counting
  ב: {
    easy: [
      {
        sequence: [5, 10, 15, null, 25],
        answer: 20,
        rule: "כל מספר גדל ב-5",
      },
      {
        sequence: [2, 4, 6, 8, null],
        answer: 10,
        rule: "כל מספר גדל ב-2 (מספרים זוגיים)",
      },
      {
        sequence: [3, 6, 9, null, 15],
        answer: 12,
        rule: "כל מספר גדל ב-3",
      },
      {
        sequence: [10, 20, null, 40, 50],
        answer: 30,
        rule: "כל מספר גדל ב-10",
      },
      {
        sequence: [1, 3, 5, 7, null],
        answer: 9,
        rule: "מספרים אי-זוגיים עולים (+2)",
      },
      {
        sequence: [100, 90, 80, null, 60],
        answer: 70,
        rule: "כל מספר קטן ב-10",
      },
    ],
    medium: [
      {
        sequence: [4, 8, null, 16, 20],
        answer: 12,
        rule: "כל מספר גדל ב-4",
      },
      {
        sequence: [6, 12, 18, null, 30],
        answer: 24,
        rule: "כל מספר גדל ב-6",
      },
      {
        sequence: [25, 20, null, 10, 5],
        answer: 15,
        rule: "כל מספר קטן ב-5",
      },
      {
        sequence: [7, 14, 21, null, 35],
        answer: 28,
        rule: "לוח הכפל של 7",
      },
      {
        sequence: [0, 3, 6, 9, null],
        answer: 12,
        rule: "כל מספר גדל ב-3",
      },
      {
        sequence: [50, null, 30, 20, 10],
        answer: 40,
        rule: "כל מספר קטן ב-10",
      },
    ],
    hard: [
      {
        sequence: [1, 2, 4, 8, null],
        answer: 16,
        rule: "כל מספר מוכפל ב-2",
      },
      {
        sequence: [1, 4, 9, null, 25],
        answer: 16,
        rule: "מספרים ריבועיים: 1, 4, 9, 16, 25...",
      },
      {
        sequence: [8, 16, null, 32, 40],
        answer: 24,
        rule: "כל מספר גדל ב-8",
      },
      {
        sequence: [11, 22, 33, null, 55],
        answer: 44,
        rule: "כל מספר גדל ב-11",
      },
      {
        sequence: [2, 4, 8, null, 32],
        answer: 16,
        rule: "כל מספר מוכפל ב-2",
      },
      {
        sequence: [99, 88, 77, null, 55],
        answer: 66,
        rule: "כל מספר קטן ב-11",
      },
    ],
  },

  // Grade ג (3rd grade) - More complex patterns
  ג: {
    easy: [
      {
        sequence: [9, 18, 27, null, 45],
        answer: 36,
        rule: "לוח הכפל של 9",
      },
      {
        sequence: [12, 24, null, 48, 60],
        answer: 36,
        rule: "כל מספר גדל ב-12",
      },
      {
        sequence: [15, 30, 45, null, 75],
        answer: 60,
        rule: "כל מספר גדל ב-15",
      },
      {
        sequence: [8, 16, 24, 32, null],
        answer: 40,
        rule: "לוח הכפל של 8",
      },
      {
        sequence: [100, 200, null, 400, 500],
        answer: 300,
        rule: "כל מספר גדל ב-100",
      },
      {
        sequence: [1000, 900, 800, null, 600],
        answer: 700,
        rule: "כל מספר קטן ב-100",
      },
    ],
    medium: [
      {
        sequence: [1, 3, 6, 10, null],
        answer: 15,
        rule: "מספרים משולשיים: +2, +3, +4, +5...",
      },
      {
        sequence: [2, 6, 12, 20, null],
        answer: 30,
        rule: "הפרשים עולים: +4, +6, +8, +10...",
      },
      {
        sequence: [1, 1, 2, 3, null],
        answer: 5,
        rule: "סדרת פיבונאצ'י: כל מספר הוא סכום שני קודמיו",
      },
      {
        sequence: [3, 9, null, 81, 243],
        answer: 27,
        rule: "כל מספר מוכפל ב-3",
      },
      {
        sequence: [5, 10, 20, 40, null],
        answer: 80,
        rule: "כל מספר מוכפל ב-2",
      },
      {
        sequence: [64, 32, null, 8, 4],
        answer: 16,
        rule: "כל מספר מחולק ב-2",
      },
    ],
    hard: [
      {
        sequence: [1, 4, 9, 16, null, 36],
        answer: 25,
        rule: "מספרים ריבועיים: 1², 2², 3², 4², 5², 6²",
      },
      {
        sequence: [1, 8, 27, null, 125],
        answer: 64,
        rule: "מספרים מעוקבים: 1³, 2³, 3³, 4³, 5³",
      },
      {
        sequence: [2, 3, 5, 7, 11, null],
        answer: 13,
        rule: "מספרים ראשוניים",
      },
      {
        sequence: [1, 2, 4, 7, null, 16],
        answer: 11,
        rule: "הפרשים עולים: +1, +2, +3, +4, +5...",
      },
      {
        sequence: [0, 1, 1, 2, 3, null],
        answer: 5,
        rule: "סדרת פיבונאצ'י",
      },
      {
        sequence: [256, 128, 64, null, 16],
        answer: 32,
        rule: "כל מספר מחולק ב-2 (חזקות של 2)",
      },
    ],
  },

  // Grade ד (4th grade) - Intermediate patterns
  ד: {
    easy: [
      {
        sequence: [13, 26, 39, null, 65],
        answer: 52,
        rule: "כל מספר גדל ב-13",
      },
      {
        sequence: [17, 34, null, 68, 85],
        answer: 51,
        rule: "כל מספר גדל ב-17",
      },
      {
        sequence: [25, 50, 75, null, 125],
        answer: 100,
        rule: "כל מספר גדל ב-25",
      },
      {
        sequence: [11, 22, 33, 44, null],
        answer: 55,
        rule: "כל מספר גדל ב-11",
      },
      {
        sequence: [111, 222, null, 444, 555],
        answer: 333,
        rule: "כל מספר גדל ב-111",
      },
      {
        sequence: [1000, 800, null, 400, 200],
        answer: 600,
        rule: "כל מספר קטן ב-200",
      },
    ],
    medium: [
      {
        sequence: [1, 1, 2, 3, 5, null],
        answer: 8,
        rule: "סדרת פיבונאצ'י: כל מספר = סכום שני הקודמים",
      },
      {
        sequence: [2, 5, 10, 17, null],
        answer: 26,
        rule: "הפרשים: +3, +5, +7, +9... (מספרים אי-זוגיים)",
      },
      {
        sequence: [1, 2, 6, 24, null],
        answer: 120,
        rule: "עצרת: 1!, 2!, 3!, 4!, 5!",
      },
      {
        sequence: [1, 4, 9, 16, 25, null],
        answer: 36,
        rule: "מספרים ריבועיים",
      },
      {
        sequence: [2, 6, 18, null, 162],
        answer: 54,
        rule: "כל מספר מוכפל ב-3",
      },
      {
        sequence: [1, 3, 7, 15, null],
        answer: 31,
        rule: "2ⁿ - 1: כל מספר כפול 2 ועוד 1",
      },
    ],
    hard: [
      {
        sequence: [3, 5, 9, 17, null],
        answer: 33,
        rule: "כל מספר כפול 2 פחות 1: (×2 - 1)",
      },
      {
        sequence: [1, 2, 3, 5, 8, null],
        answer: 13,
        rule: "פיבונאצ'י: כל מספר = סכום שני הקודמים",
      },
      {
        sequence: [4, 9, 25, 49, null],
        answer: 121,
        rule: "ריבועים של ראשוניים: 2², 3², 5², 7², 11²",
      },
      {
        sequence: [1, 8, 27, 64, null],
        answer: 125,
        rule: "מעוקבים: 1³, 2³, 3³, 4³, 5³",
      },
      {
        sequence: [2, 4, 16, null, 65536],
        answer: 256,
        rule: "כל מספר בריבוע: 2, 4=2², 16=4², 256=16²...",
      },
      {
        sequence: [5, 11, 23, null, 95],
        answer: 47,
        rule: "כל מספר כפול 2 ועוד 1",
      },
    ],
  },

  // Grade ה (5th grade) - Advanced patterns
  ה: {
    easy: [
      {
        sequence: [2, 3, 5, 7, 11, null],
        answer: 13,
        rule: "מספרים ראשוניים",
      },
      {
        sequence: [1, 4, 9, 16, null, 36],
        answer: 25,
        rule: "מספרים ריבועיים",
      },
      {
        sequence: [1, 8, 27, 64, null],
        answer: 125,
        rule: "מספרים מעוקבים",
      },
      {
        sequence: [21, 34, 55, null, 144],
        answer: 89,
        rule: "סדרת פיבונאצ'י",
      },
      {
        sequence: [1, 3, 6, 10, 15, null],
        answer: 21,
        rule: "מספרים משולשיים",
      },
      {
        sequence: [2, 6, 12, 20, 30, null],
        answer: 42,
        rule: "n × (n+1): 1×2, 2×3, 3×4...",
      },
    ],
    medium: [
      {
        sequence: [1, 1, 2, 3, 5, 8, null],
        answer: 13,
        rule: "סדרת פיבונאצ'י",
      },
      {
        sequence: [4, 6, 9, 13, 18, null],
        answer: 24,
        rule: "הפרשים עולים: +2, +3, +4, +5, +6",
      },
      {
        sequence: [1, 2, 4, 7, 11, null],
        answer: 16,
        rule: "הפרשים עולים: +1, +2, +3, +4, +5",
      },
      {
        sequence: [3, 9, 27, 81, null],
        answer: 243,
        rule: "חזקות של 3",
      },
      {
        sequence: [1, 5, 14, 30, null],
        answer: 55,
        rule: "מספרים פירמידליים ריבועיים",
      },
      {
        sequence: [2, 3, 5, 8, 13, null],
        answer: 21,
        rule: "סדרת לוקאס (כמו פיבונאצ'י, מתחילה ב-2,3)",
      },
    ],
    hard: [
      {
        sequence: [0, 1, 1, 2, 3, 5, 8, null],
        answer: 13,
        rule: "סדרת פיבונאצ'י מ-0",
      },
      {
        sequence: [1, 2, 5, 14, null],
        answer: 42,
        rule: "מספרי קטלן: Cₙ",
      },
      {
        sequence: [2, 12, 36, 80, null],
        answer: 150,
        rule: "n²(n+1): 1×2, 4×3, 9×4, 16×5...",
      },
      {
        sequence: [1, 2, 6, 24, 120, null],
        answer: 720,
        rule: "עצרת (פקטוריאל): n!",
      },
      {
        sequence: [1, 3, 9, 27, 81, null],
        answer: 243,
        rule: "חזקות של 3: 3⁰, 3¹, 3², 3³, 3⁴, 3⁵",
      },
      {
        sequence: [1, 4, 27, null, 3125],
        answer: 256,
        rule: "nⁿ: 1¹, 2², 3³, 4⁴, 5⁵",
      },
    ],
  },

  // Grade ו (6th grade) - Complex patterns
  ו: {
    easy: [
      {
        sequence: [2, 4, 8, 16, 32, null],
        answer: 64,
        rule: "חזקות של 2",
      },
      {
        sequence: [1, 1, 2, 3, 5, 8, 13, null],
        answer: 21,
        rule: "סדרת פיבונאצ'י",
      },
      {
        sequence: [2, 3, 5, 7, 11, 13, null],
        answer: 17,
        rule: "מספרים ראשוניים",
      },
      {
        sequence: [1, 3, 6, 10, 15, 21, null],
        answer: 28,
        rule: "מספרים משולשיים: n(n+1)/2",
      },
      {
        sequence: [1, 4, 9, 16, 25, 36, null],
        answer: 49,
        rule: "מספרים ריבועיים",
      },
      {
        sequence: [1, 8, 27, 64, 125, null],
        answer: 216,
        rule: "מספרים מעוקבים",
      },
    ],
    medium: [
      {
        sequence: [1, 2, 6, 24, 120, null],
        answer: 720,
        rule: "עצרת: n!",
      },
      {
        sequence: [1, 4, 10, 20, 35, null],
        answer: 56,
        rule: "מספרים טטראהדרליים (פירמידה משולשית)",
      },
      {
        sequence: [2, 5, 10, 17, 26, null],
        answer: 37,
        rule: "n² + 1",
      },
      {
        sequence: [0, 1, 3, 6, 10, 15, null],
        answer: 21,
        rule: "סכום 0 עד n: n(n+1)/2",
      },
      {
        sequence: [1, 5, 12, 22, 35, null],
        answer: 51,
        rule: "מספרים מחומשים (פנטגונליים)",
      },
      {
        sequence: [3, 7, 15, 31, null],
        answer: 63,
        rule: "2ⁿ⁺¹ - 1",
      },
    ],
    hard: [
      {
        sequence: [1, 1, 2, 5, 14, null],
        answer: 42,
        rule: "מספרי קטלן",
      },
      {
        sequence: [1, 2, 9, 64, null],
        answer: 625,
        rule: "n^n: 1¹, 2¹, 3², 4³, 5⁴... לא, nⁿ⁻¹",
      },
      {
        sequence: [2, 6, 30, 210, null],
        answer: 2310,
        rule: "מכפלת ראשוניים ראשונים: 2, 2×3, 2×3×5, 2×3×5×7, 2×3×5×7×11",
      },
      {
        sequence: [1, 11, 111, 1111, null],
        answer: 11111,
        rule: "רפוניט (מספרים מאחדות בלבד)",
      },
      {
        sequence: [1, 4, 27, 256, null],
        answer: 3125,
        rule: "nⁿ: 1¹, 2², 3³, 4⁴, 5⁵",
      },
      {
        sequence: [6, 28, 496, null],
        answer: 8128,
        rule: "מספרים מושלמים (שווים לסכום מחלקיהם)",
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "numberPattern")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedNumberPatternContent() {
  console.log("# Starting Number Pattern content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`Warning: Found ${existingCount} existing Number Pattern items in database.`);
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
      const patterns = NUMBER_PATTERN_CONTENT[grade][difficulty];

      console.log(`Adding ${patterns.length} patterns for grade ${grade}, ${difficulty}...`);

      for (const patternData of patterns) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "numberPattern",
            grade,
            difficulty,
            sequence: patternData.sequence,
            answer: patternData.answer,
            rule: patternData.rule,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   Failed to add pattern:`, error);
          errors++;
        }
      }
    }
  }

  console.log("\n Seeding complete!");
  console.log(`   Total items added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\nContent summary:");
  for (const grade of grades) {
    const gradeTotal =
      NUMBER_PATTERN_CONTENT[grade].easy.length +
      NUMBER_PATTERN_CONTENT[grade].medium.length +
      NUMBER_PATTERN_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} patterns`);
  }
}

// Run the seed
seedNumberPatternContent()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });
