/**
 * Seed script for Tangram game content
 * Run with: npx tsx scripts/seed-tangram-content.ts
 *
 * Creates tangram puzzles for all grades (א-ו) and difficulties (easy/medium/hard)
 * 3 puzzles per grade/difficulty = 54 total
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

interface TangramPiece {
  type: string;
  color: string;
  initialPosition: { x: number; y: number };
  initialRotation: number;
}

interface TangramContentData {
  targetShape: string;
  pieces: TangramPiece[];
}

// Standard tangram colors
const COLORS = [
  "#F87171", // red-400
  "#FB923C", // orange-400
  "#FBBF24", // amber-400
  "#4ADE80", // green-400
  "#22D3EE", // cyan-400
  "#818CF8", // indigo-400
  "#E879F9", // fuchsia-400
];

// Standard 7 tangram pieces configuration
const STANDARD_PIECES: TangramPiece[] = [
  { type: "triangle-large-1", color: COLORS[0], initialPosition: { x: 50, y: 50 }, initialRotation: 0 },
  { type: "triangle-large-2", color: COLORS[1], initialPosition: { x: 100, y: 50 }, initialRotation: 0 },
  { type: "triangle-medium", color: COLORS[2], initialPosition: { x: 50, y: 100 }, initialRotation: 0 },
  { type: "triangle-small-1", color: COLORS[3], initialPosition: { x: 100, y: 100 }, initialRotation: 0 },
  { type: "triangle-small-2", color: COLORS[4], initialPosition: { x: 50, y: 150 }, initialRotation: 0 },
  { type: "square", color: COLORS[5], initialPosition: { x: 100, y: 150 }, initialRotation: 0 },
  { type: "parallelogram", color: COLORS[6], initialPosition: { x: 50, y: 200 }, initialRotation: 0 },
];

// Simplified pieces for younger grades (fewer pieces)
function getSimplePieces(count: number): TangramPiece[] {
  return STANDARD_PIECES.slice(0, count);
}

// =============================================================================
// TANGRAM CONTENT DATA
// Organized by grade, then difficulty
// =============================================================================

const TANGRAM_CONTENT: Record<Grade, Record<Difficulty, TangramContentData[]>> = {
  // Grade א (1st grade) - Very simple, 3-4 pieces
  א: {
    easy: [
      {
        targetShape: "square",
        pieces: getSimplePieces(3),
      },
      {
        targetShape: "arrow",
        pieces: getSimplePieces(3),
      },
      {
        targetShape: "house",
        pieces: getSimplePieces(3),
      },
    ],
    medium: [
      {
        targetShape: "boat",
        pieces: getSimplePieces(4),
      },
      {
        targetShape: "tree",
        pieces: getSimplePieces(4),
      },
      {
        targetShape: "arrow",
        pieces: getSimplePieces(4),
      },
    ],
    hard: [
      {
        targetShape: "house",
        pieces: getSimplePieces(4),
      },
      {
        targetShape: "fish",
        pieces: getSimplePieces(4),
      },
      {
        targetShape: "boat",
        pieces: getSimplePieces(4),
      },
    ],
  },

  // Grade ב (2nd grade) - Simple, 4-5 pieces
  ב: {
    easy: [
      {
        targetShape: "house",
        pieces: getSimplePieces(4),
      },
      {
        targetShape: "boat",
        pieces: getSimplePieces(4),
      },
      {
        targetShape: "arrow",
        pieces: getSimplePieces(4),
      },
    ],
    medium: [
      {
        targetShape: "fish",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "tree",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "heart",
        pieces: getSimplePieces(5),
      },
    ],
    hard: [
      {
        targetShape: "cat",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "bird",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "rabbit",
        pieces: getSimplePieces(5),
      },
    ],
  },

  // Grade ג (3rd grade) - Medium, 5-6 pieces
  ג: {
    easy: [
      {
        targetShape: "cat",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "fish",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "bird",
        pieces: getSimplePieces(5),
      },
    ],
    medium: [
      {
        targetShape: "rabbit",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "heart",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "person",
        pieces: getSimplePieces(6),
      },
    ],
    hard: [
      {
        targetShape: "swan",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "rocket",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "dinosaur",
        pieces: getSimplePieces(6),
      },
    ],
  },

  // Grade ד (4th grade) - Medium-complex, 5-7 pieces
  ד: {
    easy: [
      {
        targetShape: "bird",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "cat",
        pieces: getSimplePieces(5),
      },
      {
        targetShape: "rabbit",
        pieces: getSimplePieces(5),
      },
    ],
    medium: [
      {
        targetShape: "person",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "swan",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "rocket",
        pieces: getSimplePieces(6),
      },
    ],
    hard: [
      {
        targetShape: "runner",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "dinosaur",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "swan",
        pieces: STANDARD_PIECES,
      },
    ],
  },

  // Grade ה (5th grade) - Complex, 6-7 pieces
  ה: {
    easy: [
      {
        targetShape: "person",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "rocket",
        pieces: getSimplePieces(6),
      },
      {
        targetShape: "swan",
        pieces: getSimplePieces(6),
      },
    ],
    medium: [
      {
        targetShape: "runner",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "dinosaur",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "person",
        pieces: STANDARD_PIECES,
      },
    ],
    hard: [
      {
        targetShape: "swan",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "runner",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "rocket",
        pieces: STANDARD_PIECES,
      },
    ],
  },

  // Grade ו (6th grade) - Most complex, all 7 pieces
  ו: {
    easy: [
      {
        targetShape: "person",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "bird",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "cat",
        pieces: STANDARD_PIECES,
      },
    ],
    medium: [
      {
        targetShape: "runner",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "swan",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "rocket",
        pieces: STANDARD_PIECES,
      },
    ],
    hard: [
      {
        targetShape: "dinosaur",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "runner",
        pieces: STANDARD_PIECES,
      },
      {
        targetShape: "swan",
        pieces: STANDARD_PIECES,
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "tangram")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedTangramContent() {
  console.log("🧩 Starting Tangram game content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Tangram items in database.`);
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
      const contentSets = TANGRAM_CONTENT[grade][difficulty];

      console.log(`📝 Adding ${contentSets.length} tangram puzzles for grade ${grade}, ${difficulty}...`);

      for (const contentData of contentSets) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "tangram",
            grade,
            difficulty,
            targetShape: contentData.targetShape,
            pieces: contentData.pieces,
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
      TANGRAM_CONTENT[grade].easy.length +
      TANGRAM_CONTENT[grade].medium.length +
      TANGRAM_CONTENT[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} tangram puzzles`);
  }
}

// Run the seed
seedTangramContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
