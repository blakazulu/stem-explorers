/**
 * Seed script for Math Race game content
 * Run with: npx tsx scripts/seed-math-race-content.ts
 *
 * Creates math problems for all grades (א-ו) and difficulties (easy/medium/hard)
 * 10 problems per grade/difficulty = 180 total
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

interface MathProblem {
  problem: string;
  answer: number;
  options: number[];
}

/**
 * Generate wrong answer options near the correct answer
 */
function generateOptions(answer: number): number[] {
  const options = new Set<number>();
  options.add(answer);

  // Generate 3 wrong answers near the correct one
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const wrongAnswer = answer + offset * direction;

    // Avoid negative numbers for younger grades
    if (wrongAnswer >= 0 && wrongAnswer !== answer) {
      options.add(wrongAnswer);
    }
  }

  // Shuffle and return
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// =============================================================================
// MATH RACE CONTENT DATA
// Organized by grade, then difficulty
// Grade א-ב: Simple +/- up to 20
// Grade ג-ד: Multiplication, division
// Grade ה-ו: Fractions, decimals, order of operations
// =============================================================================

const MATH_RACE_CONTENT: Record<Grade, Record<Difficulty, MathProblem[]>> = {
  // Grade א (1st grade) - Simple addition/subtraction up to 10
  א: {
    easy: [
      { problem: "2 + 3 = ?", answer: 5, options: generateOptions(5) },
      { problem: "1 + 4 = ?", answer: 5, options: generateOptions(5) },
      { problem: "3 + 2 = ?", answer: 5, options: generateOptions(5) },
      { problem: "5 - 2 = ?", answer: 3, options: generateOptions(3) },
      { problem: "4 - 1 = ?", answer: 3, options: generateOptions(3) },
      { problem: "1 + 1 = ?", answer: 2, options: generateOptions(2) },
      { problem: "2 + 2 = ?", answer: 4, options: generateOptions(4) },
      { problem: "6 - 3 = ?", answer: 3, options: generateOptions(3) },
      { problem: "5 + 1 = ?", answer: 6, options: generateOptions(6) },
      { problem: "4 + 2 = ?", answer: 6, options: generateOptions(6) },
    ],
    medium: [
      { problem: "5 + 4 = ?", answer: 9, options: generateOptions(9) },
      { problem: "6 + 3 = ?", answer: 9, options: generateOptions(9) },
      { problem: "7 + 2 = ?", answer: 9, options: generateOptions(9) },
      { problem: "8 - 5 = ?", answer: 3, options: generateOptions(3) },
      { problem: "9 - 4 = ?", answer: 5, options: generateOptions(5) },
      { problem: "3 + 5 = ?", answer: 8, options: generateOptions(8) },
      { problem: "10 - 6 = ?", answer: 4, options: generateOptions(4) },
      { problem: "4 + 5 = ?", answer: 9, options: generateOptions(9) },
      { problem: "7 - 3 = ?", answer: 4, options: generateOptions(4) },
      { problem: "6 + 4 = ?", answer: 10, options: generateOptions(10) },
    ],
    hard: [
      { problem: "8 + 5 = ?", answer: 13, options: generateOptions(13) },
      { problem: "9 + 6 = ?", answer: 15, options: generateOptions(15) },
      { problem: "7 + 8 = ?", answer: 15, options: generateOptions(15) },
      { problem: "15 - 8 = ?", answer: 7, options: generateOptions(7) },
      { problem: "13 - 5 = ?", answer: 8, options: generateOptions(8) },
      { problem: "6 + 9 = ?", answer: 15, options: generateOptions(15) },
      { problem: "17 - 9 = ?", answer: 8, options: generateOptions(8) },
      { problem: "8 + 7 = ?", answer: 15, options: generateOptions(15) },
      { problem: "14 - 6 = ?", answer: 8, options: generateOptions(8) },
      { problem: "9 + 9 = ?", answer: 18, options: generateOptions(18) },
    ],
  },

  // Grade ב (2nd grade) - Addition/subtraction up to 20 and simple doubles
  ב: {
    easy: [
      { problem: "10 + 5 = ?", answer: 15, options: generateOptions(15) },
      { problem: "8 + 8 = ?", answer: 16, options: generateOptions(16) },
      { problem: "12 + 3 = ?", answer: 15, options: generateOptions(15) },
      { problem: "15 - 5 = ?", answer: 10, options: generateOptions(10) },
      { problem: "18 - 8 = ?", answer: 10, options: generateOptions(10) },
      { problem: "7 + 7 = ?", answer: 14, options: generateOptions(14) },
      { problem: "9 + 9 = ?", answer: 18, options: generateOptions(18) },
      { problem: "16 - 6 = ?", answer: 10, options: generateOptions(10) },
      { problem: "11 + 4 = ?", answer: 15, options: generateOptions(15) },
      { problem: "14 - 4 = ?", answer: 10, options: generateOptions(10) },
    ],
    medium: [
      { problem: "12 + 8 = ?", answer: 20, options: generateOptions(20) },
      { problem: "15 + 5 = ?", answer: 20, options: generateOptions(20) },
      { problem: "20 - 7 = ?", answer: 13, options: generateOptions(13) },
      { problem: "18 - 9 = ?", answer: 9, options: generateOptions(9) },
      { problem: "13 + 7 = ?", answer: 20, options: generateOptions(20) },
      { problem: "19 - 8 = ?", answer: 11, options: generateOptions(11) },
      { problem: "11 + 9 = ?", answer: 20, options: generateOptions(20) },
      { problem: "17 - 8 = ?", answer: 9, options: generateOptions(9) },
      { problem: "14 + 6 = ?", answer: 20, options: generateOptions(20) },
      { problem: "16 - 9 = ?", answer: 7, options: generateOptions(7) },
    ],
    hard: [
      { problem: "25 + 15 = ?", answer: 40, options: generateOptions(40) },
      { problem: "30 - 17 = ?", answer: 13, options: generateOptions(13) },
      { problem: "28 + 12 = ?", answer: 40, options: generateOptions(40) },
      { problem: "45 - 23 = ?", answer: 22, options: generateOptions(22) },
      { problem: "33 + 17 = ?", answer: 50, options: generateOptions(50) },
      { problem: "50 - 28 = ?", answer: 22, options: generateOptions(22) },
      { problem: "27 + 18 = ?", answer: 45, options: generateOptions(45) },
      { problem: "42 - 19 = ?", answer: 23, options: generateOptions(23) },
      { problem: "36 + 24 = ?", answer: 60, options: generateOptions(60) },
      { problem: "55 - 27 = ?", answer: 28, options: generateOptions(28) },
    ],
  },

  // Grade ג (3rd grade) - Simple multiplication and division
  ג: {
    easy: [
      { problem: "2 × 3 = ?", answer: 6, options: generateOptions(6) },
      { problem: "4 × 2 = ?", answer: 8, options: generateOptions(8) },
      { problem: "5 × 2 = ?", answer: 10, options: generateOptions(10) },
      { problem: "3 × 3 = ?", answer: 9, options: generateOptions(9) },
      { problem: "6 ÷ 2 = ?", answer: 3, options: generateOptions(3) },
      { problem: "10 ÷ 5 = ?", answer: 2, options: generateOptions(2) },
      { problem: "2 × 5 = ?", answer: 10, options: generateOptions(10) },
      { problem: "4 × 3 = ?", answer: 12, options: generateOptions(12) },
      { problem: "8 ÷ 2 = ?", answer: 4, options: generateOptions(4) },
      { problem: "12 ÷ 3 = ?", answer: 4, options: generateOptions(4) },
    ],
    medium: [
      { problem: "6 × 4 = ?", answer: 24, options: generateOptions(24) },
      { problem: "7 × 3 = ?", answer: 21, options: generateOptions(21) },
      { problem: "5 × 5 = ?", answer: 25, options: generateOptions(25) },
      { problem: "8 × 3 = ?", answer: 24, options: generateOptions(24) },
      { problem: "24 ÷ 6 = ?", answer: 4, options: generateOptions(4) },
      { problem: "20 ÷ 4 = ?", answer: 5, options: generateOptions(5) },
      { problem: "6 × 5 = ?", answer: 30, options: generateOptions(30) },
      { problem: "7 × 4 = ?", answer: 28, options: generateOptions(28) },
      { problem: "35 ÷ 7 = ?", answer: 5, options: generateOptions(5) },
      { problem: "32 ÷ 8 = ?", answer: 4, options: generateOptions(4) },
    ],
    hard: [
      { problem: "8 × 7 = ?", answer: 56, options: generateOptions(56) },
      { problem: "9 × 6 = ?", answer: 54, options: generateOptions(54) },
      { problem: "7 × 8 = ?", answer: 56, options: generateOptions(56) },
      { problem: "9 × 7 = ?", answer: 63, options: generateOptions(63) },
      { problem: "72 ÷ 8 = ?", answer: 9, options: generateOptions(9) },
      { problem: "63 ÷ 9 = ?", answer: 7, options: generateOptions(7) },
      { problem: "8 × 9 = ?", answer: 72, options: generateOptions(72) },
      { problem: "6 × 8 = ?", answer: 48, options: generateOptions(48) },
      { problem: "54 ÷ 6 = ?", answer: 9, options: generateOptions(9) },
      { problem: "49 ÷ 7 = ?", answer: 7, options: generateOptions(7) },
    ],
  },

  // Grade ד (4th grade) - Multi-digit multiplication and division
  ד: {
    easy: [
      { problem: "12 × 4 = ?", answer: 48, options: generateOptions(48) },
      { problem: "15 × 3 = ?", answer: 45, options: generateOptions(45) },
      { problem: "20 × 5 = ?", answer: 100, options: generateOptions(100) },
      { problem: "11 × 6 = ?", answer: 66, options: generateOptions(66) },
      { problem: "48 ÷ 4 = ?", answer: 12, options: generateOptions(12) },
      { problem: "60 ÷ 5 = ?", answer: 12, options: generateOptions(12) },
      { problem: "13 × 4 = ?", answer: 52, options: generateOptions(52) },
      { problem: "25 × 4 = ?", answer: 100, options: generateOptions(100) },
      { problem: "72 ÷ 6 = ?", answer: 12, options: generateOptions(12) },
      { problem: "84 ÷ 7 = ?", answer: 12, options: generateOptions(12) },
    ],
    medium: [
      { problem: "15 × 12 = ?", answer: 180, options: generateOptions(180) },
      { problem: "24 × 5 = ?", answer: 120, options: generateOptions(120) },
      { problem: "18 × 7 = ?", answer: 126, options: generateOptions(126) },
      { problem: "144 ÷ 12 = ?", answer: 12, options: generateOptions(12) },
      { problem: "150 ÷ 10 = ?", answer: 15, options: generateOptions(15) },
      { problem: "25 × 8 = ?", answer: 200, options: generateOptions(200) },
      { problem: "16 × 9 = ?", answer: 144, options: generateOptions(144) },
      { problem: "168 ÷ 8 = ?", answer: 21, options: generateOptions(21) },
      { problem: "22 × 6 = ?", answer: 132, options: generateOptions(132) },
      { problem: "135 ÷ 9 = ?", answer: 15, options: generateOptions(15) },
    ],
    hard: [
      { problem: "125 × 8 = ?", answer: 1000, options: generateOptions(1000) },
      { problem: "45 × 25 = ?", answer: 1125, options: generateOptions(1125) },
      { problem: "32 × 32 = ?", answer: 1024, options: generateOptions(1024) },
      { problem: "840 ÷ 24 = ?", answer: 35, options: generateOptions(35) },
      { problem: "625 ÷ 25 = ?", answer: 25, options: generateOptions(25) },
      { problem: "48 × 25 = ?", answer: 1200, options: generateOptions(1200) },
      { problem: "75 × 16 = ?", answer: 1200, options: generateOptions(1200) },
      { problem: "960 ÷ 32 = ?", answer: 30, options: generateOptions(30) },
      { problem: "64 × 15 = ?", answer: 960, options: generateOptions(960) },
      { problem: "1125 ÷ 45 = ?", answer: 25, options: generateOptions(25) },
    ],
  },

  // Grade ה (5th grade) - Fractions and decimals
  ה: {
    easy: [
      { problem: "0.5 + 0.5 = ?", answer: 1, options: [0.5, 1, 1.5, 2] },
      { problem: "0.3 + 0.2 = ?", answer: 0.5, options: [0.4, 0.5, 0.6, 0.7] },
      { problem: "1.5 - 0.5 = ?", answer: 1, options: [0.5, 1, 1.5, 2] },
      { problem: "2.4 + 0.6 = ?", answer: 3, options: [2.8, 3, 3.2, 3.4] },
      { problem: "3.5 - 1.5 = ?", answer: 2, options: [1.5, 2, 2.5, 3] },
      { problem: "0.25 × 4 = ?", answer: 1, options: [0.5, 1, 1.5, 2] },
      { problem: "1.2 + 0.8 = ?", answer: 2, options: [1.8, 2, 2.2, 2.4] },
      { problem: "4.5 - 2.5 = ?", answer: 2, options: [1.5, 2, 2.5, 3] },
      { problem: "0.5 × 6 = ?", answer: 3, options: [2, 2.5, 3, 3.5] },
      { problem: "2.5 + 1.5 = ?", answer: 4, options: [3, 3.5, 4, 4.5] },
    ],
    medium: [
      { problem: "3.75 + 1.25 = ?", answer: 5, options: [4.5, 5, 5.5, 6] },
      { problem: "6.8 - 2.3 = ?", answer: 4.5, options: [4, 4.5, 5, 5.5] },
      { problem: "0.75 × 4 = ?", answer: 3, options: [2.5, 3, 3.5, 4] },
      { problem: "5.4 ÷ 2 = ?", answer: 2.7, options: [2.5, 2.7, 2.9, 3] },
      { problem: "2.5 × 2.5 = ?", answer: 6.25, options: [5, 5.5, 6.25, 7] },
      { problem: "7.2 ÷ 3 = ?", answer: 2.4, options: [2.2, 2.4, 2.6, 2.8] },
      { problem: "1.6 × 5 = ?", answer: 8, options: [7, 7.5, 8, 8.5] },
      { problem: "9.6 ÷ 4 = ?", answer: 2.4, options: [2.2, 2.4, 2.6, 2.8] },
      { problem: "3.5 × 4 = ?", answer: 14, options: [12, 13, 14, 15] },
      { problem: "8.4 - 3.9 = ?", answer: 4.5, options: [4, 4.5, 5, 5.5] },
    ],
    hard: [
      { problem: "12.5 × 0.8 = ?", answer: 10, options: [8, 9, 10, 11] },
      { problem: "7.5 ÷ 0.5 = ?", answer: 15, options: [12, 13, 14, 15] },
      { problem: "15.75 - 8.25 = ?", answer: 7.5, options: [7, 7.5, 8, 8.5] },
      { problem: "4.8 × 2.5 = ?", answer: 12, options: [10, 11, 12, 13] },
      { problem: "18.9 ÷ 3 = ?", answer: 6.3, options: [6, 6.3, 6.6, 7] },
      { problem: "6.25 × 4 = ?", answer: 25, options: [23, 24, 25, 26] },
      { problem: "11.2 ÷ 0.8 = ?", answer: 14, options: [12, 13, 14, 15] },
      { problem: "8.5 × 1.2 = ?", answer: 10.2, options: [9.8, 10, 10.2, 10.4] },
      { problem: "21.6 ÷ 1.8 = ?", answer: 12, options: [10, 11, 12, 13] },
      { problem: "5.5 × 3.6 = ?", answer: 19.8, options: [18.8, 19.3, 19.8, 20.3] },
    ],
  },

  // Grade ו (6th grade) - Order of operations and mixed problems
  ו: {
    easy: [
      { problem: "2 + 3 × 4 = ?", answer: 14, options: [14, 18, 20, 24] },
      { problem: "10 - 2 × 3 = ?", answer: 4, options: [4, 8, 24, 36] },
      { problem: "5 × 4 + 6 = ?", answer: 26, options: [24, 26, 28, 50] },
      { problem: "8 ÷ 2 + 3 = ?", answer: 7, options: [5, 6, 7, 8] },
      { problem: "12 ÷ 4 × 3 = ?", answer: 9, options: [1, 6, 9, 12] },
      { problem: "6 + 8 ÷ 2 = ?", answer: 10, options: [7, 8, 10, 12] },
      { problem: "3 × 5 - 7 = ?", answer: 8, options: [6, 7, 8, 9] },
      { problem: "15 - 6 ÷ 3 = ?", answer: 13, options: [3, 10, 13, 15] },
      { problem: "4 × 6 ÷ 2 = ?", answer: 12, options: [8, 10, 12, 14] },
      { problem: "20 ÷ 5 + 8 = ?", answer: 12, options: [10, 11, 12, 13] },
    ],
    medium: [
      { problem: "(5 + 3) × 4 = ?", answer: 32, options: [28, 30, 32, 34] },
      { problem: "2 × (8 - 3) = ?", answer: 10, options: [8, 10, 12, 14] },
      { problem: "24 ÷ (2 + 4) = ?", answer: 4, options: [3, 4, 5, 6] },
      { problem: "(15 - 6) × 3 = ?", answer: 27, options: [24, 27, 30, 33] },
      { problem: "5 × 4 + 3 × 2 = ?", answer: 26, options: [22, 24, 26, 28] },
      { problem: "36 ÷ 6 - 2 = ?", answer: 4, options: [2, 3, 4, 5] },
      { problem: "(12 + 8) ÷ 4 = ?", answer: 5, options: [4, 5, 6, 7] },
      { problem: "3 × (9 - 4) = ?", answer: 15, options: [12, 15, 18, 21] },
      { problem: "18 ÷ 3 + 4 × 2 = ?", answer: 14, options: [12, 13, 14, 16] },
      { problem: "7 × 3 - 15 ÷ 3 = ?", answer: 16, options: [14, 15, 16, 17] },
    ],
    hard: [
      { problem: "(6 + 4) × (8 - 5) = ?", answer: 30, options: [25, 28, 30, 32] },
      { problem: "5² + 3² = ?", answer: 34, options: [30, 32, 34, 36] },
      { problem: "48 ÷ (2 × 4) = ?", answer: 6, options: [4, 5, 6, 8] },
      { problem: "2³ + 4² = ?", answer: 24, options: [20, 22, 24, 26] },
      { problem: "(15 - 7) × (12 ÷ 4) = ?", answer: 24, options: [20, 22, 24, 26] },
      { problem: "√49 + √25 = ?", answer: 12, options: [10, 11, 12, 14] },
      { problem: "3² × 4 - 10 = ?", answer: 26, options: [24, 26, 28, 30] },
      { problem: "100 ÷ 5² = ?", answer: 4, options: [2, 3, 4, 5] },
      { problem: "(8 + 7) × 2 - 6 = ?", answer: 24, options: [22, 24, 26, 28] },
      { problem: "4³ ÷ 8 = ?", answer: 8, options: [6, 7, 8, 9] },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "mathRace")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedMathRaceContent() {
  console.log("# Starting Math Race content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`Warning: Found ${existingCount} existing Math Race items in database.`);
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
      const problems = MATH_RACE_CONTENT[grade][difficulty];

      console.log(`Adding ${problems.length} problems for grade ${grade}, ${difficulty}...`);

      for (const problemData of problems) {
        try {
          // Re-generate options to ensure the correct answer is included
          const options = generateOptions(problemData.answer);
          // Make sure the correct answer is included
          if (!options.includes(problemData.answer)) {
            options[0] = problemData.answer;
          }

          await addDoc(collection(db, "gameContent"), {
            gameType: "mathRace",
            grade,
            difficulty,
            problem: problemData.problem,
            answer: problemData.answer,
            options,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   Failed to add problem:`, error);
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
      MATH_RACE_CONTENT[grade].easy.length +
      MATH_RACE_CONTENT[grade].medium.length +
      MATH_RACE_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} problems`);
  }
}

// Run the seed
seedMathRaceContent()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });
