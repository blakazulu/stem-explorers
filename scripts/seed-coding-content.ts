/**
 * Seed script for Coding Puzzles game content
 * Run with: npx tsx scripts/seed-coding-content.ts
 *
 * Creates visual programming puzzles for all grades (א-ו) and difficulties (easy/medium/hard)
 * 4 puzzles per grade/difficulty = 72 total
 *
 * Grade א-ב: 3x3 grid, no obstacles, basic moves only
 * Grade ג-ד: 4x4 grid, some obstacles, introduce loops
 * Grade ה-ו: 5x5 grid, complex paths, loops + conditionals
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

interface CodingObstacle {
  x: number;
  y: number;
}

interface CodingPuzzle {
  gridSize: number;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  obstacles: CodingObstacle[];
  maxMoves: number;
  allowLoops: boolean;
  allowConditionals: boolean;
}

// =============================================================================
// CODING PUZZLE DATA
// Organized by grade, then difficulty
// =============================================================================

const CODING_PUZZLES: Record<Grade, Record<Difficulty, CodingPuzzle[]>> = {
  // Grade א (1st grade) - 3x3 grid, no obstacles, very simple paths
  א: {
    easy: [
      // Puzzle 1: Move right
      {
        gridSize: 3,
        start: { x: 0, y: 1 },
        goal: { x: 2, y: 1 },
        obstacles: [],
        maxMoves: 3,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 2: Move down
      {
        gridSize: 3,
        start: { x: 1, y: 0 },
        goal: { x: 1, y: 2 },
        obstacles: [],
        maxMoves: 3,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 3: L-shape right then down
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        obstacles: [],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 4: Up and right
      {
        gridSize: 3,
        start: { x: 0, y: 2 },
        goal: { x: 2, y: 0 },
        obstacles: [],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
    medium: [
      // Puzzle 1: Zigzag
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        obstacles: [],
        maxMoves: 4,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 2: Corner to corner with single obstacle
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        obstacles: [{ x: 1, y: 1 }],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 3: Navigate around edge obstacle
      {
        gridSize: 3,
        start: { x: 0, y: 1 },
        goal: { x: 2, y: 1 },
        obstacles: [{ x: 1, y: 1 }],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 4: Two step path
      {
        gridSize: 3,
        start: { x: 1, y: 0 },
        goal: { x: 1, y: 2 },
        obstacles: [{ x: 0, y: 1 }],
        maxMoves: 4,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
    hard: [
      // Puzzle 1: Multiple obstacles
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
        ],
        maxMoves: 6,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 2: Winding path
      {
        gridSize: 3,
        start: { x: 0, y: 2 },
        goal: { x: 2, y: 0 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 0, y: 0 },
        ],
        maxMoves: 6,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 3: Narrow corridor
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 2, y: 1 },
        ],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      // Puzzle 4: Complex path
      {
        gridSize: 3,
        start: { x: 0, y: 1 },
        goal: { x: 2, y: 1 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 2 },
        ],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
  },

  // Grade ב (2nd grade) - 3x3 grid, few obstacles
  ב: {
    easy: [
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        obstacles: [],
        maxMoves: 3,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 0, y: 2 },
        goal: { x: 0, y: 0 },
        obstacles: [],
        maxMoves: 3,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 2, y: 0 },
        goal: { x: 0, y: 2 },
        obstacles: [],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 1, y: 1 },
        goal: { x: 2, y: 2 },
        obstacles: [],
        maxMoves: 3,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
    medium: [
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        obstacles: [{ x: 1, y: 1 }],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 2, y: 0 },
        goal: { x: 0, y: 2 },
        obstacles: [{ x: 1, y: 1 }],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 0, y: 1 },
        goal: { x: 2, y: 1 },
        obstacles: [{ x: 1, y: 0 }],
        maxMoves: 4,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 1, y: 0 },
        goal: { x: 1, y: 2 },
        obstacles: [{ x: 2, y: 1 }],
        maxMoves: 4,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
    hard: [
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 2 },
        ],
        maxMoves: 5,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 0, y: 2 },
        goal: { x: 2, y: 0 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        maxMoves: 6,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 3,
        start: { x: 2, y: 2 },
        goal: { x: 0, y: 0 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 0, y: 2 },
        ],
        maxMoves: 6,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
  },

  // Grade ג (3rd grade) - 4x4 grid, introduce loops
  ג: {
    easy: [
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 0 },
        obstacles: [],
        maxMoves: 4,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [],
        maxMoves: 7,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 3 },
        goal: { x: 3, y: 0 },
        obstacles: [],
        maxMoves: 7,
        allowLoops: false,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 1, y: 1 },
        goal: { x: 2, y: 2 },
        obstacles: [],
        maxMoves: 3,
        allowLoops: false,
        allowConditionals: false,
      },
    ],
    medium: [
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        maxMoves: 8,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 0 },
        obstacles: [{ x: 1, y: 0 }],
        maxMoves: 6,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 3 },
        goal: { x: 3, y: 0 },
        obstacles: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
        ],
        maxMoves: 8,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 1 },
        goal: { x: 3, y: 2 },
        obstacles: [{ x: 2, y: 1 }],
        maxMoves: 6,
        allowLoops: true,
        allowConditionals: false,
      },
    ],
    hard: [
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        maxMoves: 9,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 3 },
        goal: { x: 3, y: 0 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 3 },
        ],
        maxMoves: 9,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 0 },
          { x: 3, y: 1 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 3, y: 3 },
        goal: { x: 0, y: 0 },
        obstacles: [
          { x: 2, y: 2 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
        ],
        maxMoves: 9,
        allowLoops: true,
        allowConditionals: false,
      },
    ],
  },

  // Grade ד (4th grade) - 4x4 grid with more obstacles
  ד: {
    easy: [
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [{ x: 1, y: 1 }],
        maxMoves: 7,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 3 },
        goal: { x: 3, y: 0 },
        obstacles: [{ x: 2, y: 1 }],
        maxMoves: 7,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 0, y: 3 },
        obstacles: [{ x: 1, y: 2 }],
        maxMoves: 5,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 3, y: 0 },
        goal: { x: 0, y: 3 },
        obstacles: [{ x: 2, y: 2 }],
        maxMoves: 7,
        allowLoops: true,
        allowConditionals: false,
      },
    ],
    medium: [
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        maxMoves: 8,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 3 },
        goal: { x: 3, y: 0 },
        obstacles: [
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 1, y: 0 },
        ],
        maxMoves: 9,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 0 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
        maxMoves: 7,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 3, y: 3 },
        goal: { x: 0, y: 0 },
        obstacles: [
          { x: 2, y: 2 },
          { x: 1, y: 1 },
          { x: 0, y: 2 },
        ],
        maxMoves: 8,
        allowLoops: true,
        allowConditionals: false,
      },
    ],
    hard: [
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 3, y: 0 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 0, y: 3 },
        goal: { x: 3, y: 0 },
        obstacles: [
          { x: 0, y: 2 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
          { x: 2, y: 3 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 4,
        start: { x: 1, y: 0 },
        goal: { x: 2, y: 3 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 2 },
        ],
        maxMoves: 9,
        allowLoops: true,
        allowConditionals: false,
      },
    ],
  },

  // Grade ה (5th grade) - 5x5 grid with loops and more complexity
  ה: {
    easy: [
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [{ x: 2, y: 2 }],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        obstacles: [
          { x: 2, y: 2 },
          { x: 1, y: 1 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 0 },
        obstacles: [{ x: 2, y: 0 }],
        maxMoves: 7,
        allowLoops: true,
        allowConditionals: false,
      },
      {
        gridSize: 5,
        start: { x: 2, y: 2 },
        goal: { x: 4, y: 4 },
        obstacles: [{ x: 3, y: 3 }],
        maxMoves: 5,
        allowLoops: true,
        allowConditionals: false,
      },
    ],
    medium: [
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        obstacles: [
          { x: 1, y: 3 },
          { x: 2, y: 2 },
          { x: 3, y: 1 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ],
        maxMoves: 12,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 2 },
        goal: { x: 4, y: 2 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 1, y: 3 },
          { x: 2, y: 2 },
          { x: 3, y: 1 },
          { x: 3, y: 3 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: true,
      },
    ],
    hard: [
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
        ],
        maxMoves: 12,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        obstacles: [
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 1 },
          { x: 2, y: 3 },
          { x: 3, y: 0 },
          { x: 4, y: 1 },
        ],
        maxMoves: 14,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 1, y: 3 },
          { x: 2, y: 0 },
          { x: 2, y: 2 },
          { x: 3, y: 1 },
          { x: 3, y: 4 },
        ],
        maxMoves: 14,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 4, y: 4 },
        goal: { x: 0, y: 0 },
        obstacles: [
          { x: 3, y: 3 },
          { x: 2, y: 2 },
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 1, y: 3 },
          { x: 4, y: 2 },
        ],
        maxMoves: 14,
        allowLoops: true,
        allowConditionals: true,
      },
    ],
  },

  // Grade ו (6th grade) - 5x5 grid, complex mazes with all features
  ו: {
    easy: [
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        obstacles: [
          { x: 2, y: 2 },
          { x: 3, y: 1 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 2 },
        goal: { x: 4, y: 2 },
        obstacles: [
          { x: 2, y: 1 },
          { x: 2, y: 3 },
        ],
        maxMoves: 8,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 2, y: 0 },
        goal: { x: 2, y: 4 },
        obstacles: [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
        ],
        maxMoves: 8,
        allowLoops: true,
        allowConditionals: true,
      },
    ],
    medium: [
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 },
        ],
        maxMoves: 12,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        obstacles: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 2, y: 1 },
          { x: 4, y: 2 },
        ],
        maxMoves: 12,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 0, y: 3 },
          { x: 1, y: 1 },
          { x: 2, y: 3 },
          { x: 3, y: 1 },
          { x: 4, y: 3 },
        ],
        maxMoves: 12,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 4, y: 2 },
        goal: { x: 0, y: 2 },
        obstacles: [
          { x: 3, y: 1 },
          { x: 3, y: 3 },
          { x: 2, y: 2 },
          { x: 1, y: 1 },
          { x: 1, y: 3 },
        ],
        maxMoves: 10,
        allowLoops: true,
        allowConditionals: true,
      },
    ],
    hard: [
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 },
        ],
        maxMoves: 14,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        obstacles: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 1, y: 0 },
          { x: 2, y: 4 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 3, y: 0 },
        ],
        maxMoves: 14,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        obstacles: [
          { x: 0, y: 1 },
          { x: 1, y: 3 },
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 3 },
          { x: 3, y: 1 },
          { x: 4, y: 3 },
        ],
        maxMoves: 15,
        allowLoops: true,
        allowConditionals: true,
      },
      {
        gridSize: 5,
        start: { x: 4, y: 4 },
        goal: { x: 0, y: 0 },
        obstacles: [
          { x: 4, y: 3 },
          { x: 3, y: 3 },
          { x: 3, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 1 },
          { x: 1, y: 3 },
          { x: 0, y: 3 },
        ],
        maxMoves: 15,
        allowLoops: true,
        allowConditionals: true,
      },
    ],
  },
};

async function checkExistingContent(): Promise<number> {
  const q = query(
    collection(db, "gameContent"),
    where("gameType", "==", "coding")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

async function seedCodingContent() {
  console.log("🤖 Starting Coding Puzzles game content seeding...\n");

  // Check for existing content
  const existingCount = await checkExistingContent();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing Coding items in database.`);
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
      const puzzles = CODING_PUZZLES[grade][difficulty];

      console.log(
        `📝 Adding ${puzzles.length} coding puzzles for grade ${grade}, ${difficulty}...`
      );

      for (const puzzle of puzzles) {
        try {
          await addDoc(collection(db, "gameContent"), {
            gameType: "coding",
            grade,
            difficulty,
            gridSize: puzzle.gridSize,
            start: puzzle.start,
            goal: puzzle.goal,
            obstacles: puzzle.obstacles,
            maxMoves: puzzle.maxMoves,
            allowLoops: puzzle.allowLoops,
            allowConditionals: puzzle.allowConditionals,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          totalAdded++;
        } catch (error) {
          console.error(`   ❌ Failed to add puzzle:`, error);
          errors++;
        }
      }
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Total puzzles added: ${totalAdded}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }

  // Summary by grade
  console.log("\n📊 Content summary:");
  for (const grade of grades) {
    const gradeTotal =
      CODING_PUZZLES[grade].easy.length +
      CODING_PUZZLES[grade].medium.length +
      CODING_PUZZLES[grade].hard.length;
    console.log(`   Grade ${grade}: ${gradeTotal} coding puzzles`);
  }
}

// Run the seed
seedCodingContent()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
